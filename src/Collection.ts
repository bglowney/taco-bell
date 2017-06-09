import {AbstractComponent} from "./AbstractComponent";
import {UpdateCallback} from "./Binding";
import {ModelElement} from "./ModelElement";
import {ModelCollection} from "./ModelCollection";
import {ModelArray} from "./ModelArray";
import {Component} from "./Component";

export class Collection extends Component {

    children<M>(model: ModelCollection<M,Object>, onAddCallback: UpdateCallback<ModelElement<M>,AbstractComponent>): this {
        model.registerAddCallback(this, addItem.bind(this));

        function addItem (newItem: ModelElement<any>, k?: any) {
            let i = k || (model instanceof ModelArray ? (model as ModelArray<any>).size.get(): "");
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            // this.element.appendChild(newComponent.getElement());
            this.child(newComponent);
        }

        // we should also apply the callback to any existing elements in the collection
        for (let k in model.get()) {
            let v = model.get()[k];
            addItem.call(this, v, k)
        }

        return this;
    }

}