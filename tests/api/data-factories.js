const { faker } = require('@faker-js/faker');

/**
 * Data factories for generating test data
 */
class DataFactories {
    /**
     * Generate user data
     * @param {Object} overrides - Override default values
     * @returns {Object} User object
     */
    static createUser(overrides = {}) {
        return {
            id: faker.number.int({ min: 1, max: 10000 }),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password({ length: 12 }),
            phone: faker.phone.number(),
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
            },
            dateOfBirth: faker.date.birthdate(),
            isActive: true,
            role: 'user',
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
            ...overrides
        };
    }

    /**
     * Generate product data
     * @param {Object} overrides - Override default values
     * @returns {Object} Product object
     */
    static createProduct(overrides = {}) {
        return {
            id: faker.number.int({ min: 1, max: 10000 }),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            category: faker.commerce.department(),
            sku: faker.string.alphanumeric(8).toUpperCase(),
            inStock: faker.datatype.boolean(),
            quantity: faker.number.int({ min: 0, max: 100 }),
            brand: faker.company.name(),
            tags: faker.helpers.arrayElements([
                'electronics', 'clothing', 'books', 'home', 'sports', 'toys'
            ], { min: 1, max: 3 }),
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
            ...overrides
        };
    }

    /**
     * Generate order data
     * @param {Object} overrides - Override default values
     * @returns {Object} Order object
     */
    static createOrder(overrides = {}) {
        const items = faker.helpers.arrayElements([
            this.createProduct(),
            this.createProduct(),
            this.createProduct()
        ], { min: 1, max: 3 });

        const subtotal = items.reduce((sum, item) => sum + item.price, 0);
        const tax = subtotal * 0.08;
        const shipping = 9.99;

        return {
            id: faker.number.int({ min: 1, max: 10000 }),
            orderNumber: faker.string.alphanumeric(10).toUpperCase(),
            userId: faker.number.int({ min: 1, max: 1000 }),
            status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            items: items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            shipping: shipping,
            total: parseFloat((subtotal + tax + shipping).toFixed(2)),
            shippingAddress: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
            },
            paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'apple_pay']),
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
            ...overrides
        };
    }

    /**
     * Generate authentication credentials
     * @param {Object} overrides - Override default values
     * @returns {Object} Auth credentials
     */
    static createAuthCredentials(overrides = {}) {
        return {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password({ length: 12 }),
            confirmPassword: faker.internet.password({ length: 12 }),
            ...overrides
        };
    }

    /**
     * Generate API response structure
     * @param {any} data - The data to wrap
     * @param {Object} meta - Metadata for the response
     * @returns {Object} API response structure
     */
    static createApiResponse(data, meta = {}) {
        return {
            success: true,
            data: data,
            message: 'Request successful',
            timestamp: new Date().toISOString(),
            meta: {
                page: 1,
                limit: 10,
                total: Array.isArray(data) ? data.length : 1,
                ...meta
            }
        };
    }

    /**
     * Generate error response
     * @param {string} message - Error message
     * @param {number} code - Error code
     * @returns {Object} Error response
     */
    static createErrorResponse(message = 'An error occurred', code = 400) {
        return {
            success: false,
            error: {
                code: code,
                message: message,
                timestamp: new Date().toISOString(),
                details: faker.lorem.sentence()
            }
        };
    }

    /**
     * Generate multiple items using a factory method
     * @param {Function} factoryMethod - The factory method to use
     * @param {number} count - Number of items to generate
     * @param {Object} overrides - Override values for all items
     * @returns {Array} Array of generated items
     */
    static createMultiple(factoryMethod, count = 5, overrides = {}) {
        return Array.from({ length: count }, () => factoryMethod(overrides));
    }

    /**
     * Generate realistic test data sets
     */
    static createTestDataSet() {
        const users = this.createMultiple(this.createUser, 10);
        const products = this.createMultiple(this.createProduct, 20);
        const orders = this.createMultiple(this.createOrder, 15);

        return {
            users,
            products,
            orders,
            adminUser: this.createUser({ role: 'admin', isActive: true }),
            testUser: this.createUser({ 
                email: 'test@example.com', 
                username: 'testuser',
                password: 'TestPassword123!'
            })
        };
    }
}

module.exports = DataFactories;
