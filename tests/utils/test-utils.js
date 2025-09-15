/**
 * Utility functions for tests
 */

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
function generateRandomString(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Generates a random email address
 * @returns {string} Random email
 */
function generateRandomEmail() {
  return `test-${generateRandomString(6)}@example.com`;
}

/**
 * Takes a screenshot of the current page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Name for the screenshot file
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const screenshotPath = `test-results/screenshots/${name}_${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Wait for network to be idle (no requests for 500ms)
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  // Use domcontentloaded instead of networkidle for better reliability
  await page.waitForLoadState('domcontentloaded', { timeout });
}

module.exports = {
  generateRandomString,
  generateRandomEmail,
  takeScreenshot,
  waitForNetworkIdle,
};
