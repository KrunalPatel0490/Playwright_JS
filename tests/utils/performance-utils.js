const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

class PerformanceUtils {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Configuration options
   * @param {string} [options.outputDir='test-results/performance'] - Directory to save performance reports
   * @param {boolean} [options.enableReporting=true] - Whether to generate performance reports
   */
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      outputDir: 'test-results/performance',
      enableReporting: true,
      ...options,
    };
    this.metrics = {};
    this.performanceEntries = [];
  }

  /**
   * Start tracking performance metrics
   */
  async startTracking() {
    // Clear any existing performance entries
    await this.page.evaluate(() => window.performance.clearMarks());
    await this.page.evaluate(() => window.performance.clearMeasures());

    // Start tracking navigation timing
    await this.page.evaluate(() => {
      window.performance.mark('test-start');
    });
  }

  /**
   * Stop tracking and collect performance metrics
   * @param {string} testName - Name of the test for reporting
   * @returns {Promise<Object>} Collected performance metrics
   */
  async stopTracking(testName) {
    // Get navigation timing
    const navigationTiming = await this.page.evaluate(() => {
      const [timing] = performance.getEntriesByType('navigation');
      return timing ? timing.toJSON() : null;
    });

    // Get resource timing
    const resourceTiming = await this.page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        duration: resource.duration,
        initiatorType: resource.initiatorType,
        transferSize: resource.transferSize,
      }));
    });

    // Get paint timing
    const paintTiming = await this.page.evaluate(() => {
      const [firstPaint, firstContentfulPaint, largestContentfulPaint] =
        performance.getEntriesByType('paint');
      return {
        firstPaint: firstPaint?.startTime,
        firstContentfulPaint: firstContentfulPaint?.startTime,
        largestContentfulPaint: largestContentfulPaint?.startTime,
      };
    });

    // Calculate total page load time
    const pageLoadTime = await this.page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    // Calculate time to interactive (simplified)
    const timeToInteractive = await this.page.evaluate(() => {
      return performance.timing.domInteractive - performance.timing.navigationStart;
    });

    // Calculate total resources size
    const totalResourcesSize = resourceTiming.reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    );

    // Calculate number of requests
    const totalRequests = resourceTiming.length;

    // Store metrics
    this.metrics = {
      testName,
      timestamp: new Date().toISOString(),
      navigationTiming,
      resourceTiming,
      paintTiming,
      pageLoadTime,
      timeToInteractive,
      totalResourcesSize,
      totalRequests,
      url: this.page.url(),
    };

    // Generate report if enabled
    if (this.options.enableReporting) {
      await this._generateReport();
    }

    return this.metrics;
  }

  /**
   * Assert performance metrics against budget
   * @param {Object} budget - Performance budget
   * @param {number} [budget.pageLoadTime] - Maximum page load time in ms
   * @param {number} [budget.timeToInteractive] - Maximum time to interactive in ms
   * @param {number} [budget.totalRequests] - Maximum number of requests
   * @param {number} [budget.totalResourcesSize] - Maximum total resources size in bytes
   */
  assertPerformanceBudget(budget) {
    if (budget.pageLoadTime) {
      expect(
        this.metrics.pageLoadTime,
        `Page load time (${this.metrics.pageLoadTime}ms) exceeds budget (${budget.pageLoadTime}ms)`
      ).toBeLessThanOrEqual(budget.pageLoadTime);
    }

    if (budget.timeToInteractive) {
      expect(
        this.metrics.timeToInteractive,
        `Time to interactive (${this.metrics.timeToInteractive}ms) exceeds budget (${budget.timeToInteractive}ms)`
      ).toBeLessThanOrEqual(budget.timeToInteractive);
    }

    if (budget.totalRequests) {
      expect(
        this.metrics.totalRequests,
        `Number of requests (${this.metrics.totalRequests}) exceeds budget (${budget.totalRequests})`
      ).toBeLessThanOrEqual(budget.totalRequests);
    }

    if (budget.totalResourcesSize) {
      expect(
        this.metrics.totalResourcesSize,
        `Total resources size (${this.formatBytes(this.metrics.totalResourcesSize)}) exceeds budget (${this.formatBytes(budget.totalResourcesSize)})`
      ).toBeLessThanOrEqual(budget.totalResourcesSize);
    }
  }

  /**
   * Format bytes to human-readable format
   * @param {number} bytes - Size in bytes
   * @param {number} [decimals=2] - Number of decimal places
   * @returns {string} Formatted string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Generate performance report
   * @private
   */
  async _generateReport() {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // Generate filename with timestamp and test name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const testName = this.metrics.testName.toLowerCase().replace(/\s+/g, '-');
      const filename = `performance-report-${testName}-${timestamp}.json`;
      const filePath = path.join(this.options.outputDir, filename);

      // Write report to file
      fs.writeFileSync(filePath, JSON.stringify(this.metrics, null, 2), 'utf8');

      console.log(`Performance report generated: ${filePath}`);
    } catch (error) {
      console.error('Error generating performance report:', error);
    }
  }
}

module.exports = PerformanceUtils;
