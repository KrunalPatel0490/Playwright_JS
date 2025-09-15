const { request } = require('@playwright/test');

/**
 * Authentication manager for API tests
 */
class AuthManager {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.tokens = new Map();
        this.refreshTokens = new Map();
    }

    /**
     * Login with username/password and store token
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @param {string} loginEndpoint - Login endpoint (default: /auth/login)
     * @returns {Promise<string>} Access token
     */
    async login(username, password, loginEndpoint = '/auth/login') {
        const context = await request.newContext({ baseURL: this.baseURL });
        
        const response = await context.post(loginEndpoint, {
            data: { username, password }
        });

        if (!response.ok()) {
            throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
        }

        const authData = await response.json();
        const token = authData.access_token || authData.token || authData.accessToken;
        const refreshToken = authData.refresh_token || authData.refreshToken;

        if (!token) {
            throw new Error('No access token received from login response');
        }

        // Store tokens
        this.tokens.set(username, token);
        if (refreshToken) {
            this.refreshTokens.set(username, refreshToken);
        }

        await context.dispose();
        return token;
    }

    /**
     * Login with OAuth2 flow (simplified)
     * @param {string} clientId - OAuth client ID
     * @param {string} clientSecret - OAuth client secret
     * @param {string} scope - OAuth scope
     * @returns {Promise<string>} Access token
     */
    async loginOAuth2(clientId, clientSecret, scope = 'read write') {
        const context = await request.newContext({ baseURL: this.baseURL });
        
        const response = await context.post('/oauth/token', {
            data: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok()) {
            throw new Error(`OAuth login failed: ${response.status()} ${await response.text()}`);
        }

        const authData = await response.json();
        const token = authData.access_token;

        if (!token) {
            throw new Error('No access token received from OAuth response');
        }

        this.tokens.set('oauth_client', token);
        await context.dispose();
        return token;
    }

    /**
     * Refresh access token
     * @param {string} username - Username to refresh token for
     * @returns {Promise<string>} New access token
     */
    async refreshToken(username) {
        const refreshToken = this.refreshTokens.get(username);
        if (!refreshToken) {
            throw new Error(`No refresh token found for user: ${username}`);
        }

        const context = await request.newContext({ baseURL: this.baseURL });
        
        const response = await context.post('/auth/refresh', {
            data: { refresh_token: refreshToken }
        });

        if (!response.ok()) {
            throw new Error(`Token refresh failed: ${response.status()} ${await response.text()}`);
        }

        const authData = await response.json();
        const newToken = authData.access_token || authData.token;

        if (!newToken) {
            throw new Error('No access token received from refresh response');
        }

        this.tokens.set(username, newToken);
        await context.dispose();
        return newToken;
    }

    /**
     * Get stored token for user
     * @param {string} username - Username
     * @returns {string|null} Access token
     */
    getToken(username) {
        return this.tokens.get(username) || null;
    }

    /**
     * Create authenticated request context
     * @param {string} username - Username to get token for
     * @param {Object} options - Additional context options
     * @returns {Promise<APIRequestContext>} Authenticated request context
     */
    async createAuthenticatedContext(username, options = {}) {
        const token = this.getToken(username);
        if (!token) {
            throw new Error(`No token found for user: ${username}. Please login first.`);
        }

        return await request.newContext({
            baseURL: this.baseURL,
            extraHTTPHeaders: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });
    }

    /**
     * Logout user and clear tokens
     * @param {string} username - Username to logout
     * @param {string} logoutEndpoint - Logout endpoint (default: /auth/logout)
     */
    async logout(username, logoutEndpoint = '/auth/logout') {
        const token = this.getToken(username);
        if (!token) {
            return; // Already logged out
        }

        try {
            const context = await this.createAuthenticatedContext(username);
            await context.post(logoutEndpoint);
            await context.dispose();
        } catch (error) {
            console.warn(`Logout request failed: ${error.message}`);
        } finally {
            // Clear tokens regardless of logout request success
            this.tokens.delete(username);
            this.refreshTokens.delete(username);
        }
    }

    /**
     * Clear all stored tokens
     */
    clearAllTokens() {
        this.tokens.clear();
        this.refreshTokens.clear();
    }

    /**
     * Check if user is authenticated
     * @param {string} username - Username to check
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated(username) {
        return this.tokens.has(username);
    }

    /**
     * Validate token by making a test request
     * @param {string} username - Username
     * @param {string} testEndpoint - Endpoint to test (default: /auth/me)
     * @returns {Promise<boolean>} True if token is valid
     */
    async validateToken(username, testEndpoint = '/auth/me') {
        try {
            const context = await this.createAuthenticatedContext(username);
            const response = await context.get(testEndpoint);
            await context.dispose();
            return response.ok();
        } catch (error) {
            return false;
        }
    }

    /**
     * Get user info using current token
     * @param {string} username - Username
     * @param {string} userEndpoint - User info endpoint (default: /auth/me)
     * @returns {Promise<Object>} User information
     */
    async getUserInfo(username, userEndpoint = '/auth/me') {
        const context = await this.createAuthenticatedContext(username);
        const response = await context.get(userEndpoint);
        
        if (!response.ok()) {
            throw new Error(`Failed to get user info: ${response.status()} ${await response.text()}`);
        }

        const userInfo = await response.json();
        await context.dispose();
        return userInfo;
    }
}

module.exports = AuthManager;
