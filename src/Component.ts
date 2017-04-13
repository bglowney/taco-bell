import {AbstractComponent} from "./AbstractComponent";

export class Component extends AbstractComponent {
    child(components: AbstractComponent[]): this;
    child(...components: AbstractComponent[]): this;
    child(x): this {
        let components: Array<AbstractComponent>;
        if (x instanceof Array)
            components = x as Array<AbstractComponent>;
        else
            components = Array.prototype.slice.call(arguments) as Array<AbstractComponent>;
        for (let component of components) {
            component.setParent(this);
            this.element.appendChild(component.getElement());
        }
        return this;
    }
}