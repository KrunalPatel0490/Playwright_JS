/**
 * Environment configuration for different test environments
 */

const environments = {
  dev: {
    baseURL: 'https://dev.example.com',
    apiURL: 'https://api-dev.example.com',
    timeout: 30000,
    retries: 1,
  },
  staging: {
    baseURL: 'https://staging.example.com',
    apiURL: 'https://api-staging.example.com',
    timeout: 30000,
    retries: 2,
  },
  prod: {
    baseURL: 'https://example.com',
    apiURL: 'https://api.example.com',
    timeout: 60000,
    retries: 3,
  },
};

/**
 * Get environment configuration
 * @param {string} env - Environment name (dev, staging, prod)
 * @returns {Object} Environment configuration
 */
function getEnvironment(env = 'dev') {
  const environment = environments[env.toLowerCase()];
  if (!environment) {
    throw new Error(
      `Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`
    );
  }
  return environment;
}

/**
 * Get current environment from NODE_ENV or default to 'dev'
 * @returns {Object} Current environment configuration
 */
function getCurrentEnvironment() {
  const env = process.env.NODE_ENV || process.env.TEST_ENV || 'dev';
  return getEnvironment(env);
}

module.exports = {
  environments,
  getEnvironment,
  getCurrentEnvironment,
};
