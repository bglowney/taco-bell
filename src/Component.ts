import {AbstractComponent} from "./AbstractComponent";
import {ComponentQueue} from "./ComponentQueue";

export class Component extends AbstractComponent {

    private addedChildren: Set<AbstractComponent> = new Set<AbstractComponent>();

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
            // this.element.appendChild(component.getElement());
            this.addedChildren.add(component);
        }
        ComponentQueue.add(this);
        return this;
    }

    reinit(immediate: boolean = false): void {
        super.reinit(immediate);
        this.flushChildren();
    }

    private flushChildren(): void {
        for (let child of this.addedChildren.values())
            this.element.appendChild(child.getElement());
        this.addedChildren.clear();
    }
}