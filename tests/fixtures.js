// @ts-check
const { test, expect } = require('@playwright/test');
const { generateRandomString, generateRandomEmail, takeScreenshot, waitForNetworkIdle } = require('./utils/test-utils');

// Add test context
test.beforeEach(async ({ page }) => {
    // Add any global setup here
    await page.setDefaultTimeout(10000);
});

test.afterEach(async ({ page }, testInfo) => {
    // Take a screenshot on test failure
    if (testInfo.status === 'failed') {
        await takeScreenshot(page, `test-failed-${testInfo.title}`);
    }
});

// Export the test object with custom utilities
module.exports = {
    test,
    expect,
    testUtils: {
        generateRandomString,
        generateRandomEmail,
        takeScreenshot,
        waitForNetworkIdle
    }
};
