"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const AppPage_1 = require("./AppPage");
const AppPageElements = {
    HEADER: selenium_webdriver_1.By.id('header'),
    CHANGE_TITLE_BTN: selenium_webdriver_1.By.id('change-title-text-btn'),
    ADD_ITEM_BTN: selenium_webdriver_1.By.id('add-item-btn')
};
class TestAppPage extends AppPage_1.AppPage {
    header() {
        return this.elementIfExists(AppPageElements.HEADER);
    }
    headerText() {
        return this.textIfExists(AppPageElements.HEADER);
    }
    headerTitle() {
        return this.elementIfExists(AppPageElements.HEADER);
    }
    changeTitleText() {
        return this.clickIfExists(AppPageElements.CHANGE_TITLE_BTN);
    }
    addItem() {
        return this.clickIfExists(AppPageElements.ADD_ITEM_BTN);
    }
}
exports.TestAppPage = TestAppPage;
