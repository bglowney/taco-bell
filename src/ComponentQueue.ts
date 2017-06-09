// These two interfaces are just here to avoid circular dependencies
// with AbstractComponent and AbstractElement
// caused by the commonjs implementation of requirejs
// created by using the ComponentQueue
// members prefixed with an underscore should only be called in core code
// We do not these interfaces in index.ts
export interface _QueableComponent {
    getParent(): this | Element;
    getElement(): Element;
    _isDestroyed(): boolean;
    _remove(): void;
    reinit(immediate: boolean): void;
}

export interface _QueableElement {
    doUpdate(): void;
}

// need this custom instanceof check for checking interfaces
export function _instanceofQueableComponent(obj: Object): boolean {
    return 'getParent' in obj
        && '_isDestroyed' in obj
        && '_remove' in obj
        && 'reinit' in obj;
}

// singleton
export class _ComponentQueue {

    protected queue: Set<_QueableComponent | _QueableElement> = new Set<_QueableComponent | _QueableElement>();
    protected cycleRoot: _QueableComponent;

    public add(component: _QueableComponent): void {
        this.queue.add(component);
    }

    public cycle(): void {
        for (let component of this.queue.values()) {
            if (_instanceofQueableComponent(component))
                this.resolveAncestor(component as _QueableComponent);
        }

        // reset queue to absorb any changes in the meantime
        const queueToExecute = this.queue;
        this.queue = new Set();
        const cycleRootToExecute = this.cycleRoot;
        this.cycleRoot = null;

        if (queueToExecute.size == 0) return;

        let rootParent = cycleRootToExecute.getParent();
        let rootParentElement: Element;
        if (rootParent instanceof Element)
            rootParentElement = rootParent as Element;
        else
            rootParentElement = rootParent.getElement();

        var nextSibling = cycleRootToExecute.getElement().nextSibling;
        rootParentElement.removeChild(cycleRootToExecute.getElement());

        // if the cycle root is destroyed, do not replace it
        // and do not make updates to child nodes
        if (cycleRootToExecute._isDestroyed()) return;

        for (let item of queueToExecute.values()) {
            if (_instanceofQueableComponent(item)) {
                let component = item as _QueableComponent;
                if (component._isDestroyed())
                    component._remove();
                else
                    component.reinit(true);
            }
            else {
                let element = item as _QueableElement;
                element.doUpdate();
            }
        }

        // if the nextSibling exists, replace the node back before it
        // otherwise just append it to the parent's children
        if (nextSibling)
            rootParentElement.insertBefore(cycleRootToExecute.getElement(), nextSibling);
        else
            rootParentElement.appendChild(cycleRootToExecute.getElement());
    }

    protected resolveAncestor(other: _QueableComponent): void {
        if (!this.cycleRoot) {
            this.cycleRoot = other;
            return;
        }

        // if no ancestor of other is cycleRoot, then other is the new cycleRoot
        // otherwise make no change
        let ancestor: _QueableComponent | Element = other;
        while (ancestor && !(ancestor instanceof Element) &&
        (ancestor = (ancestor as _QueableComponent).getParent())) {
            if (ancestor === this.cycleRoot)
                return;
        }

        this.cycleRoot = other;
    }

}

export const ComponentQueue = new _ComponentQueue();