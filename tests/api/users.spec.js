const { test, expect } = require('@playwright/test');
const AuthManager = require('./auth-manager');
const ApiHelpers = require('./api-helpers');
const DataFactories = require('./data-factories');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Helper function to create a new context
const createTestContext = async request => {
  return request.newContext({ baseURL: BASE_URL });
};

// Test cases for GET /users endpoint
const testGetUsers = () =>
  test('should get all users', async ({ request }) => {
    const context = await createTestContext(request);
    const response = await context.get('/users');

    // Store the response status and content type for assertions
    const status = response.status();
    const contentType = response.headers()['content-type'];

    // Make explicit assertions that Playwright can detect
    expect(status, 'Response status should be 200').toBe(200);
    expect(contentType, 'Content-Type should be application/json').toContain('application/json');

    const users = await response.json();

    // Assert array is not empty and has expected structure
    expect(Array.isArray(users), 'Response should be an array').toBe(true);
    expect(users.length, 'Users array should not be empty').toBeGreaterThan(0);

    // Check first user has required fields
    if (users.length > 0) {
      const user = users[0];
      expect(user, 'User object should have required fields').toHaveProperty('id');
      expect(user, 'User object should have required fields').toHaveProperty('name');
      expect(user, 'User object should have required fields').toHaveProperty('email');
      expect(user, 'User object should have required fields').toHaveProperty('username');

      // Still use helper for email format validation
      ApiHelpers.assertEmailFormat(user.email);
    }

    await context.dispose();
  });

test('should get user by ID', async ({ request }) => {
  const context = await createTestContext(request);
  const userId = 1;
  const response = await context.get(`/users/${userId}`);

  await ApiHelpers.assertStatus(response, 200);

  const user = await response.json();
  ApiHelpers.assertHasFields(user, ['id', 'name', 'email', 'username']);
  expect(user.id).toBe(userId);

  await context.dispose();
});

test('should handle user not found', async ({ request }) => {
  const context = await createTestContext(request);
  const response = await context.get('/users/999999');
  await ApiHelpers.assertStatus(response, 404);

  // Add explicit assertion
  const responseData = await response.json();
  expect(responseData).toHaveProperty('error'); // or any other expected error property
  expect(responseData.error).toBe('User not found'); // adjust based on your API response

  await context.dispose();
});

// Test cases for POST /users endpoint
const testCreateUser = () => {
  test('should create new user', async ({ request }) => {
    const context = await createTestContext(request);
    const newUser = DataFactories.createUser();

    const response = await context.post('/users', {
      data: newUser,
    });

    await ApiHelpers.assertStatus(response, 201);

    const createdUser = await response.json();
    expect(createdUser).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    });

    await context.dispose();
  });
};

// Test cases for PUT /users/:id endpoint
const testUpdateUser = () => {
  test('should update user', async ({ request }) => {
    const context = await createTestContext(request);
    const userId = 1;
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    const response = await context.put(`/users/${userId}`, {
      data: updateData,
    });

    await ApiHelpers.assertSuccess(response);

    const updatedUser = await response.json();
    expect(updatedUser.id).toBe(userId);
    expect(updatedUser.name).toBe(updateData.name);
    expect(updatedUser.email).toBe(updateData.email);

    await context.dispose();
  });
};

// Test cases for DELETE /users/:id endpoint
const testDeleteUser = () => {
  test('should delete user', async ({ request }) => {
    const context = await createTestContext(request);
    const userId = 1;

    // First, verify the user exists
    const getResponse = await context.get(`/users/${userId}`);
    await ApiHelpers.assertSuccess(getResponse);
    const user = await getResponse.json();
    expect(user).toBeTruthy();

    // Delete the user
    const deleteResponse = await context.delete(`/users/${userId}`);
    await ApiHelpers.assertSuccess(deleteResponse);

    // Verify the user no longer exists
    const verifyResponse = await context.get(`/users/${userId}`, {
      failOnStatusCode: false,
    });
    expect(verifyResponse.status()).toBe(404);

    await context.dispose();
  });
};

// Test cases for performance and headers
const testPerformanceAndHeaders = () => {
  test('should validate response time', async ({ request }) => {
    const context = await createTestContext(request);
    const startTime = Date.now();

    const response = await context.get('/users');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await ApiHelpers.assertSuccess(response);
    expect(responseTime).toBeLessThan(3000); // 3 seconds max

    await context.dispose();
  });

  test('should validate response headers', async ({ request }) => {
    const context = await createTestContext(request);
    const response = await context.get('/users');

    // Explicitly check the response status and content-type header
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    await context.dispose();
  });
};

// Main test suite
test.describe('users API Tests', () => {
  let authManager;

  test.beforeAll(async () => {
    authManager = new AuthManager(BASE_URL);
  });

  test.afterAll(async () => {
    authManager.clearAllTokens();
  });

  // Run all test groups
  testGetUsers();
  testCreateUser();
  testUpdateUser();
  testDeleteUser();
  testPerformanceAndHeaders();
});
