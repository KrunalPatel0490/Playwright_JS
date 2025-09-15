# Playwright Automation Framework

A robust test automation framework built with Playwright, featuring Page Object
Model (POM) design pattern and data-driven testing capabilities.

## Features

- **Page Object Model (POM)** for better test maintenance
- **Test Tagging** for flexible test organization and execution
- **Data-Driven Testing** with support for JSON and CSV files
- **Parallel Test Execution** for faster test runs
- **Cross-Browser Testing** (Chromium, Firefox, WebKit)
- **Mobile Emulation** for responsive testing
- **Comprehensive Reporting** with HTML, JUnit, and console reporters
- **Environment Configuration** for different environments (dev, staging, prod)
- **Automatic Screenshots** on test failure
- **API Testing** with data factories, authentication manager, test helpers, and
  mocking capabilities
- **Allure Reports Integration** for detailed test insights and reporting

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Test Tags

We've implemented a tagging system to help organize and filter tests. Tags can
be used to run specific groups of tests.

### Available Tags

- `@smoke`: Critical path tests that verify core functionality
- `@regression`: Tests that cover existing functionality
- `@ui`: Tests that verify UI elements and interactions
- `@search`: Tests related to search functionality
- `@google`: Tests specific to Google search

### Running Tests by Tags

Run tests with specific tags:

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run tests with multiple tags (OR condition)
npx playwright test --grep "@smoke|@regression"

# Exclude specific tags
npx playwright test --grep-invert @slow

# Using environment variables
GREP=@smoke npx playwright test
```

### Adding Tags to Tests

```javascript
// Tag a single test
test('should verify search functionality @smoke @search', async ({ page }) => {
  // test code
});

// Tag all tests in a describe block
test.describe('Search Feature', { tag: '@search' }, () => {
  // all tests here will inherit the @search tag
});
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in UI mode

```bash
npm run test:ui
```

### Run tests with specific tags

```bash
# Run only smoke tests
npm test -- --grep @smoke

# Run tests and generate Allure report
npm run test:allure -- --grep @smoke
```

## Data-Driven Testing

This framework supports data-driven testing using both JSON and CSV files.

### Test Data Structure

#### JSON Format

Create a JSON file in the `test-data` directory:

```json
{
  "validRegistrations": [
    {
      "testName": "test_case_1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "1234567890",
      "gender": "Male",
      "hobbies": ["Cricket", "Movies"],
      "skills": "Java",
      "country": "India"
    }
  ]
}
```

#### CSV Format

Create a CSV file in the `test-data` directory:

```csv
testName,firstName,lastName,email,phone,gender,hobbies,skills,country
test_case_1,John,Doe,john.doe@example.com,1234567890,Male,"Cricket, Movies",Java,India
```

### Using Test Data in Tests

````javascript
const DataUtils = require('./utils/data-utils');

// Load test data
const testData = DataUtils.loadTestData('test-data/registration-data.json');

test('data-driven test example', async ({ page }) => {
  const registrationPage = new RegistrationPage(page);

  for (const data of testData.validRegistrations) {
    await registrationPage.navigate();
    await registrationPage.fillRegistrationForm(data);
    await registrationPage.submitForm();
    // Add assertions
  }
});

## API Testing Features

This framework now includes comprehensive API testing capabilities:

### 1. API Test Data Factories
Generate realistic test data using Faker.js:

```javascript
const DataFactories = require('./tests/api/data-factories');

// Generate user data
const user = DataFactories.createUser();
const users = DataFactories.createMultiple(DataFactories.createUser, 10);

// Generate products, orders, auth credentials
const product = DataFactories.createProduct();
const order = DataFactories.createOrder();
const credentials = DataFactories.createAuthCredentials();
````

### 2. API Authentication Manager

Handle authentication flows:

```javascript
const AuthManager = require('./tests/api/auth-manager');

const authManager = new AuthManager('https://api.example.com');
await authManager.login('user@example.com', 'password');
const context =
  await authManager.createAuthenticatedContext('user@example.com');
```

### 3. API Test Helpers

Common assertions and utilities:

```javascript
const ApiHelpers = require('./tests/api/api-helpers');

await ApiHelpers.assertSuccess(response);
await ApiHelpers.assertContentType(response);
ApiHelpers.assertHasFields(responseBody, ['id', 'name', 'email']);
ApiHelpers.assertArrayResponse(array, { minLength: 1 });
```

### 4. API Mocking for UI Tests

Mock API responses in UI tests:

```javascript
const ApiMocker = require('./tests/api/api-mocker');

const apiMocker = new ApiMocker(page);
await apiMocker.mockGet('/api/users', userData);
await apiMocker.mockAuth(); // Mock authentication endpoints
await apiMocker.mockCrudOperations('users', DataFactories.createUser);
```

### Running API Tests

```bash
# Run all tests (UI + API)
npm test

# Run only API tests
npx playwright test tests/api/

# Run specific API test
npx playwright test tests/api/users.spec.js
```

## Project Structure

```
├── config/
│   └── environment.js     # Environment configuration
├── test-data/             # Test data files (JSON/CSV)
├── tests/
│   ├── example/           # Example test files
│   ├── pages/             # Page object classes
│   └── utils/             # Utility functions
├── .gitignore
├── package.json
└── playwright.config.js   # Playwright configuration
```

## Best Practices

1. **Page Objects**: Keep page-specific selectors and methods in page object
   classes.
2. **Test Data**: Store test data in external files (JSON/CSV) for better
   maintainability.
3. **Selectors**: Use data-testid attributes for stable element selection.
4. **Assertions**: Add meaningful assertions for each test case.
5. **Parallel Execution**: Use parallel execution for faster test runs.

## Reporting

After test execution, view the HTML report:

```bash
npx playwright show-report
```

## Allure Reports Integration

This framework includes Allure Reports integration for detailed test insights
and reporting.

### Allure Reports Features

- Detailed test execution dashboard
- Automatic screenshot capture on failures
- Test categorization and tagging
- System information and environment details
- Interactive charts and statistics
- Modern, responsive UI

### Configuration Options

**Enable Allure Reports:** Uncomment the Allure Reports configuration in
`playwright.config.js`:

```javascript
reporter: [
  ['html', {
    open: 'never',
    outputFolder: 'test-results/html-reports/'
  }],
  ['list'],
  ['junit', {
    outputFile: 'test-results/junit/results.xml'
  }],
  ['./tests/utils/allure-reporter.js', {
    outputFolder: 'allure-reports',
    reportName: 'Playwright-Test-Report.html'
  }]
],
```

**Customize Allure Reports:** Edit `tests/utils/allure-config.js` to modify:

- Report themes and styling
- System information
- Screenshot settings
- Test categories

## Troubleshooting

- If tests fail with browser launch errors, ensure all required browsers are
  installed:

  ```bash
  npx playwright install
  ```

- For debugging, use the Playwright Inspector:
  ```bash
  npx playwright test --debug
  ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
