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

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay between retries in milliseconds (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if a retry should be attempted (default: retry on any error)
 * @param {string} options.description - Description of the operation being retried (for logging)
 * @returns {Promise<any>} - The result of the function or throws last error if all retries fail
 */
async function withRetry(
  fn,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
    description = 'Operation',
  } = {}
) {
  let lastError;
  let attempt = 0;
  let delay = initialDelay;

  while (attempt <= maxRetries) {
    try {
      const result = await fn();
      if (attempt > 0) {
        console.log(
          `${description} succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}`
        );
      }
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        console.error(
          `${description} failed after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}:`,
          error.message
        );
        throw error;
      }

      console.warn(
        `${description} attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        error.message
      );

      // Wait with exponential backoff and jitter
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));

      // Calculate next delay with exponential backoff, but don't exceed maxDelay
      delay = Math.min(delay * 2, maxDelay);
      attempt++;
    }
  }

  // This should theoretically never be reached due to the while condition
  throw lastError;
}

/**
 * Create a retryable test step
 * @param {string} description - Description of the test step
 * @param {Function} stepFn - The test step function to retry
 * @param {Object} options - Retry options (same as withRetry options)
 * @returns {Function} A function that can be used in test steps
 */
function createRetryableStep(description, stepFn, options = {}) {
  return async (...args) => {
    return withRetry(() => stepFn(...args), {
      ...options,
      description: `Step "${description}"`,
    });
  };
}

/**
 * Wrap a test function with retry logic
 * @param {Function} testFn - The test function to wrap
 * @param {Object} options - Retry options (same as withRetry options)
 * @returns {Function} The wrapped test function
 */
function withRetryableTest(testFn, options = {}) {
  return async function testWrapper({ page }, testInfo) {
    const testName = testInfo?.title || 'Test';

    return withRetry(
      async () => {
        return testFn({ page });
      },
      {
        ...options,
        description: `Test "${testName}"`,
        shouldRetry: error =>
          options.shouldRetry
            ? options.shouldRetry(error)
            : !(error.name === 'AssertionError' || error.constructor.name === 'AssertionError'),
      }
    );
  };
}

module.exports = {
  generateRandomString,
  generateRandomEmail,
  takeScreenshot,
  waitForNetworkIdle,
  withRetry,
  createRetryableStep,
  withRetryableTest,
};
