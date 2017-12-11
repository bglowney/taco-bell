import 'mocha';
import {Builder, Capabilities} from 'selenium-webdriver';
import 'chromedriver';
import * as test from 'selenium-webdriver/testing';
import {TestAppPage} from './TestAppPage';

import assert = require('assert');

const browserLocation = process.env['tst.browserLocation'];
const capabilities = Capabilities.chrome();
capabilities.set('chromeOptions', {
    binary: browserLocation,
    args: ['--headless']
});

describe('Application end to end', function() {

    let driver;

    test.before(function*() {
        driver = yield new Builder()
            .forBrowser('chrome')
            .withCapabilities(capabilities)
            .build();
    });

    let page: TestAppPage;

    test.it('should be able to load the page', function *() {
        page = yield new TestAppPage('http://localhost:8000/index.html').get(driver);
        let header = yield page.header();
        let headerTitle = yield page.headerTitle();
        assert.ok(!header, 'header is initially not present');
        assert.ok(!headerTitle, 'header title is initially not present');
    });

    test.it('should be render the initial state after cycleing the Queue', function*() {
        yield page.cycle();
        let text = yield page.headerText();
        assert.equal(text, 'Title 1', 'header text is initially "Title 1" ');
        let queueSize = yield page.queueSize();
        assert.equal(queueSize, 0);
    });

    test.it('should update the dom after a new cycle', function *() {
        yield page.changeTitleText();
        let text = yield page.headerText();
        assert.equal(text, 'Title 2', 'header text is now "Title 2" ');
        let queueSize = yield page.queueSize();
        assert.equal(queueSize, 0);
    });

    test.it('should support adding items to a collection', function *() {

    });

    test.after(function*() {
        yield driver.quit();
    });

});