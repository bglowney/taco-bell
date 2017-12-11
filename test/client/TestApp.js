"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const models_1 = require("../models");
class Model {
    constructor() {
        this.title = new index_1.ModelElement("Title 1");
        this.titleClass = new index_1.ModelElement("title");
        this.items = new index_1.ModelArray();
        this.buttonText = new index_1.ModelElement("Hide");
        this.inputValue = new index_1.ModelElement("");
        this.request = new models_1.TestRequest();
        this.response = new models_1.TestResponse();
        this.errorInterceptor = new models_1.ErrorInterceptor();
    }
}
const model = new Model();
const getStream = new index_1.HttpStream("/remote", model.errorInterceptor)
    .withSubscriber(model.response);
const postStream = new index_1.HttpStream("/remote");
const cycleSize = new index_1.ModelElement(index_1.ComponentQueue.size());
const cycleButton = new index_1.Component('button', document.getElementById("app-root"))
    .withAttribute('id', 'CycleButton')
    .withAttribute('data-component-queue-size', cycleSize)
    .withClass('cycle')
    .on('click', () => {
    index_1.ComponentQueue.cycle();
    cycleSize.set(index_1.ComponentQueue.size());
});
new index_1.Component('button', document.getElementById("app-root"))
    .withAttribute('id', 'change-title-text-btn')
    .on('click', () => {
    model.title.set('Title 2');
    index_1.ComponentQueue.cycle();
    cycleSize.set(index_1.ComponentQueue.size());
});
new index_1.Component('button', document.getElementById("app-root"))
    .withAttribute('id', 'add-item-btn')
    .on('click', () => {
    model.items.add('item');
});
index_1.ComponentQueue.cycle();
new index_1.Component("section", document.getElementById("app-root"))
    .child(new index_1.Component("header")
    .withAttribute("id", "header")
    .withClass(model.titleClass)
    .child(new index_1.Component("h1")
    .withAttribute("id", "header-title")
    .withText(model.title))).child(new index_1.Collection("ul")
    .withAttribute("id", "items")
    .children(model.items, (item) => {
    return new index_1.Component("li").withText(item);
})).child(new index_1.Component("button")
    .withAttribute("id", "button")
    .withText(model.buttonText)
    .on("click", () => {
    model.titleClass.set("hidden");
})).child(new index_1.Component("input")
    .withAttribute("id", "input")
    .withAttribute("type", "text")
    .withValue(model.inputValue)).child(new index_1.Component("button")
    .withAttribute("id", "getRemoteButton")
    .withText("get remote")
    .on("click", index_1.httpGetHandler(getStream, model.request)), new index_1.Component("p")
    .withAttribute("id", "pc")
    .withText(model.response.c), new index_1.Component("p")
    .withAttribute("id", "pd")
    .withText(model.response.d), new index_1.Component("button")
    .withAttribute("id", "postRemoteButton")
    .withText("post remote")
    .on("click", index_1.httpPostHandler(postStream, model.request)), new index_1.Component("button")
    .withAttribute("id", "badGetRequestButton")
    .withText("send bad GET request")
    .on("click", () => {
    getStream.get(null);
}), new index_1.Component("p")
    .withAttribute("id", "errorMessage")
    .withText(model.errorInterceptor.body.message));
window["model"] = model;
window["queue"] = index_1.ComponentQueue;
