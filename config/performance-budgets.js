/**
 * Performance Budget Configuration
 *
 * This file defines performance budgets for different types of pages in the application.
 * Budgets are defined in milliseconds for timing metrics and bytes for size metrics.
 */

// Common performance budgets for all pages
const COMMON_BUDGETS = {
  // Maximum time for the page to become interactive
  timeToInteractive: 5000, // 5 seconds
  // Maximum number of HTTP requests
  totalRequests: 50,
  // Maximum total size of all resources (in bytes)
  totalResourcesSize: 2 * 1024 * 1024, // 2MB
};

// Page-specific performance budgets
const PAGE_BUDGETS = {
  // Home page
  '/': {
    pageLoadTime: 2000, // 2 seconds
    ...COMMON_BUDGETS,
  },

  // Search results page
  '/search': {
    pageLoadTime: 2500, // 2.5 seconds
    ...COMMON_BUDGETS,
    // Allow more requests for search results
    totalRequests: 60,
  },

  // Product detail page
  '/products/': {
    pageLoadTime: 3000, // 3 seconds
    ...COMMON_BUDGETS,
    // Allow larger resources for product images
    totalResourcesSize: 3 * 1024 * 1024, // 3MB
  },

  // Default budget for all other pages
  default: {
    pageLoadTime: 3000, // 3 seconds
    ...COMMON_BUDGETS,
  },
};

/**
 * Get the appropriate performance budget for a given URL
 * @param {string} url - The URL to get the budget for
 * @returns {Object} The performance budget for the URL
 */
function getPerformanceBudget(url) {
  // Extract the path from the URL
  const path = new URL(url).pathname;

  // Find the most specific matching budget
  const matchingPath = Object.keys(PAGE_BUDGETS)
    .filter(key => key !== 'default')
    .find(key => path.startsWith(key));

  return matchingPath ? PAGE_BUDGETS[matchingPath] : PAGE_BUDGETS.default;
}

module.exports = {
  COMMON_BUDGETS,
  PAGE_BUDGETS,
  getPerformanceBudget,
};
