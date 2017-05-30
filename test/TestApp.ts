import {ModelElement} from "../src/ModelElement";
import {Component} from "../src/Component";
import {ComponentQueue} from "../src/ComponentQueue";
import {Collection} from "../src/Collection";
import {ModelArray} from "../src/ModelArray";

class Model {
    readonly title: ModelElement<string> = new ModelElement<string>("Title 1");
    readonly titleClass: ModelElement<string> = new ModelElement<string>("title");
    readonly items: ModelArray<string> = new ModelArray<string>();
    readonly buttonText: ModelElement<string> = new ModelElement<string>("Hide");
    readonly inputValue: ModelElement<string> = new ModelElement<string>("");
}

const model = new Model();

new Component("section", document.getElementById("app-root"))
    .child(
        new Component("header")
            .withAttribute("id", "header")
            .withClass(model.titleClass)
            .child(
                new Component("h1")
                    .withAttribute("id", "header-title")
                    .withText(model.title)
            )
    ).child(
        new Collection("ul")
            .withAttribute("id", "items")
            .children(model.items, (item: ModelElement<string>): Component => {
                return new Component("li").withText(item);
            })
    ).child(
        new Component("button")
            .withAttribute("id", "button")
            .withText(model.buttonText)
            .on("click", () => {
                model.titleClass.set("hidden")
            })
    ).child(
        new Component("input")
            .withAttribute("id", "input")
            .withAttribute("type","text")
            .withValue(model.inputValue)
    );

window["model"] = model;
window["queue"] = ComponentQueue;