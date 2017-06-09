"use strict";
function _instanceofQueableComponent(obj) {
    return 'getParent' in obj
        && '_isDestroyed' in obj
        && '_remove' in obj
        && 'reinit' in obj;
}
exports._instanceofQueableComponent = _instanceofQueableComponent;
class _ComponentQueue {
    constructor() {
        this.queue = new Set();
    }
    add(component) {
        this.queue.add(component);
    }
    cycle() {
        for (let component of this.queue.values()) {
            if (_instanceofQueableComponent(component))
                this.resolveAncestor(component);
        }
        const queueToExecute = this.queue;
        this.queue = new Set();
        const cycleRootToExecute = this.cycleRoot;
        this.cycleRoot = null;
        if (queueToExecute.size == 0)
            return;
        let rootParent = cycleRootToExecute.getParent();
        let rootParentElement;
        if (rootParent instanceof Element)
            rootParentElement = rootParent;
        else
            rootParentElement = rootParent.getElement();
        var nextSibling = cycleRootToExecute.getElement().nextSibling;
        rootParentElement.removeChild(cycleRootToExecute.getElement());
        if (cycleRootToExecute._isDestroyed())
            return;
        for (let item of queueToExecute.values()) {
            if (_instanceofQueableComponent(item)) {
                let component = item;
                if (component._isDestroyed())
                    component._remove();
                else
                    component.reinit(true);
            }
            else {
                let element = item;
                element.doUpdate();
            }
        }
        if (nextSibling)
            rootParentElement.insertBefore(cycleRootToExecute.getElement(), nextSibling);
        else
            rootParentElement.appendChild(cycleRootToExecute.getElement());
    }
    resolveAncestor(other) {
        if (!this.cycleRoot) {
            this.cycleRoot = other;
            return;
        }
        let ancestor = other;
        while (ancestor && !(ancestor instanceof Element) &&
            (ancestor = ancestor.getParent())) {
            if (ancestor === this.cycleRoot)
                return;
        }
        this.cycleRoot = other;
    }
}
exports._ComponentQueue = _ComponentQueue;
exports.ComponentQueue = new _ComponentQueue();
