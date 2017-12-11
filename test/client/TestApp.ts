import {
    ModelElement,
    Component,
    ComponentQueue,
    Collection,
    ModelArray,
    HttpStream,
    httpGetHandler,
    httpPostHandler
} from "../../index";
import {TestRequest, TestResponse, ErrorInterceptor, ErrorResponse} from "../models";
import {HtmlAttributeName} from "../../src/Html";

class Model {
    readonly title: ModelElement<string> = new ModelElement<string>("Title 1");
    readonly titleClass: ModelElement<string> = new ModelElement<string>("title");
    readonly items: ModelArray<string> = new ModelArray<string>();
    readonly buttonText: ModelElement<string> = new ModelElement<string>("Hide");
    readonly inputValue: ModelElement<string> = new ModelElement<string>("");
    readonly request = new TestRequest();
    readonly response = new TestResponse();
    readonly errorInterceptor = new ErrorInterceptor();
}

const model = new Model();

const getStream = new HttpStream<TestRequest, TestResponse, ErrorResponse>("/remote", model.errorInterceptor)
    .withSubscriber(model.response);

const postStream = new HttpStream<TestRequest,undefined,ErrorResponse>("/remote");

const cycleSize = new ModelElement<number>(ComponentQueue.size());
const cycleButton = new Component('button', document.getElementById("app-root"))
    .withAttribute('id','CycleButton')
    .withAttribute('data-component-queue-size' as HtmlAttributeName, cycleSize)
    .withClass('cycle')
    .on('click', () => {
        ComponentQueue.cycle();
        cycleSize.set(ComponentQueue.size());
    });
new Component('button', document.getElementById("app-root"))
    .withAttribute('id','change-title-text-btn')
    .on('click', () => {
        model.title.set('Title 2');
        ComponentQueue.cycle();
        cycleSize.set(ComponentQueue.size());
    });

new Component('button', document.getElementById("app-root"))
    .withAttribute('id','add-item-btn')
    .on('click', () => {
        model.items.add('item');
    });

// Only initiate the cycle button
ComponentQueue.cycle();

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
        .withAttribute("type", "text")
        .withValue(model.inputValue)
).child(
    new Component("button")
        .withAttribute("id", "getRemoteButton")
        .withText("get remote")
        .on("click", httpGetHandler(getStream, model.request)),
    new Component("p")
        .withAttribute("id", "pc")
        .withText(model.response.c),
    new Component("p")
        .withAttribute("id", "pd")
        .withText(model.response.d),
    new Component("button")
        .withAttribute("id", "postRemoteButton")
        .withText("post remote")
        .on("click", httpPostHandler(postStream, model.request)),
    new Component("button")
        .withAttribute("id", "badGetRequestButton")
        .withText("send bad GET request")
        .on("click", () => {
            getStream.get(null);
        }),
    new Component("p")
        .withAttribute("id", "errorMessage")
        .withText(model.errorInterceptor.body.message)
);

window["model"] = model;
window["queue"] = ComponentQueue;