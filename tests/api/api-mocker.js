const DataFactories = require('./data-factories');

/**
 * API mocking utilities for UI tests
 */
class ApiMocker {
    constructor(page) {
        this.page = page;
        this.mocks = new Map();
        this.interceptedRequests = [];
    }

    /**
     * Mock a GET request with static response
     * @param {string} urlPattern - URL pattern to match (supports wildcards)
     * @param {Object} responseData - Response data to return
     * @param {Object} options - Additional options (status, headers, delay)
     */
    async mockGet(urlPattern, responseData, options = {}) {
        const mockConfig = {
            method: 'GET',
            urlPattern,
            responseData,
            status: options.status || 200,
            headers: options.headers || { 'content-type': 'application/json' },
            delay: options.delay || 0
        };

        this.mocks.set(`GET:${urlPattern}`, mockConfig);
        await this.setupInterception();
    }

    /**
     * Mock a POST request with dynamic response based on request data
     * @param {string} urlPattern - URL pattern to match
     * @param {Function|Object} responseHandler - Function or static response
     * @param {Object} options - Additional options
     */
    async mockPost(urlPattern, responseHandler, options = {}) {
        const mockConfig = {
            method: 'POST',
            urlPattern,
            responseHandler,
            status: options.status || 201,
            headers: options.headers || { 'content-type': 'application/json' },
            delay: options.delay || 0
        };

        this.mocks.set(`POST:${urlPattern}`, mockConfig);
        await this.setupInterception();
    }

    /**
     * Mock PUT request
     * @param {string} urlPattern - URL pattern to match
     * @param {Function|Object} responseHandler - Function or static response
     * @param {Object} options - Additional options
     */
    async mockPut(urlPattern, responseHandler, options = {}) {
        const mockConfig = {
            method: 'PUT',
            urlPattern,
            responseHandler,
            status: options.status || 200,
            headers: options.headers || { 'content-type': 'application/json' },
            delay: options.delay || 0
        };

        this.mocks.set(`PUT:${urlPattern}`, mockConfig);
        await this.setupInterception();
    }

    /**
     * Mock DELETE request
     * @param {string} urlPattern - URL pattern to match
     * @param {Function|Object} responseHandler - Function or static response
     * @param {Object} options - Additional options
     */
    async mockDelete(urlPattern, responseHandler, options = {}) {
        const mockConfig = {
            method: 'DELETE',
            urlPattern,
            responseHandler,
            status: options.status || 204,
            headers: options.headers || {},
            delay: options.delay || 0
        };

        this.mocks.set(`DELETE:${urlPattern}`, mockConfig);
        await this.setupInterception();
    }

    /**
     * Mock API error response
     * @param {string} urlPattern - URL pattern to match
     * @param {number} statusCode - Error status code
     * @param {string} errorMessage - Error message
     * @param {string} method - HTTP method (default: GET)
     */
    async mockError(urlPattern, statusCode, errorMessage, method = 'GET') {
        const errorResponse = DataFactories.createErrorResponse(errorMessage, statusCode);
        
        const mockConfig = {
            method: method.toUpperCase(),
            urlPattern,
            responseData: errorResponse,
            status: statusCode,
            headers: { 'content-type': 'application/json' },
            delay: 0
        };

        this.mocks.set(`${method.toUpperCase()}:${urlPattern}`, mockConfig);
        await this.setupInterception();
    }

    /**
     * Mock paginated API response
     * @param {string} urlPattern - URL pattern to match
     * @param {Array} allData - Complete dataset
     * @param {Object} options - Pagination options
     */
    async mockPaginatedResponse(urlPattern, allData, options = {}) {
        const defaultLimit = options.defaultLimit || 10;
        
        const responseHandler = (request) => {
            const url = new URL(request.url());
            const page = parseInt(url.searchParams.get('page')) || 1;
            const limit = parseInt(url.searchParams.get('limit')) || defaultLimit;
            
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = allData.slice(startIndex, endIndex);
            
            return DataFactories.createApiResponse(paginatedData, {
                page,
                limit,
                total: allData.length,
                totalPages: Math.ceil(allData.length / limit)
            });
        };

        await this.mockGet(urlPattern, responseHandler);
    }

    /**
     * Mock authentication endpoints
     * @param {Object} config - Auth configuration
     */
    async mockAuth(config = {}) {
        // Mock login endpoint
        await this.mockPost('/auth/login', (request) => {
            const body = request.postDataJSON();
            
            if (body.username === 'test@example.com' && body.password === 'password123') {
                return {
                    success: true,
                    data: {
                        access_token: 'mock-jwt-token-12345',
                        refresh_token: 'mock-refresh-token-67890',
                        expires_in: 3600,
                        user: DataFactories.createUser({
                            email: body.username,
                            role: 'user'
                        })
                    }
                };
            } else {
                return DataFactories.createErrorResponse('Invalid credentials', 401);
            }
        });

        // Mock user info endpoint
        await this.mockGet('/auth/me', {
            success: true,
            data: DataFactories.createUser({
                email: 'test@example.com',
                role: 'user'
            })
        });

        // Mock logout endpoint
        await this.mockPost('/auth/logout', {
            success: true,
            message: 'Logged out successfully'
        });
    }

    /**
     * Mock CRUD operations for a resource
     * @param {string} resourceName - Resource name (e.g., 'users', 'products')
     * @param {Function} factoryMethod - Data factory method
     * @param {Array} initialData - Initial dataset
     */
    async mockCrudOperations(resourceName, factoryMethod, initialData = []) {
        let data = [...initialData];
        let nextId = Math.max(...data.map(item => item.id || 0)) + 1;

        // GET /resource - List all
        await this.mockGet(`**/${resourceName}`, () => {
            return DataFactories.createApiResponse(data);
        });

        // GET /resource/:id - Get by ID
        await this.mockGet(`**/${resourceName}/*`, (request) => {
            const url = new URL(request.url());
            const id = parseInt(url.pathname.split('/').pop());
            const item = data.find(d => d.id === id);
            
            if (item) {
                return DataFactories.createApiResponse(item);
            } else {
                return DataFactories.createErrorResponse('Resource not found', 404);
            }
        });

        // POST /resource - Create new
        await this.mockPost(`**/${resourceName}`, (request) => {
            const body = request.postDataJSON();
            const newItem = { ...body, id: nextId++, createdAt: new Date().toISOString() };
            data.push(newItem);
            return DataFactories.createApiResponse(newItem);
        }, { status: 201 });

        // PUT /resource/:id - Update
        await this.mockPut(`**/${resourceName}/*`, (request) => {
            const url = new URL(request.url());
            const id = parseInt(url.pathname.split('/').pop());
            const body = request.postDataJSON();
            const index = data.findIndex(d => d.id === id);
            
            if (index !== -1) {
                data[index] = { ...data[index], ...body, updatedAt: new Date().toISOString() };
                return DataFactories.createApiResponse(data[index]);
            } else {
                return DataFactories.createErrorResponse('Resource not found', 404);
            }
        });

        // DELETE /resource/:id - Delete
        await this.mockDelete(`**/${resourceName}/*`, (request) => {
            const url = new URL(request.url());
            const id = parseInt(url.pathname.split('/').pop());
            const index = data.findIndex(d => d.id === id);
            
            if (index !== -1) {
                data.splice(index, 1);
                return { success: true, message: 'Resource deleted' };
            } else {
                return DataFactories.createErrorResponse('Resource not found', 404);
            }
        });
    }

    /**
     * Setup request interception
     */
    async setupInterception() {
        if (this.intercepted) return;
        
        await this.page.route('**/*', async (route, request) => {
            const method = request.method();
            const url = request.url();
            
            // Find matching mock
            const mockKey = this.findMatchingMock(method, url);
            if (mockKey) {
                const mock = this.mocks.get(mockKey);
                await this.handleMockedRequest(route, request, mock);
            } else {
                // Let the request continue normally
                await route.continue();
            }
        });
        
        this.intercepted = true;
    }

    /**
     * Find matching mock configuration
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @returns {string|null} Mock key if found
     */
    findMatchingMock(method, url) {
        for (const [key, mock] of this.mocks) {
            if (mock.method === method && this.urlMatches(url, mock.urlPattern)) {
                return key;
            }
        }
        return null;
    }

    /**
     * Check if URL matches pattern
     * @param {string} url - Request URL
     * @param {string} pattern - URL pattern with wildcards
     * @returns {boolean} True if matches
     */
    urlMatches(url, pattern) {
        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '\\?');
        
        const regex = new RegExp(regexPattern);
        return regex.test(url);
    }

    /**
     * Handle mocked request
     * @param {Route} route - Playwright route
     * @param {Request} request - Playwright request
     * @param {Object} mock - Mock configuration
     */
    async handleMockedRequest(route, request, mock) {
        // Log intercepted request
        this.interceptedRequests.push({
            method: request.method(),
            url: request.url(),
            timestamp: new Date().toISOString()
        });

        // Add delay if specified
        if (mock.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, mock.delay));
        }

        // Generate response data
        let responseData = mock.responseData;
        if (typeof mock.responseHandler === 'function') {
            responseData = mock.responseHandler(request);
        } else if (mock.responseHandler) {
            responseData = mock.responseHandler;
        }

        // Fulfill the request with mock response
        await route.fulfill({
            status: mock.status,
            headers: mock.headers,
            body: JSON.stringify(responseData)
        });
    }

    /**
     * Clear all mocks
     */
    clearMocks() {
        this.mocks.clear();
        this.interceptedRequests = [];
    }

    /**
     * Get intercepted requests for verification
     * @returns {Array} List of intercepted requests
     */
    getInterceptedRequests() {
        return this.interceptedRequests;
    }

    /**
     * Wait for specific API call
     * @param {string} urlPattern - URL pattern to wait for
     * @param {string} method - HTTP method (default: GET)
     * @returns {Promise} Promise that resolves when request is made
     */
    async waitForApiCall(urlPattern, method = 'GET') {
        return this.page.waitForRequest(request => {
            return request.method() === method && this.urlMatches(request.url(), urlPattern);
        });
    }

    /**
     * Verify API call was made
     * @param {string} urlPattern - URL pattern to check
     * @param {string} method - HTTP method
     * @returns {boolean} True if call was made
     */
    wasApiCalled(urlPattern, method = 'GET') {
        return this.interceptedRequests.some(req => 
            req.method === method && this.urlMatches(req.url, urlPattern)
        );
    }
}

module.exports = ApiMocker;
