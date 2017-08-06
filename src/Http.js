"use strict";
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
function instanceofSerializable(o) {
    if (typeof o === "object" && o != null)
        return "serialize" in o && (typeof o["serialize"] === "function");
    return false;
}
function serialize() {
    function toPlainObject() {
        const plainObject = {};
        for (let k in this) {
            const v = this[k];
            if (v instanceof ModelElement_1.ModelElement) {
                const meo = v.get;
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
    withSubscriber(subscriber) {
        this.subscribers.push(subscriber);
        return this;
    }
    get(params) {
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
        this.send("GET", this.baseURL + queryStr);
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
            if (method === "GET") {
                for (let subscriber of self.subscribers) {
                    if (instanceofDeserializable(subscriber)) {
                        subscriber.deserialize(this.responseText);
                    }
                    else {
                        subscriber.set(JSON.parse(this.responseText));
                    }
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
function httpStreamHandler(stream, method, params) {
    return function (event) {
        switch (method) {
            case "GET":
                stream.get(params);
                break;
            case "POST":
                stream.post(params);
                break;
            case "PUT":
                stream.put(params);
                break;
            case "DELETE":
                stream.delete(params);
                break;
        }
    };
}
exports.httpStreamHandler = httpStreamHandler;
