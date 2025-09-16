/**
 * @fileoverview [DESCRIPTION] Page Object Model
 * @module pages/[page-name]-page
 */

const BasePage = require('../pages/base-page');

/**
 * [PageName] Page Object
 * @extends BasePage
 */
class PageName extends BasePage {
  /**
   * Create a new [PageName]Page instance
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url = '/[page-route]';

    // Define page selectors using data-testid attributes
    this.selectors = {
      // Example: loginButton: '[data-testid="login-button"]',
    };
  }

  /**
   * Navigate to the page
   * @param {string} [baseUrl] - Base URL of the application
   * @returns {Promise<void>}
   */
  async navigate(baseUrl) {
    await super.navigate(baseUrl || process.env.BASE_URL, this.url);
  }

  // Add page-specific methods below
  // Example:
  // async login(username, password) {
  //   await this.fill(this.selectors.usernameInput, username);
  //   await this.fill(this.selectors.passwordInput, password);
  //   await this.click(this.selectors.loginButton);
  // }
}

module.exports = PageName;
