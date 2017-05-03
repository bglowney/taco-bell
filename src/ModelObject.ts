import {ModelCollection} from "./ModelCollection";
import {ModelElement} from "./ModelElement";
import {Collection} from "./Collection";
import {UpdateCallback} from "./Binding";
import {AbstractComponent} from "./AbstractComponent";

export class ModelObject<M> extends ModelCollection<M,{ [key: string]: ModelElement<M> }> {

    constructor(obj?: { [key: string]: M }) {
        super({});
        for (let k in obj) {
            this.put(k, obj[k]);
        }
    }

    put(key: string, member: M): this {
        if (!this.addCallbacks)
            this.addCallbacks = new Map<Collection,Set<UpdateCallback<ModelElement<M>,AbstractComponent>>>();

        let newMember = new ModelElement<M>(member);
        this.data[key] = newMember;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, key);
            }
        }

        return this;
    }

    remove(member: ModelElement<M>): this {
        for (let key in this.data) {
            let item = this.data[key];
            if (member === item) {
                delete this.data[key];
                member.destroy();
            }
        }
        return this;
    }
}