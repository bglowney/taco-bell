"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const taco_bell_server_1 = require("taco-bell-server");
taco_bell_server_1.startServer([
    {
        path: '/remote',
        method: 'GET',
        validate: (params) => {
            return params.a.get() == 'a' && params.b.get() == 'b';
        },
        handle: (params) => {
            let o = new models_1.TestResponse();
            o.c.set('C');
            o.d.set(true);
            return o;
        },
        request: () => { return new models_1.TestRequest(); }
    },
    {
        path: '/remote',
        method: 'POST',
        handle: (params) => {
            return undefined;
        }
    }
]);
