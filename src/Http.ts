import {ComponentEventHandler} from "./Binding";
import {ModelElement} from "./ModelElement";
import {AbstractComponent} from "./AbstractComponent";
import {ComponentQueue} from "./ComponentQueue";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface Serializable {
    serialize(): string;
}

export abstract class AbstractSerializable implements Serializable, Deserializable {
    serialize(): string {
        return serialize.call(this);
    }

    deserialize(data: Object): void {
        deserialize.call(this, data);
    }
}

export interface Deserializable {
    deserialize(data: Object): void;
}

function instanceofDeserializable(o: any): boolean {
    if (typeof o === "object" && o != null)
        return "deserialize" in o && (typeof o["deserialize"] === "function");

    return false;
}

function instanceofSerializable(o: any): boolean {
    if (typeof o === "object" && o != null)
        return "serialize" in o && (typeof o["serialize"] === "function");

    return false;
}

// this is a default serialization function
export function serialize(this: Serializable): string {

    function toPlainObject(this: Object): Object {
        const plainObject = {};
        for (let k in this) {
            const v = this[k];
            if (v instanceof ModelElement) {
                const meo = (v as ModelElement<any>).get;
                if (typeof meo === "object")
                    plainObject[k] = toPlainObject.call(meo);
                else
                    plainObject[k] = meo;
            }
        }
        return plainObject;
    }

    return JSON.stringify(toPlainObject.call(this));
}

// this is a default deserialization function
export function deserialize(this: Deserializable, str: string): void {
    const response = JSON.parse(str);
    for (let k in this) {
        if (k in response && this[k] instanceof ModelElement) {
            let v = response[k];
            if (typeof v === "object")
                deserialize.call(this[k], v);
            else
                (this[k] as ModelElement<any>).set(v);
        }
    }
}

export interface HttpResponseInterceptor<E> {
    statusCode: ModelElement<number>;
    body?: ModelElement<E> | Deserializable;
}

interface ToStringable {
    toString: () => string
}

export interface HttpGetParams { [key: string]: ModelElement<ToStringable> | ToStringable };

type HttpNonIdempotentParams = Serializable | ModelElement<any> | any;

export class HttpStream<P extends HttpNonIdempotentParams,R,E> {

    protected subscribers: Array<ModelElement<R> | Deserializable> = [];
    protected baseURL: string;
    protected interceptor: HttpResponseInterceptor<E>;

    constructor(baseURL: string, interceptor?: HttpResponseInterceptor<E>) {
        this.baseURL = baseURL;
        this.interceptor = interceptor;
    }

    withSubscriber(subscriber: ModelElement<R> | Deserializable): this {
        this.subscribers.push(subscriber);
        return this;
    }

    get(params: HttpGetParams): void {
        this.sendGet(this.baseURL, params);
    }

    post(data: P): void {
        this.send("POST", this.baseURL, data);
    }

    put(data: P): void {
        this.send("PUT", this.baseURL, data);
    }

    delete(data: P): void {
        this.send("DELETE", this.baseURL, data);
    }

    private serializeParams(data: P): string {
        if (data === null || data === undefined)
            return "";

        if (instanceofSerializable(data)) {
            return (data as any as Serializable).serialize()
        } else if (data instanceof ModelElement) {
            return JSON.stringify((data as ModelElement<any>).get());
        } else if (typeof data === "string") {
            return data as any as string;
        }
        // number, boolean, object
        else {
            return JSON.stringify(data);
        }
    }

    protected sendGet(url: string, params?: HttpGetParams): void {
        let queryStr = params == null ? "" : "?";

        let delim = "";
        for (let key in params) {
            if (!params.hasOwnProperty(key)) continue;
            queryStr += delim;
            delim = "&";
            queryStr += encodeURIComponent(key);
            queryStr += "=";
            let v;
            if (params[key] instanceof ModelElement)
                v = (params[key] as ModelElement<any>).get();
            else
                v = params[key];
            queryStr += encodeURIComponent(v != undefined ? v.toString() : "");
        }
        this.send("GET", url + queryStr);
    }

    protected send(method: HttpMethod, url: string, params?: P): void {
        const self = this;
        const request = new XMLHttpRequest();

        request.onload = function (this: XMLHttpRequest, ev: Event): void {
            if(self.interceptor != undefined) {
                self.interceptor.statusCode.set(this.status);
                if (self.interceptor.body instanceof ModelElement)
                    self.interceptor.body.set(JSON.parse(this.responseText));
                else
                    (self.interceptor.body as Deserializable).deserialize(this.responseText);
            }

            if (method === "GET") {

                for (let subscriber of self.subscribers) {
                    if (instanceofDeserializable(subscriber)) {
                        (subscriber as Deserializable).deserialize(this.responseText);
                    } else {
                        (subscriber as ModelElement<R>).set(JSON.parse(this.responseText));
                    }
                }

            }

            ComponentQueue.cycle();
        };

        request.open(method, url, true);
        if (method === "POST" || method === "PUT")
            request.setRequestHeader("Content-Type", "application/json");
        request.send(this.serializeParams(params));
    }

}

export function httpGetHandler<P,C extends AbstractComponent> (stream: HttpStream<P,any,any>, params: HttpGetParams): ComponentEventHandler<C> {
    return function (this: C, event: Event): void {
        stream.get(params);
    }
}

export function httpPostHandler<P,C extends AbstractComponent> (stream: HttpStream<P,any,any>, params: P): ComponentEventHandler<C> {
    return function (this: C, event: Event): void {
        stream.post(params);
    }
}

export function httpPutHandler<P,C extends AbstractComponent> (stream: HttpStream<P,any,any>, params: P): ComponentEventHandler<C> {
    return function (this: C, event: Event): void {
        stream.put(params);
    }
}

export function httpDeleteHandler<P,C extends AbstractComponent> (stream: HttpStream<P,any,any>, params: P): ComponentEventHandler<C> {
    return function (this: C, event: Event): void {
        stream.delete(params);
    }
}