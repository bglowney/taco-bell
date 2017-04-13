"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
const ModelArray_1 = require("./ModelArray");
class Collection extends AbstractComponent_1.AbstractComponent {
    children(model, onAddCallback) {
        model.registerAddCallback(this, function (newItem) {
            let i = model instanceof ModelArray_1.ModelArray ? model.size.get() : "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.element.appendChild(newComponent.getElement());
        }.bind(this));
        return this;
    }
}
exports.Collection = Collection;
