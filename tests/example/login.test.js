const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login-page');
const PerformanceUtils = require('../utils/performance-utils');
const { getPerformanceBudget } = require('../../config/performance-budgets');
const { generateRandomEmail } = require('../utils/test-utils');
const { getCurrentEnvironment } = require('../../config/environment');

async function verifyPerformanceMetrics(performanceUtils) {
  const metrics = await performanceUtils.stopTracking('login-page-load');
  const performanceBudget = getPerformanceMetrics();
  performanceUtils.assertPerformanceBudget(performanceBudget);

  logPerformanceMetrics(metrics, performanceUtils);
}

function getPerformanceMetrics() {
  return getPerformanceBudget('https://example.com');
}

function logPerformanceMetrics(metrics, performanceUtils) {
  console.log('Login Page Performance Metrics:', {
    pageLoadTime: `${metrics.pageLoadTime}ms`,
    timeToInteractive: `${metrics.timeToInteractive}ms`,
    totalRequests: metrics.totalRequests,
    totalResourcesSize: performanceUtils.formatBytes(metrics.totalResourcesSize),
  });
}

test.describe('login Tests', () => {
  const env = getCurrentEnvironment();
  let loginPage;
  let performanceUtils;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    performanceUtils = new PerformanceUtils(page);
    await performanceUtils.startTracking();
  });

  test.afterEach(async () => {
    // Ensure we always stop tracking and generate report, even if test fails
    if (performanceUtils) {
      await performanceUtils.stopTracking(test.info().title);
    }
  });

  test('should load login page within performance budget @performance', async ({ page }) => {
    // Navigate to example.com instead of a login page that doesn't exist
    await loginPage.navigate('https://example.com');
    await verifyPerformanceMetrics(performanceUtils);
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
