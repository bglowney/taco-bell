import {UpdateCallback} from "./Binding";
import {AbstractComponent} from "./AbstractComponent";
import {AbstractElement} from "./AbstractElement";
import {RemoteStream} from "./RemoteStream";

export class ModelElement<V> extends AbstractElement<V> {
    protected data: V;
    protected updateCallbacks: Map<AbstractComponent,Set<UpdateCallback<V,any>>>;
    protected boundComponents: Set<AbstractComponent>;

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