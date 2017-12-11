"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class ErrorInterceptor {
    constructor() {
        this.statusCode = new index_1.ModelElement();
        this.body = new ErrorResponse();
    }
}
exports.ErrorInterceptor = ErrorInterceptor;
class TestRequest {
    constructor() {
        this.a = new index_1.ModelElement("a");
        this.b = new index_1.ModelElement("b");
    }
}
exports.TestRequest = TestRequest;
class TestResponse extends index_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.c = new index_1.ModelElement();
        this.d = new index_1.ModelElement();
    }
}
exports.TestResponse = TestResponse;
class ErrorResponse extends index_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.success = new index_1.ModelElement();
        this.message = new index_1.ModelElement();
    }
}
exports.ErrorResponse = ErrorResponse;
