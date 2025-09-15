const { test, expect } = require('@playwright/test');
const { RegistrationPage } = require('../pages/registration-page');
const DataUtils = require('../utils/data-utils');
const path = require('path');

// Load test data
const jsonTestData = DataUtils.loadJsonData('test-data/registration-test-data.json');
const csvTestData = DataUtils.loadCsvData('test-data/registration-test-data.csv');

test.describe('Data-Driven Registration Tests', () => {
    let page;
    let registrationPage;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        registrationPage = new RegistrationPage(page);
        await registrationPage.navigate();
    });

    test.afterEach(async () => {
        await page.close();
    });

    // Test with JSON data
    jsonTestData.validRegistrations.forEach((testData) => {
        test(`should register a new user with valid data - ${testData.testName}`, async () => {
            // Fill the registration form with test data
            await registrationPage.fillRegistrationForm(testData);
            
            // Submit the form
            await registrationPage.submitForm();
            
            // Verify successful registration (adjust the verification as per your application)
            // This is just an example - update the verification based on your actual application behavior
            await expect(page).toHaveURL(/register/); // Assuming it stays on the same page
            await expect(registrationPage.successMessage).toBeVisible();
        });
    });

    // Test with CSV data
    test('should register users from CSV data', async () => {
        for (const testData of csvTestData) {
            console.log(`Testing registration for: ${testData.firstName} ${testData.lastName}`);
            
            // Navigate to the registration page for each test case
            await registrationPage.navigate();
            
            // Fill the registration form with test data
            // Convert string arrays from CSV to actual arrays
            const testDataWithArrays = {
                ...testData,
                hobbies: testData.hobbies ? testData.hobbies.split(',').map(h => h.trim()) : [],
                languages: testData.languages ? testData.languages.split(',').map(l => l.trim()) : []
            };
            
            await registrationPage.fillRegistrationForm(testDataWithArrays);
            
            // Submit the form
            await registrationPage.submitForm();
            
            // Verify successful registration
            await expect(page).toHaveURL(/register/); // Adjust as needed
            await expect(registrationPage.successMessage).toBeVisible();
        }
    });

    // Test with invalid email formats
    jsonTestData.invalidEmails.forEach((email, index) => {
        test(`should show error for invalid email format: ${email}`, async () => {
            const testData = { ...jsonTestData.validRegistrations[0], email };
            await registrationPage.fillRegistrationForm(testData);
            await registrationPage.submitForm();
            
            // Verify email validation error is shown
            await expect(registrationPage.emailError).toBeVisible();
            await expect(registrationPage.emailError).toContainText('valid email');
        });
    });

    // Test with invalid phone formats
    jsonTestData.invalidPhones.forEach((phone, index) => {
        test(`should show error for invalid phone format: ${phone}`, async () => {
            const testData = { ...jsonTestData.validRegistrations[0], phone };
            await registrationPage.fillRegistrationForm(testData);
            await registrationPage.submitForm();
            
            // Verify phone validation error is shown
            await expect(registrationPage.phoneError).toBeVisible();
            await expect(registrationPage.phoneError).toContainText('valid phone');
        });
    });
});
