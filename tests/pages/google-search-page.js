const { expect } = require('@playwright/test');
const BasePage = require('./base-page');

class GoogleSearchPage extends BasePage {
    // Selectors
    elements = {
        searchInput: '//body/div[2]/div[4]/form/div[1]/div[1]/div[1]/div[1]/div[2]/textarea',
        searchButton: '//body/div[2]/div[4]/form/div[1]/div[1]/div[1]/div[1]/div[1]',
        searchResults: '#search .g'
    };

    /**
     * Navigate to Google search page
     */
    async open() {
        await this.navigate('https://www.google.com');
        // Handle cookie consent if it appears
        const cookieButton = await this.page.$('button:has-text("Accept all")');
        if (cookieButton) {
            await cookieButton.click();
        }
    }

    /**
     * Perform a search
     * @param {string} query - Search query
     */
    async search(query) {
        await this.page.fill(this.elements.searchInput, query);
        await this.page.keyboard.press('Enter');
        // Wait for search results to load
       // await this.page.waitForSelector(this.elements.searchResults);
    }

    /**
     * Verify search results contain expected text
     * @param {string} expectedText - Text to verify in search results
     * @returns {Promise<boolean>} True if text is found in search results
     */
    async verifySearchResultsContain(expectedText) {
        const results = await this.page.$$eval(this.elements.searchResults, (elements, text) => {
            return elements.some(el => 
                el.textContent.toLowerCase().includes(text.toLowerCase())
            );
        }, expectedText);
        return results;
    }

    /**
     * Get all search result links
     * @returns {Promise<Array<string>>} Array of hrefs from search results
     */
    async getSearchResultLinks() {
        return this.page.$$eval(this.elements.searchResults, (elements) => {
            return elements
                .map(el => el.querySelector('a[href^="http"]')?.href)
                .filter(href => href);
        });
    }
}

module.exports = GoogleSearchPage;
