"use strict";
const ModelArray_1 = require("./ModelArray");
const Component_1 = require("./Component");
class Collection extends Component_1.Component {
    children(model, onAddCallback) {
        model.registerAddCallback(this, function (newItem) {
            let i = model instanceof ModelArray_1.ModelArray ? model.size.get() : "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.child(newComponent);
        }.bind(this));
        return this;
    }
}
exports.Collection = Collection;
