# Test Templates

This directory contains standardized test templates for the Playwright test
suite. These templates help maintain consistency across tests and follow best
practices for different types of testing scenarios.

## Available Templates

1. **Page Object Template** (`page-object.template.js`)
   - Use this template when creating new page object models
   - Follows the Page Object Model (POM) pattern
   - Includes common methods and structure for page objects

2. **Basic Test Template** (`basic-test.template.js`)
   - For standard end-to-end (E2E) tests
   - Includes test structure with setup, actions, and assertions
   - Follows the Arrange-Act-Assert pattern

3. **API Test Template** (`api-test.template.js`)
   - For testing API endpoints
   - Includes request/response handling patterns
   - Supports authentication and request chaining

4. **Component Test Template** (`component-test.template.js`)
   - For testing individual UI components
   - Includes component mounting and interaction patterns
   - Supports testing component states and props

5. **Performance Test Template** (`performance-test.template.js`)
   - For performance testing critical user journeys
   - Includes performance metrics collection and assertions
   - Supports setting and validating performance budgets

## How to Use

1. **Create a new test file** by copying the appropriate template:

   ```bash
   cp tests/templates/basic-test.template.js tests/feature/new-feature.test.js
   ```

2. **Replace placeholders** in the template (enclosed in square brackets `[]`)
   - `[PageName]` - Replace with your page/component name
   - `[feature-name]` - Replace with your feature name
   - `[expected_behavior]` - Describe the expected behavior
   - `[condition]` - Describe the test condition

3. **Customize the test** according to your specific requirements
   - Add test data
   - Implement test steps
   - Add assertions

## Best Practices

1. **Naming Conventions**
   - Test files: `[feature-name].test.js`
   - Page objects: `[page-name]-page.js`
   - Test descriptions: Use "should [expected behavior] when [condition]" format

2. **File Organization**
   - Page objects: `tests/pages/`
   - Test utilities: `tests/utils/`
   - Test data: `tests/test-data/`
   - API tests: `tests/api/`
   - Component tests: `tests/components/`
   - Performance tests: `tests/performance/`

3. **Test Structure**
   - One test file per feature or component
   - Group related tests in `describe` blocks
   - Use `beforeEach`/`afterEach` for test setup/teardown
   - Keep tests independent and isolated

## Example Workflow

1. Create a new page object:

   ```bash
   cp tests/templates/page-object.template.js tests/pages/login-page.js
   ```

2. Create a test file:

   ```bash
   cp tests/templates/basic-test.template.js tests/login/login.test.js
   ```

3. Implement the test logic following the template structure

4. Run your tests:
   ```bash
   npx playwright test tests/login/login.test.js
   ```

## Custom Templates

You can create custom templates for your specific needs by following the same
pattern as the existing templates. Add them to this directory with a
`.template.js` extension.
