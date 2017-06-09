"use strict";
const ModelArray_1 = require("./ModelArray");
const Component_1 = require("./Component");
class Collection extends Component_1.Component {
    children(model, onAddCallback) {
        model.registerAddCallback(this, addItem.bind(this));
        function addItem(newItem, k) {
            let i = k || (model instanceof ModelArray_1.ModelArray ? model.size.get() : "");
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.child(newComponent);
        }
        for (let k in model.get()) {
            let v = model.get()[k];
            addItem.call(this, v, k);
        }
        return this;
    }
}
exports.Collection = Collection;
