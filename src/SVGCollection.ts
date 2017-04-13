import {Collection} from "./Collection";
import {HtmlTagName} from "./Html";
import {ComponentProperty, Binding} from "./Binding";
import {ModelElement} from "./ModelElement";

export class SVGCollection extends Collection {

    constructor(tagName?: HtmlTagName, parent?: Element) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }

    /**
     * Override AbstractComponent here
     * SVGElement.classname is readonly
     * Will cause an error in browser
     * So override to set the class attribute instead
     */
    protected updateClass(): void {
        if (!this.classes)
            return;

        let classNames: string[] = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp as string);
            } else if (cp instanceof ModelElement) {
                classNames.push((cp as ModelElement<string>).get());
            } else {// cp is Binding<any,string>
                let binding = cp as Binding<any,string>;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        // this is the line that is modified from base class
        this.element.setAttribute("class", classNames.join(" "));
    }

    withWidth(width: ComponentProperty<number>): this {
        return this.withAttribute("width", width)
    }

    withHeight(height: ComponentProperty<number>): this {
        return this.withAttribute("height", height);
    }

    withX(x: ComponentProperty<number>): this {
        return this.withAttribute("x", x);
    }

    withY(y: ComponentProperty<number>): this {
        return this.withAttribute("y", y);
    }

}