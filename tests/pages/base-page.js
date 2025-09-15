const { expect } = require('@playwright/test');

class BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.setupEventListeners();
    }

    // ======================
    // Navigation Methods
    // ======================

    /**
     * Navigate to a specific URL
     * @param {string} path - The path to navigate to
     */
    async navigate(path) {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }

    /**
     * Reload the current page
     * @param {Object} options - Navigation options
     */
    async reload(options = {}) {
        await this.page.reload(options);
    }

    /**
     * Go back to the previous page
     */
    async goBack() {
        await this.page.goBack();
    }

    /**
     * Go forward to the next page
     */
    async goForward() {
        await this.page.goForward();
    }

    // ======================
    // Element Interactions
    // ======================

    /**
     * Click an element
     * @param {string} selector - Element selector
     * @param {Object} options - Click options
     */
    async click(selector, options = {}) {
        await this.page.click(selector, options);
    }

    /**
     * Fill an input field
     * @param {string} selector - Input selector
     * @param {string} text - Text to fill
     * @param {Object} options - Fill options
     */
    async fill(selector, text, options = {}) {
        await this.page.fill(selector, text, options);
    }

    /**
     * Type text into an input field
     * @param {string} selector - Input selector
     * @param {string} text - Text to type
     * @param {Object} options - Type options
     */
    async type(selector, text, options = {}) {
        await this.page.type(selector, text, options);
    }

    /**
     * Check a checkbox
     * @param {string} selector - Checkbox selector
     */
    async check(selector) {
        await this.page.check(selector);
    }

    /**
     * Uncheck a checkbox
     * @param {string} selector - Checkbox selector
     */
    async uncheck(selector) {
        await this.page.uncheck(selector);
    }

    /**
     * Select an option from a dropdown
     * @param {string} selector - Dropdown selector
     * @param {string|Array<string>} values - Value(s) to select
     */
    async selectOption(selector, values) {
        await this.page.selectOption(selector, values);
    }

    /**
     * Hover over an element
     * @param {string} selector - Element selector
     */
    async hover(selector) {
        await this.page.hover(selector);
    }

    /**
     * Upload a file
     * @param {string} selector - File input selector
     * @param {string|Array<string>} filePaths - Path(s) to file(s)
     */
    async uploadFile(selector, filePaths) {
        await this.page.setInputFiles(selector, filePaths);
    }

    // ======================
    // Assertions
    // ======================

    /**
     * Check if element is visible
     * @param {string} selector - Element selector
     * @param {Object} options - Options for the assertion
     */
    async isVisible(selector, options = {}) {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    /**
     * Check if element is hidden
     * @param {string} selector - Element selector
     */
    async isHidden(selector) {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    /**
     * Check if element contains text
     * @param {string} selector - Element selector
     * @param {string|RegExp} text - Text to verify
     */
    async containsText(selector, text) {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    /**
     * Check if element has value
     * @param {string} selector - Element selector
     * @param {string} value - Expected value
     */
    async hasValue(selector, value) {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    // ======================
    // Page Events
    // ======================

    /**
     * Setup page event listeners
     */
    setupEventListeners() {
        // Page load events
        this.page.on('load', () => console.log('Page loaded'));
        this.page.on('domcontentloaded', () => console.log('DOM content loaded'));

        // Navigation events
        this.page.on('request', request => {
            console.log(`Request: ${request.method()} ${request.url()}`);
        });

        this.page.on('response', response =>
            console.log(`Response: ${response.status()} ${response.url()}`));

        // Console events
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            console.log(`Browser ${type}: ${text}`);
        });

        // Page errors
        this.page.on('pageerror', error =>
            console.error(`Page error: ${error.message}`));

        this.page.on('requestfailed', request =>
            console.error(`Request failed: ${request.failure().errorText} ${request.url()}`));

        // Dialog handlers
        this.page.on('dialog', async dialog => {
            console.log(`Dialog ${dialog.type()}: ${dialog.message()}`);
            await dialog.accept();
        });
    }

    // ======================
    // Wait Methods
    // ======================

    /**
     * Wait for a specific amount of time
     * @param {number} ms - Time to wait in milliseconds
     */
    async wait(ms) {
        await this.page.waitForTimeout(ms);
    }

    /**
     * Wait for an element to be visible
     * @param {string} selector - Element selector
     * @param {Object} options - Wait options
     */
    async waitForVisible(selector, options = {}) {
        await this.page.locator(selector).waitFor({ state: 'visible', ...options });
    }

    /**
     * Wait for an element to be hidden
     * @param {string} selector - Element selector
     * @param {Object} options - Wait options
     */
    async waitForHidden(selector, options = {}) {
        await this.page.locator(selector).waitFor({ state: 'hidden', ...options });
    }

    // ======================
    // Frame Handling
    // ======================

    /**
     * Get a frame by name or URL
     * @param {string} nameOrUrl - Frame name or URL
     * @returns {Promise<import('@playwright/test').Frame>} Frame object
     */
    async getFrame(nameOrUrl) {
        return this.page.frame({ name: nameOrUrl }) ||
               this.page.frame({ url: nameOrUrl }) ||
               this.page.frames().find(f => f.name() === nameOrUrl || f.url().includes(nameOrUrl));
    }

    // ======================
    // Screenshot and Video
    // ======================

    /**
     * Take a screenshot
     * @param {string} name - Name of the screenshot file
     * @param {Object} options - Screenshot options
     */
    async takeScreenshot(name, options = {}) {
        const path = `test-results/screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({ path, ...options });
        return path;
    }

    // ======================
    // JavaScript Execution
    // ======================

    /**
     * Execute JavaScript in the page context
     * @param {Function} fn - Function to execute
     * @param {...any} args - Arguments to pass to the function
     * @returns {Promise<any>} Result of the function execution
     */
    async executeScript(fn, ...args) {
        return this.page.evaluate(fn, ...args);
    }

    /**
     * Get the value of a JavaScript expression
     * @param {string} expression - JavaScript expression to evaluate
     * @returns {Promise<any>} Result of the expression
     */
    async evaluate(expression) {
        return this.page.evaluate(expression);
    }

    // ======================
    // Browser Context
    // ======================

    /**
     * Get the current page title
     * @returns {Promise<string>} Page title
     */
    async getTitle() {
        return this.page.title();
    }

    /**
     * Get the current URL
     * @returns {Promise<string>} Current URL
     */
    async getUrl() {
        return this.page.url();
    }

    /**
     * Add a script to the page
     * @param {string} script - Script content or URL
     * @param {Object} options - Add script options
     */
    async addScript(script, options = {}) {
        await this.page.addScriptTag({ content: script, ...options });
    }

    /**
     * Add a style to the page
     * @param {string} style - Style content or URL
     * @param {Object} options - Add style options
     */
    async addStyle(style, options = {}) {
        await this.page.addStyleTag({ content: style, ...options });
    }
}

module.exports = BasePage;
