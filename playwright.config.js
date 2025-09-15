// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { getCurrentEnvironment } = require('./config/environment');

// Get current environment settings
const env = getCurrentEnvironment();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  /* ===========================================================
   * TEST TAGS CONFIGURATION
   * =========================================================== */
  // Define test tags that can be used to filter tests
  // Example: npx playwright test --grep @smoke
  //          npx playwright test --grep "@smoke|@regression"
  //          npx playwright test --grep-invert @slow
  grep: process.env.GREP ? new RegExp(process.env.GREP) : undefined,
  grepInvert: process.env.GREP_INVERT ? new RegExp(process.env.GREP_INVERT) : undefined,

  /* ===========================================================
   * PARALLEL EXECUTION CONFIGURATION
   * =========================================================== */
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Configure number of retries for flaky tests */
  retries: process.env.CI ? 2 : 0,

  /* Configure number of workers based on environment */
  workers: process.env.CI ? 2 : '50%', // Use 50% of available CPU cores locally

  /* Maximum number of test failures before stopping the test run */
  maxFailures: process.env.CI ? 10 : 0, // Don't stop on failures locally

  /* Reporter to use */
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: 'test-results/html-reports/',
      },
    ],
    ['list'], // Console reporter
    [
      'junit',
      {
        outputFile: 'test-results/junit/results.xml',
      },
    ],
    // Allure Reports - uncomment to use
    // [
    //   'allure-playwright',
    //   {
    //     outputFolder: 'allure-results',
    //   },
    // ],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Maximum time each action such as `click()` can take */
    actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: env.baseURL || 'https://demo.automationtesting.in',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Parallel execution within Chromium
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/*.{test,spec}.js',
    },

    // Parallel execution within Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/*.{test,spec}.js',
    },

    // Parallel execution within WebKit
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/*.{test,spec}.js',
    },

    // Mobile view tests (runs in parallel with desktop tests)
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5'],
      testMatch: '**/mobile/*.{test,spec}.js',
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/artifacts/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
