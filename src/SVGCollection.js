"use strict";
const Collection_1 = require("./Collection");
const ModelElement_1 = require("./ModelElement");
class SVGCollection extends Collection_1.Collection {
    constructor(tagName, parent) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.setAttribute("class", classNames.join(" "));
    }
    withWidth(width) {
        return this.withAttribute("width", width);
    }
    withHeight(height) {
        return this.withAttribute("height", height);
    }
    withX(x) {
        return this.withAttribute("x", x);
    }
    withY(y) {
        return this.withAttribute("y", y);
    }
}
exports.SVGCollection = SVGCollection;
