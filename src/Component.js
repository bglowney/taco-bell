"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
class Component extends AbstractComponent_1.AbstractComponent {
    child(x) {
        let components;
        if (x instanceof Array)
            components = x;
        else
            components = Array.prototype.slice.call(arguments);
        for (let component of components) {
            component.setParent(this);
            this.element.appendChild(component.getElement());
        }
        return this;
    }
}
exports.Component = Component;
