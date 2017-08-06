(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
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
    on(eventName, eventHandler) {
        this.element.addEventListener(eventName, (event) => {
            eventHandler.call(this, event);
            ComponentQueue_1.ComponentQueue.cycle();
        });
        return this;
    }
    off(eventName) {
        this.element.removeEventListener(eventName);
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

},{"./AbstractElement":2,"./Binding":3,"./ComponentQueue":6,"./ModelElement":10}],2:[function(require,module,exports){
"use strict";
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractElement {
    destroy() {
        if (!this.boundComponents)
            return;
        for (let component of this.boundComponents.values())
            component.destroy();
    }
    bindComponent(component) {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }
    registerCallback(component, updateCallback) {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();
        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.updateCallbacks)
            return;
        if (!callback)
            this.updateCallbacks.delete(component);
        else if (this.updateCallbacks.has(component)) {
            let set = this.updateCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
    doUpdate() {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.get());
        }
        for (let key of this.updateCallbacks.keys()) {
            if (ComponentQueue_1._instanceofQueableComponent(key))
                ComponentQueue_1.ComponentQueue.add(key);
        }
    }
}
exports.AbstractElement = AbstractElement;

},{"./ComponentQueue":6}],3:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
const ModelArray_1 = require("./ModelArray");
class Binding {
    constructor(model, onupdate) {
        this.model = model;
        this.onupdate = onupdate;
    }
}
exports.Binding = Binding;
class TwoWayBinding extends Binding {
    constructor(model, onModelUpdate, onUserUpdate) {
        super(model, onModelUpdate);
        this.onUserUpdate = onUserUpdate;
    }
}
exports.TwoWayBinding = TwoWayBinding;
class _Persistence {
    store() {
        window.sessionStorage.setItem("model", this.model.serialize());
    }
    get() {
        return window.sessionStorage.getItem("model");
    }
    hasModel() {
        return window.sessionStorage.getItem("model") != undefined;
    }
}
exports.Persistence = new _Persistence();
function makeModelPersistent() {
    for (let member in this) {
        if (this[member] instanceof ModelElement_1.ModelElement) {
            let modelElement = this[member];
            modelElement.set = function (a, b) {
                ModelElement_1.ModelElement.prototype.set.call(modelElement, a, b);
                exports.Persistence.store();
            };
        }
        if (this[member] instanceof ModelArray_1.ModelArray) {
            let modelArray = this[member];
            modelArray.add = function (a) {
                ModelArray_1.ModelArray.prototype.add.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
            modelArray.remove = function (a) {
                ModelArray_1.ModelArray.prototype.remove.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
        }
    }
}
function persistentModel(constructor) {
    return function (a, b, c, d, e, f) {
        exports.Persistence.emptyModel = constructor;
        let original;
        if (exports.Persistence.hasModel()) {
            original = constructor.prototype.deserialize(new exports.Persistence.emptyModel(), exports.Persistence.get());
        }
        else {
            original = new constructor(a, b, c, d, e, f);
        }
        Object.assign(this, original);
        this.__proto__ = original.__proto__;
        exports.Persistence.model = this;
        makeModelPersistent.call(this);
    };
}
exports.persistentModel = persistentModel;
function persist(constructor) {
    return function (a, b, c, d, e, f) {
        let original = new constructor(a, b, c, d, e, f);
        Object.assign(this, original);
        this.__proto__ = original["__proto__"];
        makeModelPersistent.call(this);
    };
}
exports.persist = persist;

},{"./ModelArray":8,"./ModelElement":10}],4:[function(require,module,exports){
"use strict";
const ModelArray_1 = require("./ModelArray");
const Component_1 = require("./Component");
class Collection extends Component_1.Component {
    children(model, onAddCallback) {
        model.registerAddCallback(this, addItem.bind(this));
        function addItem(newItem, k) {
            let i = k || (model instanceof ModelArray_1.ModelArray ? model.size.get() : "");
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.child(newComponent);
        }
        for (let k in model.get()) {
            let v = model.get()[k];
            addItem.call(this, v, k);
        }
        return this;
    }
}
exports.Collection = Collection;

},{"./Component":5,"./ModelArray":8}],5:[function(require,module,exports){
"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
const ComponentQueue_1 = require("./ComponentQueue");
class Component extends AbstractComponent_1.AbstractComponent {
    constructor() {
        super(...arguments);
        this.addedChildren = new Set();
    }
    child(x) {
        let components;
        if (x instanceof Array)
            components = x;
        else
            components = Array.prototype.slice.call(arguments);
        for (let component of components) {
            component.setParent(this);
            this.addedChildren.add(component);
        }
        ComponentQueue_1.ComponentQueue.add(this);
        return this;
    }
    reinit(immediate = false) {
        super.reinit(immediate);
        this.flushChildren();
    }
    flushChildren() {
        for (let child of this.addedChildren.values())
            this.element.appendChild(child.getElement());
        this.addedChildren.clear();
    }
}
exports.Component = Component;

},{"./AbstractComponent":1,"./ComponentQueue":6}],6:[function(require,module,exports){
"use strict";
function _instanceofQueableComponent(obj) {
    return 'getParent' in obj
        && '_isDestroyed' in obj
        && '_remove' in obj
        && 'reinit' in obj;
}
exports._instanceofQueableComponent = _instanceofQueableComponent;
class _ComponentQueue {
    constructor() {
        this.queue = new Set();
    }
    add(component) {
        this.queue.add(component);
    }
    cycle() {
        for (let component of this.queue.values()) {
            if (_instanceofQueableComponent(component))
                this.resolveAncestor(component);
        }
        const queueToExecute = this.queue;
        this.queue = new Set();
        const cycleRootToExecute = this.cycleRoot;
        this.cycleRoot = null;
        if (queueToExecute.size == 0)
            return;
        let rootParent = cycleRootToExecute.getParent();
        let rootParentElement;
        if (rootParent instanceof Element)
            rootParentElement = rootParent;
        else
            rootParentElement = rootParent.getElement();
        var nextSibling = cycleRootToExecute.getElement().nextSibling;
        rootParentElement.removeChild(cycleRootToExecute.getElement());
        if (cycleRootToExecute._isDestroyed())
            return;
        for (let item of queueToExecute.values()) {
            if (_instanceofQueableComponent(item)) {
                let component = item;
                if (component._isDestroyed())
                    component._remove();
                else
                    component.reinit(true);
            }
            else {
                let element = item;
                element.doUpdate();
            }
        }
        if (nextSibling)
            rootParentElement.insertBefore(cycleRootToExecute.getElement(), nextSibling);
        else
            rootParentElement.appendChild(cycleRootToExecute.getElement());
    }
    resolveAncestor(other) {
        if (!this.cycleRoot) {
            this.cycleRoot = other;
            return;
        }
        let ancestor = other;
        while (ancestor && !(ancestor instanceof Element) &&
            (ancestor = ancestor.getParent())) {
            if (ancestor === this.cycleRoot)
                return;
        }
        this.cycleRoot = other;
    }
}
exports._ComponentQueue = _ComponentQueue;
exports.ComponentQueue = new _ComponentQueue();

},{}],7:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
const ComponentQueue_1 = require("./ComponentQueue");
class AbstractSerializable {
    serialize() {
        return serialize.call(this);
    }
    deserialize(data) {
        deserialize.call(this, data);
    }
}
exports.AbstractSerializable = AbstractSerializable;
function instanceofDeserializable(o) {
    if (typeof o === "object" && o != null)
        return "deserialize" in o && (typeof o["deserialize"] === "function");
    return false;
}
function instanceofSerializable(o) {
    if (typeof o === "object" && o != null)
        return "serialize" in o && (typeof o["serialize"] === "function");
    return false;
}
function serialize() {
    function toPlainObject() {
        const plainObject = {};
        for (let k in this) {
            const v = this[k];
            if (v instanceof ModelElement_1.ModelElement) {
                const meo = v.get;
                if (typeof meo === "object")
                    plainObject[k] = toPlainObject.call(meo);
                else
                    plainObject[k] = meo;
            }
        }
        return plainObject;
    }
    return JSON.stringify(toPlainObject.call(this));
}
exports.serialize = serialize;
function deserialize(str) {
    const response = JSON.parse(str);
    for (let k in this) {
        if (k in response && this[k] instanceof ModelElement_1.ModelElement) {
            let v = response[k];
            if (typeof v === "object")
                deserialize.call(this[k], v);
            else
                this[k].set(v);
        }
    }
}
exports.deserialize = deserialize;
class HttpStream {
    constructor(baseURL, interceptor) {
        this.subscribers = [];
        this.baseURL = baseURL;
        this.interceptor = interceptor;
    }
    withSubscriber(subscriber) {
        this.subscribers.push(subscriber);
        return this;
    }
    get(params) {
        let queryStr = params == null ? "" : "?";
        let delim = "";
        for (let key in params) {
            if (!params.hasOwnProperty(key))
                continue;
            queryStr += delim;
            delim = "&";
            queryStr += encodeURIComponent(key);
            queryStr += "=";
            let v;
            if (params[key] instanceof ModelElement_1.ModelElement)
                v = params[key].get();
            else
                v = params[key];
            queryStr += encodeURIComponent(v != undefined ? v.toString() : "");
        }
        this.send("GET", this.baseURL + queryStr);
    }
    post(data) {
        this.send("POST", this.baseURL, data);
    }
    put(data) {
        this.send("PUT", this.baseURL, data);
    }
    delete(data) {
        this.send("DELETE", this.baseURL, data);
    }
    serializeParams(data) {
        if (data === null || data === undefined)
            return "";
        if (instanceofSerializable(data)) {
            return data.serialize();
        }
        else if (data instanceof ModelElement_1.ModelElement) {
            return JSON.stringify(data.get());
        }
        else if (typeof data === "string") {
            return data;
        }
        else {
            return JSON.stringify(data);
        }
    }
    send(method, url, params) {
        const self = this;
        const request = new XMLHttpRequest();
        request.onload = function (ev) {
            if (self.interceptor != undefined) {
                self.interceptor.statusCode.set(this.status);
                if (self.interceptor.body instanceof ModelElement_1.ModelElement)
                    self.interceptor.body.set(JSON.parse(this.responseText));
                else
                    self.interceptor.body.deserialize(this.responseText);
            }
            if (method === "GET") {
                for (let subscriber of self.subscribers) {
                    if (instanceofDeserializable(subscriber)) {
                        subscriber.deserialize(this.responseText);
                    }
                    else {
                        subscriber.set(JSON.parse(this.responseText));
                    }
                }
            }
            ComponentQueue_1.ComponentQueue.cycle();
        };
        request.open(method, url, true);
        if (method === "POST" || method === "PUT")
            request.setRequestHeader("Content-Type", "application/json");
        request.send(this.serializeParams(params));
    }
}
exports.HttpStream = HttpStream;
function httpStreamHandler(stream, method, params) {
    return function (event) {
        switch (method) {
            case "GET":
                stream.get(params);
                break;
            case "POST":
                stream.post(params);
                break;
            case "PUT":
                stream.put(params);
                break;
            case "DELETE":
                stream.delete(params);
                break;
        }
    };
}
exports.httpStreamHandler = httpStreamHandler;

},{"./ComponentQueue":6,"./ModelElement":10}],8:[function(require,module,exports){
"use strict";
const ModelCollection_1 = require("./ModelCollection");
const ModelElement_1 = require("./ModelElement");
class ModelArray extends ModelCollection_1.ModelCollection {
    constructor(data) {
        super([]);
        this.size = new ModelElement_1.ModelElement(0);
        if (data) {
            for (let item of data) {
                this.add(item);
            }
        }
    }
    add(member) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let newMember = new ModelElement_1.ModelElement(member);
        this.data.push(newMember);
        const index = this.data.length - 1;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, index);
            }
        }
        this.size.set(this.size.get() + 1);
        return this;
    }
    remove(member) {
        let index = this.data.indexOf(member);
        if (index !== -1) {
            member.destroy();
            this.data.splice(index, 1);
        }
        this.size.set(this.size.get() - 1);
        return this;
    }
    clear() {
        while (this.data.length > 0)
            this.remove(this.data[0]);
        return this;
    }
}
exports.ModelArray = ModelArray;

},{"./ModelCollection":9,"./ModelElement":10}],9:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
class ModelCollection extends ModelElement_1.ModelElement {
    registerAddCallback(component, addCallback) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let callbackSet = this.addCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.addCallbacks.set(component, callbackSet);
        }
        callbackSet.add(addCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.addCallbacks)
            return;
        if (!callback)
            this.addCallbacks.delete(component);
        else if (this.addCallbacks.has(component)) {
            let set = this.addCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
}
exports.ModelCollection = ModelCollection;

},{"./ModelElement":10}],10:[function(require,module,exports){
"use strict";
const AbstractElement_1 = require("./AbstractElement");
class ModelElement extends AbstractElement_1.AbstractElement {
    constructor(data) {
        super();
        this.data = data;
    }
    get() {
        return this.data;
    }
    set(data, doUpdate = true) {
        this.data = data;
        if (doUpdate)
            this.doUpdate();
    }
    subscribe(remoteStream) {
        remoteStream.withSubscriber(this);
    }
}
exports.ModelElement = ModelElement;

},{"./AbstractElement":2}],11:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("../src/ModelElement");
const Component_1 = require("../src/Component");
const ComponentQueue_1 = require("../src/ComponentQueue");
const Collection_1 = require("../src/Collection");
const ModelArray_1 = require("../src/ModelArray");
const Http_1 = require("../src/Http");
class ErrorInterceptor {
    constructor() {
        this.statusCode = new ModelElement_1.ModelElement();
        this.body = new ErrorResponse();
    }
}
class Request extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.a = new ModelElement_1.ModelElement("a");
        this.b = new ModelElement_1.ModelElement("b");
    }
}
class Response extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.c = new ModelElement_1.ModelElement();
        this.d = new ModelElement_1.ModelElement();
    }
}
class ErrorResponse extends Http_1.AbstractSerializable {
    constructor() {
        super(...arguments);
        this.success = new ModelElement_1.ModelElement();
        this.message = new ModelElement_1.ModelElement();
    }
}
class Model {
    constructor() {
        this.title = new ModelElement_1.ModelElement("Title 1");
        this.titleClass = new ModelElement_1.ModelElement("title");
        this.items = new ModelArray_1.ModelArray();
        this.buttonText = new ModelElement_1.ModelElement("Hide");
        this.inputValue = new ModelElement_1.ModelElement("");
        this.request = new Request();
        this.response = new Response();
        this.errorInterceptor = new ErrorInterceptor();
    }
}
const model = new Model();
const getStream = new Http_1.HttpStream("/remote", model.errorInterceptor)
    .withSubscriber(model.response);
const postStream = new Http_1.HttpStream("/remote");
new Component_1.Component("section", document.getElementById("app-root"))
    .child(new Component_1.Component("header")
    .withAttribute("id", "header")
    .withClass(model.titleClass)
    .child(new Component_1.Component("h1")
    .withAttribute("id", "header-title")
    .withText(model.title))).child(new Collection_1.Collection("ul")
    .withAttribute("id", "items")
    .children(model.items, (item) => {
    return new Component_1.Component("li").withText(item);
})).child(new Component_1.Component("button")
    .withAttribute("id", "button")
    .withText(model.buttonText)
    .on("click", () => {
    model.titleClass.set("hidden");
})).child(new Component_1.Component("input")
    .withAttribute("id", "input")
    .withAttribute("type", "text")
    .withValue(model.inputValue)).child(new Component_1.Component("button")
    .withAttribute("id", "getRemoteButton")
    .withText("get remote")
    .on("click", Http_1.httpStreamHandler(getStream, "GET", model.request)), new Component_1.Component("p")
    .withAttribute("id", "pc")
    .withText(model.response.c), new Component_1.Component("p")
    .withAttribute("id", "pd")
    .withText(model.response.d), new Component_1.Component("button")
    .withAttribute("id", "postRemoteButton")
    .withText("post remote")
    .on("click", Http_1.httpStreamHandler(postStream, "POST", model.request)), new Component_1.Component("button")
    .withAttribute("id", "badGetRequestButton")
    .withText("send bad GET request")
    .on("click", () => {
    getStream.get(null);
}), new Component_1.Component("p")
    .withAttribute("id", "errorMessage")
    .withText(model.errorInterceptor.body.message));
window["model"] = model;
window["queue"] = ComponentQueue_1.ComponentQueue;

},{"../src/Collection":4,"../src/Component":5,"../src/ComponentQueue":6,"../src/Http":7,"../src/ModelArray":8,"../src/ModelElement":10}]},{},[11]);
