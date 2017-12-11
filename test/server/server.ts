import {TestRequest, TestResponse} from "../models";
import {startServer} from "taco-bell-server";
startServer([
    {
        path: '/remote',
        method: 'GET',
        validate: (params: TestRequest): boolean => {
            return params.a.get() == 'a' && params.b.get() == 'b';
        },
        handle: (params: TestRequest): TestResponse => {
            let o = new TestResponse();
            o.c.set('C');
            o.d.set(true);
            return o;
        },
        request: () => { return new TestRequest(); }
    },
    {
        path: '/remote',
        method: 'POST',
        handle: (params: TestRequest): undefined => {
            return undefined;
        }
    }
]);