const BasePage = require('./base-page');

class GoogleSearchPage extends BasePage {
  // Selectors
  elements = {
    searchInput: '//body/div[2]/div[4]/form/div[1]/div[1]/div[1]/div[1]/div[2]/textarea',
    searchButton: '//body/div[2]/div[4]/form/div[1]/div[1]/div[1]/div[1]/div[1]',
    searchResults: '#search .g',
  };

  /**
   * Navigate to Google search page
   */
  async open() {
    await this.navigate('https://www.google.com');
    // Handle cookie consent if it appears
    const cookieButton = this.page.locator('button:has-text("Accept all")');
    if (await cookieButton.isVisible()) {
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
    const resultElements = this.page.locator(this.elements.searchResults);
    const count = await resultElements.count();

    for (let i = 0; i < count; i++) {
      const text = await resultElements.nth(i).textContent();
      if (text && text.toLowerCase().includes(expectedText.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all search result links
   * @returns {Promise<Array<string>>} Array of hrefs from search results
   */
  async getSearchResultLinks() {
    const resultElements = this.page.locator(this.elements.searchResults);
    const count = await resultElements.count();
    const links = [];

    for (let i = 0; i < count; i++) {
      const linkElement = resultElements.nth(i).locator('a[href^="http"]').first();
      if ((await linkElement.count()) > 0) {
        const href = await linkElement.getAttribute('href');
        if (href) {
          links.push(href);
        }
      }
    }
    return links;
  }
}

module.exports = GoogleSearchPage;
