///<reference path="../../typings/modules/selenium-webdriver/index"/>
///<reference path="../../typings/modules/co/index"/>
import {By, WebElement, promise} from 'selenium-webdriver';
import {AppPage, PageElements,} from "./AppPage";

const AppPageElements: PageElements = {
    HEADER: By.id('header'),
    CHANGE_TITLE_BTN: By.id('change-title-text-btn'),
    ADD_ITEM_BTN: By.id('add-item-btn')
};

export class TestAppPage extends AppPage {
    header(): promise.Promise<WebElement> {
        return this.elementIfExists(AppPageElements.HEADER);
    }

    headerText(): Promise<string> {
        return this.textIfExists(AppPageElements.HEADER);
    }

    headerTitle(): promise.Promise<WebElement> {
        return this.elementIfExists(AppPageElements.HEADER);
    }

    changeTitleText(): Promise<void> {
        return this.clickIfExists(AppPageElements.CHANGE_TITLE_BTN);
    }

    addItem(): Promise<void> {
        return this.clickIfExists(AppPageElements.ADD_ITEM_BTN);
    }

}