import {HtmlTagName, HtmlAttributeName, EventName} from "./Html";
import {Primitive} from "./Shared";
import {ComponentEventHandler, ComponentProperty, Binding, TwoWayBinding} from "./Binding";
import {AbstractElement} from "./AbstractElement";
import {ModelElement} from "./ModelElement";
import {ComponentQueue, _QueableComponent} from "./ComponentQueue";

export abstract class AbstractComponent implements _QueableComponent{
    protected parent: AbstractComponent | Element;
    protected element: Element;

    constructor(tagName?: HtmlTagName, parent?: Element, namespace?: string) {
        if (!namespace)
            this.element = window.document.createElement(tagName || "div");
        else
            this.element = window.document.createElementNS(namespace, tagName);
        if (parent != undefined) {
            this.parent = parent;
            parent.appendChild(this.element);
        }
        ComponentQueue.add(this);
    }

    getElement(): Element {
        return this.element;
    }

    setElement(element: Element) {
        this.element = element;
    }

    setParent(parent: AbstractComponent | HTMLElement): void {
        this.parent = parent;
    }

    getParent(): this | Element {
        return this.parent as this | Element;
    }

    reinit(immediate = false): void {
        if (immediate) {
            this.updateClass();
            this.updateText();
            if (this.attrs) {
                for (let name in this.attrs) {
                    this.updateAttribute(name as HtmlAttributeName);
                }
            }
            // update value after attributes because input type may depend on an HtmlElement attribute
            this.updateValue();
        } else {
            ComponentQueue.add(this);
        }
    }

    private destroyed = false;

    _isDestroyed(): boolean {
        return this.destroyed;
    }

    _remove(): void{
        if (this.element.parentElement)
            this.element.parentElement.removeChild(this.element);
    }

    destroy(): void {
        this.destroyed = true;
        ComponentQueue.add(this);
    }

    protected classes: Set<ComponentProperty<string>>;

    withClass(...classes: ComponentProperty<string>[]): this {
        if (!this.classes)
            this.classes = new Set();

        for (let cls of classes) {
            this.classes.add(cls);
            if (cls instanceof AbstractElement) {
                // (cls as AbstractElement<string>).registerCallback(this, this.withClass.bind(this));
                (cls as AbstractElement<string>).registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
            } else if (cls instanceof Binding) {
                let binding = cls as Binding<any,string>;
                // binding.model.registerCallback(this, this.updateClass.bind(this));
                binding.model.registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
            } else {
                ComponentQueue.add(this);
            }
        }
        return this;
    }

    protected updateClass(): void {
        if (!this.classes)
            return;

        let classNames: string[] = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp as string);
            } else if (cp instanceof AbstractElement) {
                classNames.push((cp as AbstractElement<string>).get());
            } else {// cp is Binding<any,string>
                let binding = cp as Binding<any,string>;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.className = classNames.join(" ");
    }

    removeClass(...classes: ComponentProperty<string>[]): this {
        if (this.classes) {
            for (let cls of classes) {
                if (cls instanceof AbstractElement) {
                    (cls as AbstractElement<string>).unregisterCallback(this, this.updateClass.bind(this));
                } else if (cls instanceof Binding) {
                    let binding = cls as Binding<any,string>;
                    binding.model.unregisterCallback(this, this.updateClass.bind(this));
                }
                this.classes.delete(cls);
            }
        }
        return this;
    }

    protected text: ComponentProperty<Primitive>;

    withText(text: ComponentProperty<Primitive>): this {
        this.text = text;
        if (text instanceof AbstractElement) {
            // (text as AbstractElement<string>).registerCallback(this, this.updateText.bind(this));
            (text as AbstractElement<string>).registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
        } else if (this.text instanceof Binding) {
            let binding = text as Binding<any,string>;
            // binding.model.registerCallback(this, this.updateText.bind(this));
            binding.model.registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
        } else {
            ComponentQueue.add(this);
        }
        return this;
    }

    protected updateText(): void {
        if (this.text != undefined) {
            let text: string;
            if (typeof this.text == "string")
                text = this.text as string;
            else if (this.text instanceof AbstractElement) {
                text = (this.text as AbstractElement<string>).get();
            } else { // text is Binding<any,string>
                let binding = (this.text as Binding<any,string>);
                text = binding.onupdate(binding.model.get());
            }
            this.element.textContent = text;
        }
    }

    removeText(): this {
        if (this.text != undefined) {
            if (this.text instanceof AbstractElement)
                (this.text as AbstractElement<string>).unregisterCallback(this, this.updateText.bind(this));
            else if (this.text instanceof Binding) {
                let binding = this.text as Binding<any,string>;
                binding.model.unregisterCallback(this, this.updateText.bind(this));
            }
        }
        this.text = "";
        this.updateText();
        return this;
    }

    protected value: ComponentProperty<Primitive> | TwoWayBinding<Primitive,any,any>;

    // value should be bound with a two way binding
    withValue(value: Primitive | ModelElement<Primitive> | TwoWayBinding<Primitive,any,any>): this {

        this.value = value;
        let valueProp: string;

        // in case type attribute is bound to dynamic model, need to determine input type at runtime
        function setInputType() {
            let inputType = (this.element as HTMLInputElement).getAttribute("type");
            valueProp = inputType == "checkbox" || inputType == "radio" ? "checked" : "value";
        }

        if (value instanceof ModelElement) {
            // (value as AbstractElement<Primitive>).registerCallback(this, this.updateValue.bind(this));
            (value as AbstractElement<Primitive>).registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                (value as ModelElement<Primitive>).set((this.element as HTMLInputElement)[valueProp]);
            }.bind(this));
        } else if (this.value instanceof TwoWayBinding) {
            let binding = value as TwoWayBinding<Primitive,any,any>;
            // binding.model.registerCallback(this, this.updateValue.bind(this));
            binding.model.registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                binding.model.set(binding.onUserUpdate((this.element as HTMLInputElement)[valueProp]));
            }.bind(this));
        } else {
            ComponentQueue.add(this);
        }

        return this;
    }

    removeValue(): this {
        if (this.value != undefined) {
            if (this.value instanceof AbstractElement) {
                (this.value as AbstractElement<Primitive>).unregisterCallback(this, this.updateValue.bind(this));
            } else if (this.value instanceof Binding) {
                let binding = this.value as Binding<any,Primitive>;
                binding.model.unregisterCallback(this, this.updateValue.bind(this));
            }
        }
        let valueProp: string = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
        (this.element as HTMLInputElement)[valueProp] = "";
        (this.element as HTMLElement).onchange = null;
        return this;
    }

    protected updateValue(): void {
        if (this.value != undefined) {
            let value: Primitive;
            let valueProp: string = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
            if (!(typeof this.value == "object")) {
                value = this.value as Primitive;
            } else if (this.value instanceof AbstractElement) {
                value = (this.value as AbstractElement<Primitive>).get();
            } else {// value is Binding<any,Primitive>
                let binding = (this.value as Binding<any,Primitive>);
                value = binding.onupdate(binding.model.get());
            }
            (this.element as HTMLInputElement)[valueProp] = value as string;
        }
    }

    protected attrs: {[key: string]: ComponentProperty<Primitive>};

    withAttribute(name: HtmlAttributeName, value: ComponentProperty<Primitive>): this {
        if (!this.attrs)
            this.attrs = {};

        this.attrs[name] = value;

        if (value instanceof AbstractElement) {
            // (value as AbstractElement<Primitive>).registerCallback(this, this.updateAttribute.bind(this,name));
            (value as AbstractElement<Primitive>).registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
        } else if (value instanceof Binding) {
            let binding = value as Binding<any,Primitive>;
            //binding.model.registerCallback(this, this.updateAttribute.bind(this,name));
            binding.model.registerCallback(this, ComponentQueue.add.bind(ComponentQueue, this));
        } else {
            ComponentQueue.add(this);
        }

        return this;
    }

    removeAttribute(name: HtmlAttributeName): this {
        if (this.attrs != undefined) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement) {
                    (value as AbstractElement<Primitive>).unregisterCallback(this, this.updateAttribute.bind(this, name));
                } else {
                    let binding = value as Binding<any,Primitive>;
                    binding.model.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                delete this.attrs[name];
                this.element.removeAttribute(name);
            }
        }
        return this;
    }

    protected updateAttribute(name: HtmlAttributeName): void {
        if (this.attrs) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement) {
                    value = (value as AbstractElement<Primitive>).get();
                } else if (value instanceof Binding) {
                    let  binding = value as Binding<any,Primitive>;
                    value = binding.onupdate(binding.model.get());
                }
                this.element.setAttribute(name, value as string);
            }
        }
    }

    on(eventName: EventName, eventHandler: ComponentEventHandler<this>): this {
        // this.element.addEventListener(eventName, eventHandler.bind(this));
        this.element.addEventListener(eventName, (event: Event): void => {
            eventHandler.call(this, event);
            ComponentQueue.cycle();
        });
        return this;
    }

    off(eventName: EventName): this {
        this.element.removeEventListener(eventName);
        return this;
    }

    focus(): this {
        (this.element as HTMLInputElement).focus();
        return this;
    }

    hide(): this {
        this.element.classList.add("hidden");
        return this;
    }

    show(): this {
        this.element.classList.remove("hidden");
        return this;
    }

}