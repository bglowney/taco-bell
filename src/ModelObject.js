"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelCollection_1 = require("./ModelCollection");
const ModelElement_1 = require("./ModelElement");
class ModelObject extends ModelCollection_1.ModelCollection {
    constructor(obj) {
        super({});
        for (let k in obj) {
            this.put(k, obj[k]);
        }
    }
    put(key, member) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let newMember = new ModelElement_1.ModelElement(member);
        this.data[key] = newMember;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, key);
            }
        }
        return this;
    }
    remove(member) {
        for (let key in this.data) {
            let item = this.data[key];
            if (member === item) {
                delete this.data[key];
                member.destroy();
            }
        }
        return this;
    }
}
exports.ModelObject = ModelObject;
