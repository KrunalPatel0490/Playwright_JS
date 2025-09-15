module.exports = {
  outputDir: 'allure-results',

  // Environment information
  environmentInfo: {
    'Test Environment': process.env.NODE_ENV || 'dev',
    Browser: 'Multi-browser (Chromium, Firefox, WebKit)',
    OS: process.platform,
    'Node Version': process.version,
    'Playwright Version': require('@playwright/test/package.json').version,
  },

  // Categories for test organization
  categories: [
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
    },
    {
      name: 'Test defects',
      matchedStatuses: ['broken'],
    },
    {
      name: 'Ignored tests',
      matchedStatuses: ['skipped'],
    },
  ],

  // Report configuration
  reportName: 'Playwright Test Report',
  reportTitle: 'Automation Test Results',
};
