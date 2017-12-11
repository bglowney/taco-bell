// be careful to import from index
// this should reflect what an external consumer of taco-bell will work with
import {HttpResponseInterceptor, ModelElement, HttpGetParams, AbstractSerializable} from "../index";

export class ErrorInterceptor implements HttpResponseInterceptor<ErrorResponse> {
    readonly statusCode = new ModelElement<number>();
    readonly body = new ErrorResponse();
}

export class TestRequest implements HttpGetParams {
    [key: string]: ModelElement<any>;
    readonly a = new ModelElement<string>("a");
    readonly b = new ModelElement<string>("b");
}

export class TestResponse extends AbstractSerializable {
    readonly c = new ModelElement<string>();
    readonly d = new ModelElement<boolean>();
}

export class ErrorResponse extends AbstractSerializable {
    readonly success = new ModelElement<boolean>();
    readonly message = new ModelElement<string>();
}