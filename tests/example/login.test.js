const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login-page');
const PerformanceUtils = require('../utils/performance-utils');
const { withRetryableTest } = require('../utils/test-utils');

// Test credentials for the practice test automation site
const TEST_CREDENTIALS = {
  valid: {
    username: 'student',
    password: 'Password123',
  },
  invalid: {
    username: 'invaliduser',
    password: 'invalidpass',
  },
};

test.describe('login Tests', () => {
  let loginPage;
  let performanceUtils;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    performanceUtils = new PerformanceUtils(page);
    await performanceUtils.startTracking();
  });

  test.afterEach(async ({ page }) => {
    // Ensure we're logged out after each test
    const currentUrl = page.url();
    if (currentUrl.includes('logged-in-successfully')) {
      await loginPage.logout();
    }

    if (performanceUtils) {
      await performanceUtils.stopTracking(test.info().title);
    }
  });

  test(
    'should load login page successfully',
    withRetryableTest(
      async ({ page }) => {
        await loginPage.navigateToLogin();
        const isFormVisible = await loginPage.isLoginFormVisible();
        expect(isFormVisible).toBeTruthy();

        // Verify the page title
        await expect(page).toHaveTitle(/Test Login | Practice Test Automation/);
      },
      {
        maxRetries: 2,
        description: 'Login page load test',
      }
    )
  );

  test(
    'should login with valid credentials',
    withRetryableTest(
      async ({ page }) => {
        await loginPage.navigateToLogin();
        await loginPage.login(TEST_CREDENTIALS.valid.username, TEST_CREDENTIALS.valid.password);

        // Verify successful login
        await expect(page).toHaveURL(/.*logged-in-successfully/);
        const successMessage = await loginPage.getSuccessMessage();
        expect(successMessage).toContain('Logged In Successfully');
      },
      {
        maxRetries: 2,
        description: 'Successful login test',
      }
    )
  );

  test(
    'should show error with invalid credentials',
    withRetryableTest(
      async ({ page }) => {
        await loginPage.navigateToLogin();
        await loginPage.login(TEST_CREDENTIALS.invalid.username, TEST_CREDENTIALS.invalid.password);

        // Verify error message
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Your username is invalid!');

        // Verify we're still on the login page
        await expect(page).toHaveURL(/.*practice-test-login/);
      },
      {
        maxRetries: 2,
        description: 'Failed login test',
      }
    )
  );

  test(
    'should be able to logout after login',
    withRetryableTest(
      async ({ page }) => {
        // Login first
        await loginPage.navigateToLogin();
        await loginPage.login(TEST_CREDENTIALS.valid.username, TEST_CREDENTIALS.valid.password);

        // Verify login was successful
        await expect(page).toHaveURL(/.*logged-in-successfully/);

        // Logout
        await loginPage.logout();

        // Verify logout was successful
        await expect(page).toHaveURL(/.*practice-test-login/);
        const isFormVisible = await loginPage.isLoginFormVisible();
        expect(isFormVisible).toBeTruthy();
      },
      {
        maxRetries: 2,
        description: 'Logout test',
      }
    )
  );

  test(
    'should load login page within performance budget',
    withRetryableTest(
      async ({ page }) => {
        await loginPage.navigateToLogin();

        // Simple performance check - you might want to enhance this with actual metrics
        const startTime = Date.now();
        await page.waitForLoadState('load');
        const loadTime = Date.now() - startTime;

        console.log(`Page loaded in ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // 5 seconds max load time

        await performanceUtils.stopTracking('login-page-load');
      },
      {
        maxRetries: 1,
        description: 'Login page performance test',
      }
    )
  );
});
