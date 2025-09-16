module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:playwright/recommended', 'prettier'],
  plugins: ['playwright'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // General JavaScript rules
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',

    // Code quality rules (relaxed for initial setup)
    complexity: ['warn', 15],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', 70],
    'max-params': ['warn', 5],

    // Playwright-specific rules
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-element-handle': 'warn',
    'playwright/no-eval': 'warn',
    'playwright/no-focused-test': 'error',
    'playwright/no-force-option': 'warn',
    'playwright/no-page-pause': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-useless-await': 'error',
    'playwright/no-wait-for-timeout': 'warn',
    'playwright/prefer-web-first-assertions': 'error',
    'playwright/valid-expect': 'error',

    // Test organization
    'playwright/expect-expect': 'warn',
    'playwright/max-nested-describe': ['error', { max: 3 }],
    'playwright/prefer-lowercase-title': 'error',
    'playwright/prefer-to-be': 'error',
    'playwright/prefer-to-have-length': 'error',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-console': 'off', // Allow console in tests for debugging
        'playwright/no-conditional-in-test': 'off', // Allow conditionals in tests for now
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['*.config.js', 'playwright.config.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'test-results/',
    'playwright-report/',
    'allure-results/',
    'allure-report/',
    'allure-single-report/',
    'coverage/',
  ],
};
