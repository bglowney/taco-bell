import {AbstractElement} from "./AbstractElement";
import {RemoteStream} from "./RemoteStream";

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

    subscribe(remoteStream: RemoteStream): void {
        throw "Not Implemented";
    }
}