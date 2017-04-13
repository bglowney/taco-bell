import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";
import {ModelElement} from "./ModelElement";
import {ModelCollection} from "./ModelCollection";
import {ModelArray} from "./ModelArray";

export class Collection extends AbstractComponent {

    children<M>(model: ModelCollection<M,any>, onAddCallback: UpdateCallback<ModelElement<M>,AbstractComponent>): this {
        model.registerAddCallback(this, function (newItem: ModelElement<any>) {
            let i = model instanceof ModelArray ? (model as ModelArray<any>).size.get(): "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.element.appendChild(newComponent.getElement());
        }.bind(this));
        return this;
    }

}