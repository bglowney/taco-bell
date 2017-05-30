"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
class FunctionalElement extends AbstractComponent_1.AbstractElement {
    constructor(handler, ...listenedTo) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo || [];
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }
    get() {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model) {
            return model.get();
        }));
    }
    subscribe(remoteStream) {
        throw "Not implemented";
    }
}
exports.FunctionalElement = FunctionalElement;
