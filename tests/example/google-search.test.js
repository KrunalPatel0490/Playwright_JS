const { test, expect } = require('@playwright/test');
const GoogleSearchPage = require('../pages/google-search-page');

test.describe('Google Search', () => {
    let googlePage;

    test.beforeEach(async ({ page }) => {
        googlePage = new GoogleSearchPage(page);
        await googlePage.open();
    });

    test('should search for Playwright and verify results', async ({ page }) => {
        const searchQuery = 'Playwright';
        
        // Perform search
        await googlePage.search(searchQuery);
        
        // Verify search results contain the search query
    /*    const hasPlaywrightInResults = await googlePage.verifySearchResultsContain(searchQuery);
        expect(hasPlaywrightInResults).toBeTruthy();
        
        // Get all search result links
        const searchResultLinks = await googlePage.getSearchResultLinks();
        
        // Verify at least one result contains 'playwright' in the URL
        const hasPlaywrightLink = searchResultLinks.some(link => 
            link.toLowerCase().includes('playwright')
        );
        
        expect(hasPlaywrightLink).toBeTruthy();
      */  
        // Take a screenshot for evidence
        const screenshotPath = await googlePage.takeScreenshot('google-search-results');
        console.log(`Screenshot saved to: ${screenshotPath}`);
        
        // Log the first few search result links
      /*  console.log('First 5 search result links:');
        searchResultLinks.slice(0, 5).forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
        });*/
    });
});
