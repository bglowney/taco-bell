import {ModelElement} from "../src/ModelElement";
import {Component} from "../src/Component";
import {ComponentQueue} from "../src/ComponentQueue";
import {Collection} from "../src/Collection";
import {ModelArray} from "../src/ModelArray";
import {httpStreamHandler, HttpStream, AbstractSerializable, HttpResponseInterceptor} from "../src/Http";

class ErrorInterceptor implements HttpResponseInterceptor<ErrorResponse> {
    readonly statusCode = new ModelElement<number>();
    readonly body = new ErrorResponse();
}

class Request extends AbstractSerializable{
    readonly a = new ModelElement<string>("a");
    readonly b = new ModelElement<string>("b");
}

class Response extends AbstractSerializable {
    readonly c = new ModelElement<string>();
    readonly d = new ModelElement<boolean>();
}

class ErrorResponse extends AbstractSerializable {
    readonly success = new ModelElement<boolean>();
    readonly message = new ModelElement<string>();
}

class Model {
    readonly title: ModelElement<string> = new ModelElement<string>("Title 1");
    readonly titleClass: ModelElement<string> = new ModelElement<string>("title");
    readonly items: ModelArray<string> = new ModelArray<string>();
    readonly buttonText: ModelElement<string> = new ModelElement<string>("Hide");
    readonly inputValue: ModelElement<string> = new ModelElement<string>("");
    readonly request = new Request();
    readonly response = new Response();
    readonly errorInterceptor = new ErrorInterceptor();
}

const model = new Model();

const getStream = new HttpStream<Request, Response, ErrorResponse>("/remote", model.errorInterceptor)
    .withSubscriber(model.response);

const postStream = new HttpStream<Request,undefined,ErrorResponse>("/remote");

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
    ).child(
        new Component("button")
            .withAttribute("id", "getRemoteButton")
            .withText("get remote")
            .on("click", httpStreamHandler(getStream, "GET", model.request)),
        new Component("p")
            .withAttribute("id","pc")
            .withText(model.response.c),
        new Component("p")
            .withAttribute("id","pd")
            .withText(model.response.d),
        new Component("button")
            .withAttribute("id", "postRemoteButton")
            .withText("post remote")
            .on("click", httpStreamHandler(postStream, "POST", model.request)),
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