"use strict";
const AbstractElement_1 = require("./AbstractElement");
class FunctionalElement extends AbstractElement_1.AbstractElement {
    constructor(handler, ...listenedTo) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo || [];
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }
    listensTo(listenedTo) {
        this.listenedTo.push(listenedTo);
        listenedTo.registerCallback(listenedTo, this.doUpdate.bind(this));
        return this;
    }
    get() {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model) {
            return model.get();
        }));
    }
}
exports.FunctionalElement = FunctionalElement;
