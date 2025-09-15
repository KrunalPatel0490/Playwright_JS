const { expect } = require('@playwright/test');

/**
 * API test helpers for common assertions and utilities
 */
class ApiHelpers {
    /**
     * Assert response status code
     * @param {APIResponse} response - Playwright API response
     * @param {number} expectedStatus - Expected status code
     */
    static async assertStatus(response, expectedStatus) {
        expect(response.status()).toBe(expectedStatus);
    }

    /**
     * Assert response is successful (2xx status)
     * @param {APIResponse} response - Playwright API response
     */
    static async assertSuccess(response) {
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBeGreaterThanOrEqual(200);
        expect(response.status()).toBeLessThan(300);
    }

    /**
     * Assert response has correct content type
     * @param {APIResponse} response - Playwright API response
     * @param {string} expectedContentType - Expected content type
     */
    static async assertContentType(response, expectedContentType = 'application/json') {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain(expectedContentType);
    }

    /**
     * Assert response body contains specific fields
     * @param {Object} responseBody - Response body object
     * @param {Array<string>} requiredFields - Array of required field names
     */
    static assertHasFields(responseBody, requiredFields) {
        requiredFields.forEach(field => {
            expect(responseBody).toHaveProperty(field);
        });
    }

    /**
     * Assert response body matches schema structure
     * @param {Object} responseBody - Response body object
     * @param {Object} schema - Expected schema object
     */
    static assertMatchesSchema(responseBody, schema) {
        Object.keys(schema).forEach(key => {
            expect(responseBody).toHaveProperty(key);
            
            if (schema[key] !== null && typeof schema[key] === 'object') {
                expect(typeof responseBody[key]).toBe('object');
                this.assertMatchesSchema(responseBody[key], schema[key]);
            } else {
                expect(typeof responseBody[key]).toBe(typeof schema[key]);
            }
        });
    }

    /**
     * Assert array response properties
     * @param {Array} array - Response array
     * @param {Object} options - Assertion options
     */
    static assertArrayResponse(array, options = {}) {
        expect(Array.isArray(array)).toBeTruthy();
        
        if (options.minLength !== undefined) {
            expect(array.length).toBeGreaterThanOrEqual(options.minLength);
        }
        
        if (options.maxLength !== undefined) {
            expect(array.length).toBeLessThanOrEqual(options.maxLength);
        }
        
        if (options.exactLength !== undefined) {
            expect(array.length).toBe(options.exactLength);
        }
        
        if (options.itemSchema && array.length > 0) {
            array.forEach(item => {
                this.assertMatchesSchema(item, options.itemSchema);
            });
        }
    }

    /**
     * Assert pagination response structure
     * @param {Object} response - Paginated response object
     * @param {Object} options - Pagination options
     */
    static assertPaginationResponse(response, options = {}) {
        // Check pagination metadata
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('meta');
        
        const meta = response.meta;
        expect(meta).toHaveProperty('page');
        expect(meta).toHaveProperty('limit');
        expect(meta).toHaveProperty('total');
        
        expect(typeof meta.page).toBe('number');
        expect(typeof meta.limit).toBe('number');
        expect(typeof meta.total).toBe('number');
        
        // Validate data array
        this.assertArrayResponse(response.data, {
            maxLength: meta.limit,
            itemSchema: options.itemSchema
        });
        
        // Check pagination logic
        if (options.expectedPage) {
            expect(meta.page).toBe(options.expectedPage);
        }
        
        if (options.expectedLimit) {
            expect(meta.limit).toBe(options.expectedLimit);
        }
    }

    /**
     * Assert error response structure
     * @param {Object} errorResponse - Error response object
     * @param {number} expectedCode - Expected error code
     * @param {string} expectedMessage - Expected error message (partial match)
     */
    static assertErrorResponse(errorResponse, expectedCode, expectedMessage = null) {
        expect(errorResponse).toHaveProperty('success');
        expect(errorResponse.success).toBe(false);
        expect(errorResponse).toHaveProperty('error');
        
        const error = errorResponse.error;
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error.code).toBe(expectedCode);
        
        if (expectedMessage) {
            expect(error.message).toContain(expectedMessage);
        }
    }

    /**
     * Assert response time is within acceptable range
     * @param {APIResponse} response - Playwright API response
     * @param {number} maxResponseTime - Maximum acceptable response time in ms
     */
    static async assertResponseTime(response, maxResponseTime = 5000) {
        const responseTime = await this.getResponseTime(response);
        expect(responseTime).toBeLessThanOrEqual(maxResponseTime);
    }

    /**
     * Get response time from response headers or timing
     * @param {APIResponse} response - Playwright API response
     * @returns {number} Response time in milliseconds
     */
    static async getResponseTime(response) {
        // This is a simplified implementation
        // In real scenarios, you might want to measure from request start
        const serverTiming = response.headers()['server-timing'];
        if (serverTiming) {
            const match = serverTiming.match(/total;dur=(\d+\.?\d*)/);
            if (match) {
                return parseFloat(match[1]);
            }
        }
        return 0; // Fallback if no timing info available
    }

    /**
     * Assert response headers contain specific values
     * @param {APIResponse} response - Playwright API response
     * @param {Object} expectedHeaders - Object with expected header key-value pairs
     */
    static assertHeaders(response, expectedHeaders) {
        const headers = response.headers();
        Object.keys(expectedHeaders).forEach(headerName => {
            expect(headers).toHaveProperty(headerName.toLowerCase());
            expect(headers[headerName.toLowerCase()]).toContain(expectedHeaders[headerName]);
        });
    }

    /**
     * Assert security headers are present
     * @param {APIResponse} response - Playwright API response
     */
    static assertSecurityHeaders(response) {
        const headers = response.headers();
        const securityHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection'
        ];
        
        securityHeaders.forEach(header => {
            expect(headers).toHaveProperty(header);
        });
    }

    /**
     * Assert CORS headers are properly configured
     * @param {APIResponse} response - Playwright API response
     * @param {string} expectedOrigin - Expected allowed origin
     */
    static assertCorsHeaders(response, expectedOrigin = '*') {
        const headers = response.headers();
        expect(headers).toHaveProperty('access-control-allow-origin');
        expect(headers['access-control-allow-origin']).toBe(expectedOrigin);
    }

    /**
     * Validate date format in response
     * @param {string} dateString - Date string to validate
     * @param {string} format - Expected format ('iso' or 'timestamp')
     */
    static assertDateFormat(dateString, format = 'iso') {
        if (format === 'iso') {
            expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
            expect(new Date(dateString).toISOString()).toBe(dateString.endsWith('Z') ? dateString : dateString + 'Z');
        } else if (format === 'timestamp') {
            expect(typeof dateString).toBe('number');
            expect(dateString).toBeGreaterThan(0);
        }
    }

    /**
     * Assert ID field format (UUID, numeric, etc.)
     * @param {any} id - ID value to validate
     * @param {string} format - Expected format ('uuid', 'numeric', 'string')
     */
    static assertIdFormat(id, format = 'numeric') {
        switch (format) {
            case 'uuid':
                expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                break;
            case 'numeric':
                expect(typeof id).toBe('number');
                expect(id).toBeGreaterThan(0);
                break;
            case 'string':
                expect(typeof id).toBe('string');
                expect(id.length).toBeGreaterThan(0);
                break;
        }
    }

    /**
     * Assert email format
     * @param {string} email - Email to validate
     */
    static assertEmailFormat(email) {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }

    /**
     * Create custom matcher for API responses
     * @param {string} name - Matcher name
     * @param {Function} matcherFn - Matcher function
     */
    static addCustomMatcher(name, matcherFn) {
        expect.extend({
            [name]: matcherFn
        });
    }

    /**
     * Log response details for debugging
     * @param {APIResponse} response - Playwright API response
     * @param {Object} body - Response body (optional)
     */
    static async logResponse(response, body = null) {
        console.log('=== API Response Debug ===');
        console.log(`Status: ${response.status()}`);
        console.log(`URL: ${response.url()}`);
        console.log('Headers:', response.headers());
        
        if (body) {
            console.log('Body:', JSON.stringify(body, null, 2));
        } else {
            try {
                const responseBody = await response.json();
                console.log('Body:', JSON.stringify(responseBody, null, 2));
            } catch (error) {
                console.log('Body (text):', await response.text());
            }
        }
        console.log('========================');
    }
}

module.exports = ApiHelpers;
