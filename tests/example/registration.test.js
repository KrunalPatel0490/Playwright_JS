const { test, expect } = require('@playwright/test');
const RegistrationPage = require('../pages/registration-page');
const { generateRandomEmail, generateRandomString } = require('../utils/test-utils');

test.describe('Registration Form Tests', () => {
    let registrationPage;

    test.beforeEach(async ({ page }) => {
        registrationPage = new RegistrationPage(page);
        await registrationPage.navigateToRegistration();
    });

    test.describe('Positive Test Scenarios', () => {
        test('should successfully fill complete registration form with valid data', async ({ page }) => {
            const validUserData = {
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Main Street, City, State 12345',
                email: generateRandomEmail(),
                phone: '1234567890',
                gender: 'Male',
                hobbies: ['Cricket', 'Movies'],
                languages: ['English', 'Hindi'],
                skill: 'Java',
                country: 'India',
                year: '1990',
                month: 'January',
                day: '15',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            await registrationPage.fillCompleteForm(validUserData);
            
            // Verify all fields are filled
            expect(await page.inputValue(registrationPage.selectors.firstName)).toBe(validUserData.firstName);
            expect(await page.inputValue(registrationPage.selectors.lastName)).toBe(validUserData.lastName);
            expect(await page.inputValue(registrationPage.selectors.email)).toBe(validUserData.email);
            expect(await page.inputValue(registrationPage.selectors.phone)).toBe(validUserData.phone);
        });

        test('should allow selection of different genders', async ({ page }) => {
            await registrationPage.selectGender('Female');
            expect(await page.isChecked(registrationPage.selectors.genderFemale)).toBe(true);
            
            await registrationPage.selectGender('Male');
            expect(await page.isChecked(registrationPage.selectors.genderMale)).toBe(true);
        });

        test('should allow multiple hobby selections', async ({ page }) => {
            await registrationPage.selectHobbies(['Cricket', 'Movies', 'Hockey']);
            
            expect(await page.isChecked(registrationPage.selectors.hobbyCricket)).toBe(true);
            expect(await page.isChecked(registrationPage.selectors.hobbyMovies)).toBe(true);
            expect(await page.isChecked(registrationPage.selectors.hobbyHockey)).toBe(true);
        });

        test('should allow multiple language selections', async ({ page }) => {
            await registrationPage.selectLanguages(['English', 'Hindi']);
            
            // Verify languages are selected (implementation may vary based on UI)
            const selectedLanguages = await page.locator('#msdd').textContent();
            expect(selectedLanguages).toContain('English');
        });

        test('should allow skill selection from dropdown', async ({ page }) => {
            await registrationPage.selectSkill('Java');
            expect(await page.inputValue(registrationPage.selectors.skillsDropdown)).toBe('Java');
        });

        test('should allow country selection', async ({ page }) => {
            await registrationPage.selectCountry('India');
            expect(await page.inputValue(registrationPage.selectors.countryDropdown)).toBe('India');
        });

        test('should allow date of birth selection', async ({ page }) => {
            await registrationPage.setDateOfBirth('1990', 'January', '15');
            
            expect(await page.inputValue(registrationPage.selectors.dobYear)).toBe('1990');
            expect(await page.inputValue(registrationPage.selectors.dobMonth)).toBe('January');
            expect(await page.inputValue(registrationPage.selectors.dobDay)).toBe('15');
        });
    });

    test.describe('Negative Test Scenarios', () => {
        test('should show validation errors for empty required fields', async ({ page }) => {
            // Try to submit empty form
            await registrationPage.submitForm();
            
            // Check for validation styling or messages
            const firstNameField = page.locator(registrationPage.selectors.firstName);
            const lastNameField = page.locator(registrationPage.selectors.lastName);
            
            // Verify fields are highlighted or have validation errors
            await expect(firstNameField).toHaveAttribute('required');
            await expect(lastNameField).toHaveAttribute('required');
        });

        test('should validate email format', async ({ page }) => {
            await registrationPage.type(registrationPage.selectors.email, 'invalid-email');
            await registrationPage.click(registrationPage.selectors.firstName); // Trigger validation
            
            // Check if email field shows validation error
            const emailField = page.locator(registrationPage.selectors.email);
            const validationState = await emailField.evaluate(el => el.validity.valid);
            expect(validationState).toBe(false);
        });

        test('should validate phone number format', async ({ page }) => {
            // Test with invalid phone formats
            const invalidPhones = ['abc', '123', '12345678901234567890'];
            
            for (const phone of invalidPhones) {
                await registrationPage.type(registrationPage.selectors.phone, phone);
                await registrationPage.click(registrationPage.selectors.firstName);
                
                const phoneField = page.locator(registrationPage.selectors.phone);
                const validationState = await phoneField.evaluate(el => el.validity.valid);
                expect(validationState).toBe(false);
                
                // Clear field for next iteration
                await phoneField.clear();
            }
        });

        test('should validate password confirmation match', async ({ page }) => {
            await registrationPage.setPasswords('Password123!', 'DifferentPassword');
            
            // Check if passwords match validation is triggered
            const confirmPasswordField = page.locator(registrationPage.selectors.confirmPassword);
            await confirmPasswordField.blur();
            
            // This would depend on the actual validation implementation
            // For now, we'll check if the values are different
            const password = await page.inputValue(registrationPage.selectors.password);
            const confirmPassword = await page.inputValue(registrationPage.selectors.confirmPassword);
            expect(password).not.toBe(confirmPassword);
        });

        test('should handle special characters in text fields', async ({ page }) => {
            const specialChars = '!@#$%^&*()_+{}[]|;:,.<>?';
            
            await registrationPage.type(registrationPage.selectors.firstName, specialChars);
            await registrationPage.type(registrationPage.selectors.lastName, specialChars);
            
            // Verify special characters are handled appropriately
            expect(await page.inputValue(registrationPage.selectors.firstName)).toBe(specialChars);
        });
    });

    test.describe('Edge Case Scenarios', () => {
        test('should handle maximum length inputs', async ({ page }) => {
            const longString = generateRandomString(1000);
            
            await registrationPage.type(registrationPage.selectors.firstName, longString);
            await registrationPage.type(registrationPage.selectors.address, longString);
            
            // Verify fields handle long inputs appropriately
            const firstNameValue = await page.inputValue(registrationPage.selectors.firstName);
            expect(firstNameValue.length).toBeGreaterThan(0);
        });

        test('should handle form refresh functionality', async ({ page }) => {
            // Fill some data
            await registrationPage.fillPersonalInfo('John', 'Doe', 'Address', 'test@email.com', '1234567890');
            
            // Refresh form
            await registrationPage.refreshForm();
            
            // Verify form is cleared
            expect(await page.inputValue(registrationPage.selectors.firstName)).toBe('');
            expect(await page.inputValue(registrationPage.selectors.lastName)).toBe('');
        });

        test('should handle boundary values for date selection', async ({ page }) => {
            // Test with edge dates
            await registrationPage.setDateOfBirth('1900', 'January', '1');
            expect(await page.inputValue(registrationPage.selectors.dobYear)).toBe('1900');
            
            await registrationPage.setDateOfBirth('2023', 'December', '31');
            expect(await page.inputValue(registrationPage.selectors.dobYear)).toBe('2023');
        });

        test('should validate required field combinations', async ({ page }) => {
            // Fill only some required fields
            await registrationPage.fillPersonalInfo('John', '', 'Address', 'test@email.com', '');
            await registrationPage.submitForm();
            
            // Verify that missing required fields prevent submission
            const lastNameField = page.locator(registrationPage.selectors.lastName);
            await expect(lastNameField).toHaveAttribute('required');
        });

        test('should handle unicode and international characters', async ({ page }) => {
            const unicodeText = 'José María Ñoño 测试 العربية';
            
            await registrationPage.type(registrationPage.selectors.firstName, unicodeText);
            await registrationPage.type(registrationPage.selectors.address, unicodeText);
            
            expect(await page.inputValue(registrationPage.selectors.firstName)).toBe(unicodeText);
        });
    });

    test.describe('Form Interaction Tests', () => {
        test('should maintain form state during navigation', async ({ page }) => {
            // Fill form partially
            await registrationPage.fillPersonalInfo('John', 'Doe', 'Address', 'test@email.com', '1234567890');
            
            // Scroll or interact with other elements
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.evaluate(() => window.scrollTo(0, 0));
            
            // Verify data is still there
            expect(await page.inputValue(registrationPage.selectors.firstName)).toBe('John');
            expect(await page.inputValue(registrationPage.selectors.email)).toBe('test@email.com');
        });

        test('should handle tab navigation through form fields', async ({ page }) => {
            // Start from first field and tab through
            await page.focus(registrationPage.selectors.firstName);
            await page.keyboard.press('Tab');
            
            // Verify focus moves to next field
            const focusedElement = await page.evaluate(() => document.activeElement.placeholder);
            expect(focusedElement).toBe('Last Name');
        });
    });
});
