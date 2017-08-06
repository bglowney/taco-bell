"use strict";
const ModelElement_1 = require("../src/ModelElement");
const Component_1 = require("../src/Component");
const ComponentQueue_1 = require("../src/ComponentQueue");
const Collection_1 = require("../src/Collection");
const ModelArray_1 = require("../src/ModelArray");
const Http_1 = require("../src/Http");
class ErrorInterceptor {
    constructor() {
        this.statusCode = new ModelElement_1.ModelElement();
        this.body = new ErrorResponse();
    }
}
class Request extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.a = new ModelElement_1.ModelElement("a");
        this.b = new ModelElement_1.ModelElement("b");
    }
}
class Response extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.c = new ModelElement_1.ModelElement();
        this.d = new ModelElement_1.ModelElement();
    }
}
class ErrorResponse extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.success = new ModelElement_1.ModelElement();
        this.message = new ModelElement_1.ModelElement();
    }
}
class Model {
    constructor() {
        this.title = new ModelElement_1.ModelElement("Title 1");
        this.titleClass = new ModelElement_1.ModelElement("title");
        this.items = new ModelArray_1.ModelArray();
        this.buttonText = new ModelElement_1.ModelElement("Hide");
        this.inputValue = new ModelElement_1.ModelElement("");
        this.request = new Request();
        this.response = new Response();
        this.errorInterceptor = new ErrorInterceptor();
    }
}
const model = new Model();
const getStream = new Http_1.HttpStream("/remote", model.errorInterceptor)
    .withSubscriber(model.response);
const postStream = new Http_1.HttpStream("/remote");
new Component_1.Component("section", document.getElementById("app-root"))
    .child(new Component_1.Component("header")
    .withAttribute("id", "header")
    .withClass(model.titleClass)
    .child(new Component_1.Component("h1")
    .withAttribute("id", "header-title")
    .withText(model.title))).child(new Collection_1.Collection("ul")
    .withAttribute("id", "items")
    .children(model.items, (item) => {
    return new Component_1.Component("li").withText(item);
})).child(new Component_1.Component("button")
    .withAttribute("id", "button")
    .withText(model.buttonText)
    .on("click", () => {
    model.titleClass.set("hidden");
})).child(new Component_1.Component("input")
    .withAttribute("id", "input")
    .withAttribute("type", "text")
    .withValue(model.inputValue)).child(new Component_1.Component("button")
    .withAttribute("id", "getRemoteButton")
    .withText("get remote")
    .on("click", Http_1.httpStreamHandler(getStream, "GET", model.request)), new Component_1.Component("p")
    .withAttribute("id", "pc")
    .withText(model.response.c), new Component_1.Component("p")
    .withAttribute("id", "pd")
    .withText(model.response.d), new Component_1.Component("button")
    .withAttribute("id", "postRemoteButton")
    .withText("post remote")
    .on("click", Http_1.httpStreamHandler(postStream, "POST", model.request)), new Component_1.Component("button")
    .withAttribute("id", "badGetRequestButton")
    .withText("send bad GET request")
    .on("click", () => {
    getStream.get(null);
}), new Component_1.Component("p")
    .withAttribute("id", "errorMessage")
    .withText(model.errorInterceptor.body.message));
window["model"] = model;
window["queue"] = ComponentQueue_1.ComponentQueue;
