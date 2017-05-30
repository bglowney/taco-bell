"use strict";
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractElement {
    destroy() {
        if (!this.boundComponents)
            return;
        for (let component of this.boundComponents.values())
            component.destroy();
    }
    bindComponent(component) {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }
    registerCallback(component, updateCallback) {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();
        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.updateCallbacks)
            return;
        if (!callback)
            this.updateCallbacks.delete(component);
        else if (this.updateCallbacks.has(component)) {
            let set = this.updateCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
    doUpdate() {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.get());
        }
        for (let key of this.updateCallbacks.keys()) {
            if (ComponentQueue_1._instanceofQueableComponent(key))
                ComponentQueue_1.ComponentQueue.add(key);
        }
    }
}
exports.AbstractElement = AbstractElement;
