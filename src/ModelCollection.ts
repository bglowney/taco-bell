import {ModelElement} from "./ModelElement";
import {Collection} from "./Collection";
import {UpdateCallback} from "./Binding";
import {AbstractComponent} from "./AbstractComponent";

export abstract class ModelCollection<M,V extends Object> extends ModelElement<V> {

    protected addCallbacks: Map<Collection,Set<UpdateCallback<ModelElement<M>,AbstractComponent>>>;

    registerAddCallback(component: Collection, addCallback: UpdateCallback<ModelElement<M>,AbstractComponent>): void {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();

        let callbackSet = this.addCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set<UpdateCallback<ModelElement<M>,AbstractComponent>>();
            this.addCallbacks.set(component, callbackSet);
        }
        callbackSet.add(addCallback);
    }

    unregisterCallback(component: Collection, callback?: UpdateCallback<ModelElement<M>,AbstractComponent>): void {
        if (!this.addCallbacks)
            return;

        if (!callback)
            this.addCallbacks.delete(component);
        else if (this.addCallbacks.has(component)) {
            let set = this.addCallbacks.get(component);
            if (set)
                set.delete(callback);
        }

    }

    abstract remove(member: ModelElement<M>): this;

}