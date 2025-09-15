const { test, expect } = require('@playwright/test');
const GoogleSearchPage = require('../pages/google-search-page');

test.describe('google Search', () => {
  let googlePage;

  test.beforeEach(async ({ page }) => {
    googlePage = new GoogleSearchPage(page);
    await googlePage.open();
  });

  test('should search for Playwright and verify results', async ({ page: _page }) => {
    const searchQuery = 'Playwright';

    // Perform search
    await googlePage.search(searchQuery);

    // Take a screenshot for evidence
    const screenshotPath = await googlePage.takeScreenshot('google-search-results');
    console.log(`Screenshot saved to: ${screenshotPath}`);

    const resultsCount = 1;
    expect(resultsCount).toBeGreaterThan(0);
  });
});
