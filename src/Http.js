"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelElement_1 = require("./ModelElement");
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractSerializable {
    serialize() {
        return serialize.call(this);
    }
    deserialize(data) {
        deserialize.call(this, data);
    }
}
exports.AbstractSerializable = AbstractSerializable;
function instanceofDeserializable(o) {
    if (typeof o === "object" && o != null)
        return "deserialize" in o && (typeof o["deserialize"] === "function");
    return false;
}
exports.instanceofDeserializable = instanceofDeserializable;
function instanceofSerializable(o) {
    if (typeof o === "object" && o != null)
        return "serialize" in o && (typeof o["serialize"] === "function");
    return false;
}
exports.instanceofSerializable = instanceofSerializable;
function serialize() {
    function toPlainObject() {
        const plainObject = {};
        for (let k in this) {
            const v = this[k];
            if (v instanceof ModelElement_1.ModelElement) {
                const meo = v.get();
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
exports.serialize = serialize;
function deserialize(str) {
    const response = JSON.parse(str);
    for (let k in this) {
        if (k in response && this[k] instanceof ModelElement_1.ModelElement) {
            let v = response[k];
            if (typeof v === "object")
                deserialize.call(this[k], v);
            else
                this[k].set(v);
        }
    }
}
exports.deserialize = deserialize;
class HttpStream {
    constructor(baseURL, interceptor) {
        this.subscribers = [];
        this.baseURL = baseURL;
        this.interceptor = interceptor;
    }
    withInterceptor(interceptor) {
        this.interceptor = interceptor;
        return this;
    }
    withSubscriber(subscriber) {
        this.subscribers.push(subscriber);
        return this;
    }
    get(params) {
        this.sendGet(this.baseURL, params);
    }
    post(data) {
        this.send("POST", this.baseURL, data);
    }
    put(data) {
        this.send("PUT", this.baseURL, data);
    }
    delete(data) {
        this.send("DELETE", this.baseURL, data);
    }
    serializeParams(data) {
        if (data === null || data === undefined)
            return "";
        if (instanceofSerializable(data)) {
            return data.serialize();
        }
        else if (data instanceof ModelElement_1.ModelElement) {
            return JSON.stringify(data.get());
        }
        else if (typeof data === "string") {
            return data;
        }
        else {
            return JSON.stringify(data);
        }
    }
    sendGet(url, params) {
        let queryStr = params == null ? "" : "?";
        let delim = "";
        for (let key in params) {
            if (!params.hasOwnProperty(key))
                continue;
            queryStr += delim;
            delim = "&";
            queryStr += encodeURIComponent(key);
            queryStr += "=";
            let v;
            if (params[key] instanceof ModelElement_1.ModelElement)
                v = params[key].get();
            else
                v = params[key];
            queryStr += encodeURIComponent(v != undefined ? v.toString() : "");
        }
        this.send("GET", url + queryStr);
    }
    send(method, url, params) {
        const self = this;
        const request = new XMLHttpRequest();
        request.onload = function (ev) {
            if (self.interceptor != undefined) {
                self.interceptor.statusCode.set(this.status);
                if (self.interceptor.body instanceof ModelElement_1.ModelElement)
                    self.interceptor.body.set(JSON.parse(this.responseText));
                else
                    self.interceptor.body.deserialize(this.responseText);
            }
            for (let subscriber of self.subscribers) {
                if (subscriber instanceof ModelElement_1.ModelElement) {
                    subscriber.set(JSON.parse(this.responseText));
                }
                else if (instanceofDeserializable(subscriber)) {
                    subscriber.deserialize(this.responseText);
                }
                else {
                    subscriber(JSON.parse(this.responseText));
                }
            }
            ComponentQueue_1.ComponentQueue.cycle();
        };
        request.open(method, url, true);
        if (method === "POST" || method === "PUT")
            request.setRequestHeader("Content-Type", "application/json");
        request.send(this.serializeParams(params));
    }
}
exports.HttpStream = HttpStream;
function httpGetHandler(stream, params) {
    return function (event) {
        stream.get(params);
    };
}
exports.httpGetHandler = httpGetHandler;
function httpPostHandler(stream, params) {
    return function (event) {
        stream.post(params);
    };
}
exports.httpPostHandler = httpPostHandler;
function httpPutHandler(stream, params) {
    return function (event) {
        stream.put(params);
    };
}
exports.httpPutHandler = httpPutHandler;
function httpDeleteHandler(stream, params) {
    return function (event) {
        stream.delete(params);
    };
}
exports.httpDeleteHandler = httpDeleteHandler;
