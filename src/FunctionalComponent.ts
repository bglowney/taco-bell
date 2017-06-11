import {AbstractElement} from "./AbstractElement";
import {ModelElement} from "./ModelElement";
import {RemoteStream} from "./RemoteStream";

export class FunctionalElement<V> extends AbstractElement<V> {

    protected readonly handler: (...models: any[]) => V;
    protected listenedTo: AbstractElement<any>[];

    constructor(handler: (...models: any[]) => V, ...listenedTo: any[]) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo || [];
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }

    listensTo(listenedTo: AbstractElement<any>): this {
        this.listenedTo.push(listenedTo);
        listenedTo.registerCallback(listenedTo, this.doUpdate.bind(this));
        return this;
    }

    get(): V {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model: ModelElement<any>) {
            return model.get();
        }));
    }

    subscribe(remoteStream: RemoteStream): void {
        throw "Not implemented";
    }
}