import {By, WebElement, promise, WebDriver} from "selenium-webdriver";
import co = require("co");
const CYCLE_TIMEOUT = 50;

export type PageElements = {
    [key: string]: By
};

export class AppPage {

    protected root: WebElement;
    protected readonly url: string;
    protected readonly rootId: By;

    constructor(url: string, rootId: By = By.id('app-root')) {
        this.url = url;
        this.rootId = rootId;
    }

    get(driver: WebDriver): Promise<this> {
        return co(function *() {
            yield driver.get(this.url);
            this.root = yield driver.findElement(this.rootId);
            return this;
        }.bind(this));
    }

    elementIfExists(by: By): promise.Promise<WebElement> {
        return this.root.findElements(by).then((elements) => {
            return elements ? elements[0] : null;
        });
    }

    textIfExists(by: By): Promise<string> {
        return co(function *() {
            let elements = yield this.root.findElements(by);
            if (!elements[0])
                return null;
            return yield elements[0].getText();
        }.bind(this));
    }

    clickIfExists(by: By): Promise<void> {
        return co(function *() {
            let elements = yield this.root.findElements(by);
            if (!elements[0])
                return null;
            yield elements[0].click();
        }.bind(this));
    }

    attributeIfExists(by: By, attr: string): Promise<string> {
        return co(function *() {
            let element = yield this.elementIfExists(by);
            if (element)
                return yield element.getAttribute(attr);
            return null;
        }.bind(this));
    }

    cycle(): promise.Promise<void> {
        const deferred = new promise.Deferred<void>();
        this.root.findElement(By.id('CycleButton')).then((button) => {
            button.click();
            // wait a short period for the cycle to complete
            setTimeout(() => {
                deferred.fulfill();
            }, CYCLE_TIMEOUT);
        });

        return deferred.promise;
    }

    queueSize(): Promise<string> {
        return this.attributeIfExists(By.id('CycleButton'), 'data-component-queue-size')
    }

}