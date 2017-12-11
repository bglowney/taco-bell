"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractComponent_1 = require("./AbstractComponent");
const ComponentQueue_1 = require("./ComponentQueue");
class Component extends AbstractComponent_1.AbstractComponent {
    constructor() {
        super(...arguments);
        this.addedChildren = new Set();
    }
    child(x) {
        let components;
        if (x instanceof Array)
            components = x;
        else
            components = Array.prototype.slice.call(arguments);
        for (let component of components) {
            component.setParent(this);
            this.addedChildren.add(component);
        }
        ComponentQueue_1.ComponentQueue.add(this);
        return this;
    }
    reinit(immediate = false) {
        super.reinit(immediate);
        this.flushChildren();
    }
    flushChildren() {
        for (let child of this.addedChildren.values())
            this.element.appendChild(child.getElement());
        this.addedChildren.clear();
    }
}
exports.Component = Component;
