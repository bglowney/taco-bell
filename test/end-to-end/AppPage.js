"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const co = require("co");
const CYCLE_TIMEOUT = 50;
class AppPage {
    constructor(url, rootId = selenium_webdriver_1.By.id('app-root')) {
        this.url = url;
        this.rootId = rootId;
    }
    get(driver) {
        return co(function* () {
            yield driver.get(this.url);
            this.root = yield driver.findElement(this.rootId);
            return this;
        }.bind(this));
    }
    elementIfExists(by) {
        return this.root.findElements(by).then((elements) => {
            return elements ? elements[0] : null;
        });
    }
    textIfExists(by) {
        return co(function* () {
            let elements = yield this.root.findElements(by);
            if (!elements[0])
                return null;
            return yield elements[0].getText();
        }.bind(this));
    }
    clickIfExists(by) {
        return co(function* () {
            let elements = yield this.root.findElements(by);
            if (!elements[0])
                return null;
            yield elements[0].click();
        }.bind(this));
    }
    attributeIfExists(by, attr) {
        return co(function* () {
            let element = yield this.elementIfExists(by);
            if (element)
                return yield element.getAttribute(attr);
            return null;
        }.bind(this));
    }
    cycle() {
        const deferred = new selenium_webdriver_1.promise.Deferred();
        this.root.findElement(selenium_webdriver_1.By.id('CycleButton')).then((button) => {
            button.click();
            setTimeout(() => {
                deferred.fulfill();
            }, CYCLE_TIMEOUT);
        });
        return deferred.promise;
    }
    queueSize() {
        return this.attributeIfExists(selenium_webdriver_1.By.id('CycleButton'), 'data-component-queue-size');
    }
}
exports.AppPage = AppPage;
