import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";
import {ModelElement} from "./ModelElement";
import {ModelCollection} from "./ModelCollection";
import {ModelArray} from "./ModelArray";
import {Component} from "./Component";

export class Collection extends Component {

    children<M>(model: ModelCollection<M,any>, onAddCallback: UpdateCallback<ModelElement<M>,AbstractComponent>): this {
        model.registerAddCallback(this, function (newItem: ModelElement<any>) {
            let i = model instanceof ModelArray ? (model as ModelArray<any>).size.get(): "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            // this.element.appendChild(newComponent.getElement());
            this.child(newComponent);
        }.bind(this));
        return this;
    }

}