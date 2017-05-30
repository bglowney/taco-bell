"use strict";
const ModelElement_1 = require("../src/ModelElement");
const Component_1 = require("../src/Component");
const ComponentQueue_1 = require("../src/ComponentQueue");
const Collection_1 = require("../src/Collection");
const ModelArray_1 = require("../src/ModelArray");
class Model {
    constructor() {
        this.title = new ModelElement_1.ModelElement("Title 1");
        this.titleClass = new ModelElement_1.ModelElement("title");
        this.items = new ModelArray_1.ModelArray();
        this.buttonText = new ModelElement_1.ModelElement("Hide");
        this.inputValue = new ModelElement_1.ModelElement("");
    }
}
const model = new Model();
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
    .withValue(model.inputValue));
window["model"] = model;
window["queue"] = ComponentQueue_1.ComponentQueue;
