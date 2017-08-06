import {AbstractElement} from "./AbstractElement";
import {HttpStream} from "./Http";

export class ModelElement<V> extends AbstractElement<V> {
    protected data: V;

    constructor(data?: V) {
        super();
        this.data = data;
    }

    get(): V {
        return this.data;
    }

    set(data: V, doUpdate = true): void {
        this.data = data;
        if (doUpdate)
            this.doUpdate();
    }

    subscribe(remoteStream: HttpStream<any,V,any>): void {
        remoteStream.withSubscriber(this);
    }
}