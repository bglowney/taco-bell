"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
