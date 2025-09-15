const { test, expect } = require('@playwright/test');
const BasePage = require('../pages/base-page');
const { generateRandomEmail } = require('../utils/test-utils');

// Example test suite
test.describe('Example Test Suite', () => {
    test('should navigate to example.com and verify title', async ({ page }) => {
        const basePage = new BasePage(page);
        
        // Navigate to the website
        await basePage.navigate('https://example.com');
        
        // Verify the page title
        const title = await page.title();
        expect(title).toContain('Example Domain');
        
        // Take a screenshot
        await page.screenshot({ path: 'example.png' });
    });

    test('should demonstrate form interaction', async ({ page }) => {
        const basePage = new BasePage(page);
        
        // Example of interacting with a form
        await basePage.navigate('https://example.com');
        
        // Example: Click on a link (check if link exists first)
        const linkExists = await page.locator('a').count() > 0;
        if (linkExists) {
            await basePage.click('a');
        }
        
        // Verify we're still on a valid page
        expect(await page.title()).toBeTruthy();
    });
});
