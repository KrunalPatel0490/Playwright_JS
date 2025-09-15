const BasePage = require('./base-page');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Define page selectors
        this.selectors = {
            usernameInput: '[data-testid="username"]',
            passwordInput: '[data-testid="password"]',
            loginButton: '[data-testid="login-button"]',
            errorMessage: '[data-testid="error-message"]',
            forgotPasswordLink: '[data-testid="forgot-password"]'
        };
    }

    /**
     * Navigate to the login page
     */
    async navigateToLogin() {
        await this.navigate('/login');
        await this.waitForElement(this.selectors.loginButton);
    }

    /**
     * Perform login with username and password
     * @param {string} username - Username to login with
     * @param {string} password - Password to login with
     */
    async login(username, password) {
        await this.type(this.selectors.usernameInput, username);
        await this.type(this.selectors.passwordInput, password);
        await this.click(this.selectors.loginButton);
    }

    /**
     * Get error message text
     * @returns {Promise<string>} Error message text
     */
    async getErrorMessage() {
        return await this.getText(this.selectors.errorMessage);
    }

    /**
     * Check if login form is visible
     * @returns {Promise<boolean>} True if login form is visible
     */
    async isLoginFormVisible() {
        const usernameVisible = await this.page.locator(this.selectors.usernameInput).isVisible();
        const passwordVisible = await this.page.locator(this.selectors.passwordInput).isVisible();
        const buttonVisible = await this.page.locator(this.selectors.loginButton).isVisible();
        
        return usernameVisible && passwordVisible && buttonVisible;
    }

    /**
     * Click forgot password link
     */
    async clickForgotPassword() {
        await this.click(this.selectors.forgotPasswordLink);
    }
}

module.exports = LoginPage;
