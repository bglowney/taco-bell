"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Binding_1 = require("./Binding");
const AbstractElement_1 = require("./AbstractElement");
const ModelElement_1 = require("./ModelElement");
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractComponent {
    constructor(tagName, parent, namespace) {
        this.destroyed = false;
        if (!namespace)
            this.element = window.document.createElement(tagName || "div");
        else
            this.element = window.document.createElementNS(namespace, tagName);
        if (parent != undefined) {
            this.parent = parent;
            parent.appendChild(this.element);
        }
        ComponentQueue_1.ComponentQueue.add(this);
    }
    getElement() {
        return this.element;
    }
    setElement(element) {
        this.element = element;
    }
    setParent(parent) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    reinit(immediate = false) {
        if (immediate) {
            this.updateClass();
            this.updateText();
            if (this.attrs) {
                for (let name in this.attrs) {
                    this.updateAttribute(name);
                }
            }
            this.updateValue();
        }
        else {
            ComponentQueue_1.ComponentQueue.add(this);
        }
    }
    _isDestroyed() {
        return this.destroyed;
    }
    _remove() {
        if (this.element.parentElement)
            this.element.parentElement.removeChild(this.element);
    }
    destroy() {
        this.destroyed = true;
        ComponentQueue_1.ComponentQueue.add(this);
    }
    withClass(...classes) {
        if (!this.classes)
            this.classes = new Set();
        for (let cls of classes) {
            this.classes.add(cls);
            if (cls instanceof AbstractElement_1.AbstractElement) {
                cls.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            }
            else if (cls instanceof Binding_1.Binding) {
                let binding = cls;
                binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            }
            else {
                ComponentQueue_1.ComponentQueue.add(this);
            }
        }
        return this;
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof AbstractElement_1.AbstractElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.className = classNames.join(" ");
    }
    removeClass(...classes) {
        if (this.classes) {
            for (let cls of classes) {
                if (cls instanceof AbstractElement_1.AbstractElement) {
                    cls.unregisterCallback(this, this.updateClass.bind(this));
                }
                else if (cls instanceof Binding_1.Binding) {
                    let binding = cls;
                    binding.model.unregisterCallback(this, this.updateClass.bind(this));
                }
                this.classes.delete(cls);
            }
        }
        return this;
    }
    withText(text) {
        this.text = text;
        if (text instanceof AbstractElement_1.AbstractElement) {
            text.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else if (this.text instanceof Binding_1.Binding) {
            let binding = text;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else {
            ComponentQueue_1.ComponentQueue.add(this);
        }
        return this;
    }
    updateText() {
        if (this.text != undefined) {
            let text;
            if (typeof this.text == "string")
                text = this.text;
            else if (this.text instanceof AbstractElement_1.AbstractElement) {
                text = this.text.get();
            }
            else {
                let binding = this.text;
                text = binding.onupdate(binding.model.get());
            }
            this.element.textContent = text;
        }
    }
    removeText() {
        if (this.text != undefined) {
            if (this.text instanceof AbstractElement_1.AbstractElement)
                this.text.unregisterCallback(this, this.updateText.bind(this));
            else if (this.text instanceof Binding_1.Binding) {
                let binding = this.text;
                binding.model.unregisterCallback(this, this.updateText.bind(this));
            }
        }
        this.text = "";
        this.updateText();
        return this;
    }
    withValue(value) {
        this.value = value;
        let valueProp;
        function setInputType() {
            let inputType = this.element.getAttribute("type");
            valueProp = inputType == "checkbox" || inputType == "radio" ? "checked" : "value";
        }
        if (value instanceof ModelElement_1.ModelElement) {
            value.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                value.set(this.element[valueProp]);
            }.bind(this));
        }
        else if (this.value instanceof Binding_1.TwoWayBinding) {
            let binding = value;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
            this.on("change", function () {
                setInputType.call(this);
                binding.model.set(binding.onUserUpdate(this.element[valueProp]));
            }.bind(this));
        }
        else {
            ComponentQueue_1.ComponentQueue.add(this);
        }
        return this;
    }
    removeValue() {
        if (this.value != undefined) {
            if (this.value instanceof AbstractElement_1.AbstractElement) {
                this.value.unregisterCallback(this, this.updateValue.bind(this));
            }
            else if (this.value instanceof Binding_1.Binding) {
                let binding = this.value;
                binding.model.unregisterCallback(this, this.updateValue.bind(this));
            }
        }
        let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
        this.element[valueProp] = "";
        this.element.onchange = null;
        return this;
    }
    updateValue() {
        if (this.value != undefined) {
            let value;
            let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
            if (!(typeof this.value == "object")) {
                value = this.value;
            }
            else if (this.value instanceof AbstractElement_1.AbstractElement) {
                value = this.value.get();
            }
            else {
                let binding = this.value;
                value = binding.onupdate(binding.model.get());
            }
            this.element[valueProp] = value;
        }
    }
    withAttribute(name, value) {
        if (!this.attrs)
            this.attrs = {};
        this.attrs[name] = value;
        if (value instanceof AbstractElement_1.AbstractElement) {
            value.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else if (value instanceof Binding_1.Binding) {
            let binding = value;
            binding.model.registerCallback(this, ComponentQueue_1.ComponentQueue.add.bind(ComponentQueue_1.ComponentQueue, this));
        }
        else {
            ComponentQueue_1.ComponentQueue.add(this);
        }
        return this;
    }
    removeAttribute(name) {
        if (this.attrs != undefined) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement_1.AbstractElement) {
                    value.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                else {
                    let binding = value;
                    binding.model.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                delete this.attrs[name];
                this.element.removeAttribute(name);
            }
        }
        return this;
    }
    updateAttribute(name) {
        if (this.attrs) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof AbstractElement_1.AbstractElement) {
                    value = value.get();
                }
                else if (value instanceof Binding_1.Binding) {
                    let binding = value;
                    value = binding.onupdate(binding.model.get());
                }
                this.element.setAttribute(name, value);
            }
        }
    }
    isPromise(x) {
        return x instanceof Promise
            || (typeof x === "object" || typeof x === "function")
                && x.then
                && typeof x.then === "function";
    }
    on(eventName, eventHandler) {
        this.element.addEventListener(eventName, (event) => {
            let maybePromise = eventHandler.call(this, event);
            if (this.isPromise(maybePromise)) {
                maybePromise.then(ComponentQueue_1.ComponentQueue.cycle.bind(ComponentQueue_1.ComponentQueue));
            }
            else {
                ComponentQueue_1.ComponentQueue.cycle();
            }
        });
        return this;
    }
    off(eventName, eventHandler) {
        this.element.removeEventListener(eventName, eventHandler);
        return this;
    }
    focus() {
        this.element.focus();
        return this;
    }
    hide() {
        this.element.classList.add("hidden");
        return this;
    }
    show() {
        this.element.classList.remove("hidden");
        return this;
    }
}
exports.AbstractComponent = AbstractComponent;
