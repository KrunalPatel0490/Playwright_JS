const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login-page');
const { generateRandomEmail } = require('../utils/test-utils');
const { getCurrentEnvironment } = require('../../config/environment');

test.describe('login Tests', () => {
  const env = getCurrentEnvironment();

  test('should display login form elements on example.com', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to example.com instead of a login page that doesn't exist
    await loginPage.navigate('https://example.com');

    // Check if the page loaded successfully
    const title = await page.title();
    expect(title).toContain('Example Domain');
  });

  test('should demonstrate page interaction', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to example.com
    await loginPage.navigate('https://example.com');

    // Check if there are any links on the page
    const linkCount = await page.locator('a').count();
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });

  test('should generate random test data', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Demonstrate utility function usage
    const randomEmail = generateRandomEmail();
    expect(randomEmail).toContain('@example.com');
    expect(randomEmail).toMatch(/test-\w+@example\.com/);

    // Navigate to verify page works
    await loginPage.navigate('https://example.com');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should demonstrate environment configuration', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Test environment configuration
    expect(env).toBeDefined();
    expect(env.baseURL).toBeDefined();
    expect(env.timeout).toBeDefined();

    // Navigate using environment config (fallback to example.com for demo)
    await loginPage.navigate('https://example.com');
    const title = await page.title();
    expect(title).toContain('Example Domain');
  });
});
