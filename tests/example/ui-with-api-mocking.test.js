const { test, expect } = require('@playwright/test');
const ApiMocker = require('../api/api-mocker');
const DataFactories = require('../api/data-factories');

test.describe('UI Tests with API Mocking', () => {
    let apiMocker;

    test.beforeEach(async ({ page }) => {
        apiMocker = new ApiMocker(page);
    });

    test('should mock user login flow', async ({ page }) => {
        // Mock authentication endpoints
        await apiMocker.mockAuth();

        // Navigate to login page (example URL)
        await page.goto('https://example.com/login');

        // Fill login form
        await page.fill('#email', 'test@example.com');
        await page.fill('#password', 'password123');
        await page.click('#login-button');

        // Wait for API call and verify it was made
        await apiMocker.waitForApiCall('**/auth/login', 'POST');
        expect(apiMocker.wasApiCalled('**/auth/login', 'POST')).toBeTruthy();

        // Verify successful login redirect or UI change
        // await expect(page).toHaveURL('**/dashboard');
    });

    test('should mock user data with CRUD operations', async ({ page }) => {
        const users = DataFactories.createMultiple(DataFactories.createUser, 5);
        
        // Mock CRUD operations for users
        await apiMocker.mockCrudOperations('users', DataFactories.createUser, users);

        // Navigate to users page
        await page.goto('https://example.com/users');

        // Wait for users list to load
        await apiMocker.waitForApiCall('**/users', 'GET');

        // Verify users are displayed (example selectors)
        // await expect(page.locator('.user-list .user-item')).toHaveCount(5);

        // Test creating a new user
        // await page.click('#add-user-button');
        // await page.fill('#user-name', 'New User');
        // await page.fill('#user-email', 'newuser@example.com');
        // await page.click('#save-user');

        // Verify POST request was made
        // await apiMocker.waitForApiCall('**/users', 'POST');
    });

    test('should mock API error responses', async ({ page }) => {
        // Mock server error
        await apiMocker.mockError('**/users', 500, 'Internal Server Error');

        await page.goto('https://example.com/users');

        // Wait for error response
        await apiMocker.waitForApiCall('**/users', 'GET');

        // Verify error handling in UI
        // await expect(page.locator('.error-message')).toBeVisible();
        // await expect(page.locator('.error-message')).toContainText('Server Error');
    });

    test('should mock paginated data', async ({ page }) => {
        const allUsers = DataFactories.createMultiple(DataFactories.createUser, 25);
        
        // Mock paginated response
        await apiMocker.mockPaginatedResponse('**/users', allUsers, {
            defaultLimit: 10
        });

        await page.goto('https://example.com/users');

        // Wait for first page load
        await apiMocker.waitForApiCall('**/users', 'GET');

        // Verify pagination controls
        // await expect(page.locator('.pagination')).toBeVisible();
        // await expect(page.locator('.user-item')).toHaveCount(10);

        // Test pagination
        // await page.click('.pagination .next-page');
        // await apiMocker.waitForApiCall('**/users?page=2', 'GET');
    });

    test('should mock slow API responses', async ({ page }) => {
        const users = DataFactories.createMultiple(DataFactories.createUser, 3);
        
        // Mock with delay to test loading states
        await apiMocker.mockGet('**/users', 
            DataFactories.createApiResponse(users), 
            { delay: 2000 }
        );

        await page.goto('https://example.com/users');

        // Verify loading state is shown
        // await expect(page.locator('.loading-spinner')).toBeVisible();

        // Wait for data to load
        await apiMocker.waitForApiCall('**/users', 'GET');

        // Verify loading state is hidden and data is shown
        // await expect(page.locator('.loading-spinner')).toBeHidden();
        // await expect(page.locator('.user-item')).toHaveCount(3);
    });

    test.afterEach(async () => {
        // Clean up mocks after each test
        apiMocker.clearMocks();
    });
});
