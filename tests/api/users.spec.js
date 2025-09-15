const { test, expect } = require('@playwright/test');
const AuthManager = require('./auth-manager');
const ApiHelpers = require('./api-helpers');
const DataFactories = require('./data-factories');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('Users API Tests', () => {
    let authManager;
    let testUser;

    test.beforeAll(async () => {
        authManager = new AuthManager(BASE_URL);
        testUser = DataFactories.createUser({
            email: 'test@example.com',
            username: 'testuser'
        });
    });

    test.afterAll(async () => {
        authManager.clearAllTokens();
    });

    test('should get all users', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const response = await context.get('/users');

        // Use API helpers for assertions
        await ApiHelpers.assertSuccess(response);
        await ApiHelpers.assertContentType(response);

        const users = await response.json();
        ApiHelpers.assertArrayResponse(users, {
            minLength: 1,
            itemSchema: {
                id: 0,
                name: '',
                email: '',
                username: ''
            }
        });

        // Validate each user has proper email format
        users.forEach(user => {
            ApiHelpers.assertEmailFormat(user.email);
            ApiHelpers.assertIdFormat(user.id, 'numeric');
        });

        await context.dispose();
    });

    test('should get user by ID', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const userId = 1;
        const response = await context.get(`/users/${userId}`);

        await ApiHelpers.assertStatus(response, 200);
        
        const user = await response.json();
        ApiHelpers.assertHasFields(user, ['id', 'name', 'email', 'username']);
        expect(user.id).toBe(userId);

        await context.dispose();
    });

    test('should handle user not found', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const response = await context.get('/users/999999');

        await ApiHelpers.assertStatus(response, 404);
        await context.dispose();
    });

    test('should create new user', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const newUser = DataFactories.createUser();

        const response = await context.post('/users', {
            data: newUser
        });

        await ApiHelpers.assertStatus(response, 201);
        
        const createdUser = await response.json();
        expect(createdUser).toMatchObject({
            name: newUser.name,
            email: newUser.email,
            username: newUser.username
        });

        await context.dispose();
    });

    test('should update user', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const userId = 1;
        const updateData = {
            name: 'Updated Name',
            email: 'updated@example.com'
        };

        const response = await context.put(`/users/${userId}`, {
            data: updateData
        });

        await ApiHelpers.assertSuccess(response);
        
        const updatedUser = await response.json();
        expect(updatedUser.id).toBe(userId);
        expect(updatedUser.name).toBe(updateData.name);
        expect(updatedUser.email).toBe(updateData.email);

        await context.dispose();
    });

    test('should delete user', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const userId = 1;

        const response = await context.delete(`/users/${userId}`);
        await ApiHelpers.assertSuccess(response);

        await context.dispose();
    });

    test('should validate response time', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const startTime = Date.now();
        
        const response = await context.get('/users');
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        await ApiHelpers.assertSuccess(response);
        expect(responseTime).toBeLessThan(3000); // 3 seconds max

        await context.dispose();
    });

    test('should validate response headers', async ({ request }) => {
        const context = await request.newContext({ baseURL: BASE_URL });
        const response = await context.get('/users');

        ApiHelpers.assertHeaders(response, {
            'content-type': 'application/json'
        });

        await context.dispose();
    });
});
