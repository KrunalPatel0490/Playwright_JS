const BasePage = require('./base-page');
const { withRetry, createRetryableStep } = require('../utils/test-utils');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Define page selectors based on https://practicetestautomation.com/practice-test-login/
    this.selectors = {
      usernameInput: '#username',
      passwordInput: '#password',
      loginButton: '#submit',
      successMessage: '.post-title',
      errorMessage: '#error',
      logoutButton: '.wp-block-button__link',
    };

    // Create retryable steps
    this.retryableSteps = {
      typeUsername: createRetryableStep(
        'Type username',
        async username => await this.type(this.selectors.usernameInput, username),
        { maxRetries: 2 }
      ),
      typePassword: createRetryableStep(
        'Type password',
        async password => await this.type(this.selectors.passwordInput, password, { delay: 100 }), // Add small delay for better reliability
        { maxRetries: 2 }
      ),
      clickLogin: createRetryableStep(
        'Click login button',
        async () => await this.click(this.selectors.loginButton),
        { maxRetries: 2 }
      ),
    };
  }

  /**
   * Navigate to the login page with retry
   */
  async navigateToLogin() {
    return withRetry(
      async () => {
        await this.navigate('https://practicetestautomation.com/practice-test-login/');
      },
      {
        maxRetries: 3,
        description: 'Navigate to login page',
        shouldRetry: error => !error.message.includes('404'), // Don't retry on 404
      }
    );
  }

  /**
   * Perform login with username and password with retry
   * @param {string} username - Username to login with
   * @param {string} password - Password to login with
   */
  async login(username, password) {
    return withRetry(
      async () => {
        await this.retryableSteps.typeUsername(username);
        await this.retryableSteps.typePassword(password);
        await this.retryableSteps.clickLogin();
      },
      {
        maxRetries: 2,
        description: 'Login with credentials',
        shouldRetry: error => {
          // Don't retry on authentication errors
          return !error.message.toLowerCase().includes('invalid credentials');
        },
      }
    );
  }

  /**
   * Get success message text after login
   * @returns {Promise<string>} Success message text
   */
  async getSuccessMessage() {
    return withRetry(() => this.getText(this.selectors.successMessage), {
      maxRetries: 2,
      description: 'Get success message',
      shouldRetry: error => error.message.includes('element not found'),
    });
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message text
   */
  async getErrorMessage() {
    return withRetry(() => this.getText(this.selectors.errorMessage), {
      maxRetries: 2,
      description: 'Get error message',
      shouldRetry: error => error.message.includes('element not found'),
    });
  }

  /**
   * Check if login form is visible with retry
   * @returns {Promise<boolean>} True if login form is visible
   */
  async isLoginFormVisible() {
    return withRetry(
      async () => {
        const usernameVisible = await this.page.locator(this.selectors.usernameInput).isVisible();
        const passwordVisible = await this.page.locator(this.selectors.passwordInput).isVisible();
        const buttonVisible = await this.page.locator(this.selectors.loginButton).isVisible();

        return usernameVisible && passwordVisible && buttonVisible;
      },
      {
        maxRetries: 2,
        description: 'Check if login form is visible',
      }
    );
  }

  /**
   * Perform logout
   */
  async logout() {
    return withRetry(
      async () => {
        await this.click(this.selectors.logoutButton);
        await this.page.waitForURL(/.*practice-test-login/);
      },
      {
        maxRetries: 2,
        description: 'Logout from application',
      }
    );
  }
}

module.exports = LoginPage;
