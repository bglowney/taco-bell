import {ModelElement} from "./ModelElement";
import {Primitive} from "./Shared";
import {ModelCollection} from "./ModelCollection";
import {AbstractComponent} from "./AbstractComponent";
import {ModelArray} from "./ModelArray";
import {AbstractElement} from "./AbstractElement";

export type UpdateCallback<I,O> = (newValue: I, key?: string | number) => O;

export class Binding<I,O> {

    readonly model: AbstractElement<I>;

    readonly onupdate: UpdateCallback<I,O>;

    constructor(model: AbstractElement<I>, onupdate:UpdateCallback<I,O>) {
        this.model = model;
        this.onupdate = onupdate;
    }

}

export type ComponentEventHandler<C extends AbstractComponent> = (this: C, event: Event) => void;

export type ComponentProperty<P extends Primitive> = P | AbstractElement<P> | Binding<any,P>;

export interface CollectionBinding<M extends ModelElement<any>,O extends Object> {

    model: ModelCollection<M,O>;

    onadd: UpdateCallback<M,AbstractComponent>;

}

export class TwoWayBinding<U,M,O> extends Binding<M,O> {

    readonly model: ModelElement<M>;
    readonly onUserUpdate: UpdateCallback<U,M>;

    constructor(model: ModelElement<M>, onModelUpdate: UpdateCallback<M, O>, onUserUpdate: UpdateCallback<U,M>) {
        super(model, onModelUpdate);
        this.onUserUpdate = onUserUpdate;
    }
}

export interface Persistable<T> {
    serialize(): string;
    deserialize(emptyModel: T, serialized: string): T;
}

class _Persistence {
    model: Persistable<any>;
    emptyModel: new (a?, b?, c?, d?, e?, f?) => void;

    store(): void {
        window.sessionStorage.setItem("model", this.model.serialize());
    }

    get(): string {
        return window.sessionStorage.getItem("model");
    }

    hasModel(): boolean {
        return window.sessionStorage.getItem("model") != undefined;
    }
}

export const Persistence = new _Persistence();

function makeModelPersistent() {
    for (let member in this) {
        if (this[member] instanceof ModelElement) {
            let modelElement = this[member] as ModelElement<any>;
            modelElement.set = function (a,b) {
                ModelElement.prototype.set.call(modelElement, a, b);
                Persistence.store();
            }
        }
        if (this[member] instanceof ModelArray) {
            let modelArray = this[member] as ModelArray<any>;
            modelArray.add = function (a: any): ModelArray<any> {
                ModelArray.prototype.add.call(modelArray, a);
                Persistence.store();
                return modelArray;
            };
            modelArray.remove = function (a: ModelElement<any>): ModelArray<any> {
                ModelArray.prototype.remove.call(modelArray, a);
                Persistence.store();
                return modelArray;
            };
        }
    }
}

export function persistentModel(constructor: new (a?, b?, c?, d?, e?, f?) => void): any {
    return function (a?,b?,c?,d?,e?,f?): void {
        Persistence.emptyModel = constructor;
        let original;
        if (Persistence.hasModel()) {
            original = constructor.prototype.deserialize(new Persistence.emptyModel(), Persistence.get());
        } else {
            original = new constructor(a, b, c, d, e, f);
        }
        Object.assign(this, original);
        this.__proto__ = original.__proto__;
        Persistence.model = this as Persistable<any>;
        makeModelPersistent.call(this);
    };
}

export function persist(constructor: new (a?, b?, c?, d?, e?, f?) => void): any {
    return function (a,b,c,d,e,f) {
        let original = new constructor(a,b,c,d,e,f);
        Object.assign(this, original);
        this.__proto__ = original["__proto__"];
        makeModelPersistent.call(this);
    }
}