const { expect } = require('@playwright/test');
const BasePage = require('./base-page');

class RegistrationPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Define page selectors for the registration form
        this.selectors = {
            // Personal Information
            firstName: 'input[placeholder="First Name"]',
            lastName: 'input[placeholder="Last Name"]',
            address: 'textarea[ng-model="Adress"]',
            email: 'input[type="email"]',
            phone: 'input[type="tel"]',
            
            // Gender radio buttons
            genderMale: 'input[value="Male"]',
            genderFemale: 'input[value="FeMale"]',
            
            // Hobbies checkboxes
            hobbyCricket: '#checkbox1',
            hobbyMovies: '#checkbox2',
            hobbyHockey: '#checkbox3',
            
            // Dropdowns
            languagesDropdown: '#msdd',
            languageEnglish: 'a:has-text("English")',
            languageHindi: 'a:has-text("Hindi")',
            languageArabic: 'a:has-text("Arabic")',
            
            skillsDropdown: '#Skills',
            
            countryDropdown: 'select[ng-model="country"]',
            
            dobYear: '#yearbox',
            dobMonth: 'select[placeholder="Month"]',
            dobDay: '#daybox',
            
            // Password fields
            password: '#firstpassword',
            confirmPassword: '#secondpassword',
            
            // File upload
            fileUpload: '#imagesrc',
            
            // Submit button
            submitButton: '#submitbtn',
            
            // Refresh button
            refreshButton: '#Button1',
            
            // Validation messages
            validationMessages: '.has-error'
        };
    }

    /**
     * Navigate to the registration page
     */
    async navigateToRegistration() {
        await this.navigate('https://demo.automationtesting.in/Register.html');
        await this.waitForElement(this.selectors.firstName);
    }

    /**
     * Fill personal information
     */
    async fillPersonalInfo(firstName, lastName, address, email, phone) {
        await this.type(this.selectors.firstName, firstName);
        await this.type(this.selectors.lastName, lastName);
        await this.type(this.selectors.address, address);
        await this.type(this.selectors.email, email);
        await this.type(this.selectors.phone, phone);
    }

    /**
     * Select gender
     */
    async selectGender(gender) {
        if (gender.toLowerCase() === 'male') {
            await this.click(this.selectors.genderMale);
        } else if (gender.toLowerCase() === 'female') {
            await this.click(this.selectors.genderFemale);
        }
    }

    /**
     * Select hobbies
     */
    async selectHobbies(hobbies) {
        for (const hobby of hobbies) {
            switch (hobby.toLowerCase()) {
                case 'cricket':
                    await this.click(this.selectors.hobbyCricket);
                    break;
                case 'movies':
                    await this.click(this.selectors.hobbyMovies);
                    break;
                case 'hockey':
                    await this.click(this.selectors.hobbyHockey);
                    break;
            }
        }
    }

    /**
     * Select languages
     */
    async selectLanguages(languages) {
        await this.click(this.selectors.languagesDropdown);
        
        for (const language of languages) {
            switch (language.toLowerCase()) {
                case 'english':
                    await this.click(this.selectors.languageEnglish);
                    break;
                case 'hindi':
                    await this.click(this.selectors.languageHindi);
                    break;
                case 'arabic':
                    await this.click(this.selectors.languageArabic);
                    break;
            }
        }
        
        // Click outside to close dropdown
        await this.click(this.selectors.firstName);
    }

    /**
     * Select skill from dropdown
     */
    async selectSkill(skill) {
        await this.page.selectOption(this.selectors.skillsDropdown, skill);
    }

    /**
     * Select country from dropdown
     */
    async selectCountry(country) {
        await this.page.selectOption(this.selectors.countryDropdown, country);
    }

    /**
     * Set date of birth
     */
    async setDateOfBirth(year, month, day) {
        await this.page.selectOption(this.selectors.dobYear, year);
        await this.page.selectOption(this.selectors.dobMonth, month);
        await this.page.selectOption(this.selectors.dobDay, day);
    }

    /**
     * Set passwords
     */
    async setPasswords(password, confirmPassword) {
        await this.type(this.selectors.password, password);
        await this.type(this.selectors.confirmPassword, confirmPassword);
    }

    /**
     * Upload file
     */
    async uploadFile(filePath) {
        await this.page.setInputFiles(this.selectors.fileUpload, filePath);
    }

    /**
     * Submit the form
     */
    async submitForm() {
        await this.click(this.selectors.submitButton);
    }

    /**
     * Refresh the form
     */
    async refreshForm() {
        await this.click(this.selectors.refreshButton);
    }

    /**
     * Get validation error messages
     */
    async getValidationMessages() {
        const messages = await this.page.locator(this.selectors.validationMessages).allTextContents();
        return messages;
    }

    /**
     * Check if field has validation error
     */
    async hasValidationError(fieldSelector) {
        const field = this.page.locator(fieldSelector);
        const hasError = await field.evaluate(el => el.classList.contains('has-error') || 
                                                    el.parentElement.classList.contains('has-error'));
        return hasError;
    }

    /**
     * Fill complete registration form with valid data
     */
    async fillCompleteForm(userData) {
        await this.fillPersonalInfo(
            userData.firstName,
            userData.lastName,
            userData.address,
            userData.email,
            userData.phone
        );
        
        await this.selectGender(userData.gender);
        await this.selectHobbies(userData.hobbies);
        await this.selectLanguages(userData.languages);
        await this.selectSkill(userData.skill);
        await this.selectCountry(userData.country);
        await this.setDateOfBirth(userData.year, userData.month, userData.day);
        await this.setPasswords(userData.password, userData.confirmPassword);
    }

    /**
     * Fill the registration form with provided data
     * @param {Object} data - Object containing form data
     */
    async fillRegistrationForm(data) {
        // Fill basic fields
        if (data.firstName) await this.firstNameField.fill(data.firstName);
        if (data.lastName) await this.lastNameField.fill(data.lastName);
        if (data.address) await this.addressField.fill(data.address);
        if (data.email) await this.emailField.fill(data.email);
        if (data.phone) await this.phoneField.fill(data.phone);

        // Handle gender radio button
        if (data.gender) {
            await this.page.locator(`input[value="${data.gender}"]`).check();
        }

        // Handle hobbies checkboxes
        if (data.hobbies && Array.isArray(data.hobbies)) {
            for (const hobby of data.hobbies) {
                await this.page.locator(`input[value="${hobby}"]`).check();
            }
        }

        // Handle skills dropdown
        if (data.skills) {
            await this.skillsDropdown.selectOption(data.skills);
        }

        // Handle country dropdown
        if (data.country) {
            await this.countryDropdown.selectOption(data.country);
        }

        // Handle date of birth
        if (data.dateOfBirth) {
            const [year, month, day] = data.dateOfBirth.split('-');
            await this.yearSelect.selectOption(year);
            await this.monthSelect.selectOption(month);
            await this.daySelect.selectOption(day);
        }

        // Handle password fields
        if (data.password) await this.passwordField.fill(data.password);
        if (data.confirmPassword) await this.confirmPasswordField.fill(data.confirmPassword);
    }

    /**
     * Submit the registration form
     */
    async submitForm() {
        await this.submitButton.click();
    }

    get emailError() { return this.page.locator('#eid + .field-validation-error'); }
    get phoneError() { return this.page.locator('#basicBootstrapForm > div:nth-child(3) > div > input + .field-validation-error'); }
    get successMessage() { return this.page.locator('.alert-success'); }
}

Object.defineProperty(RegistrationPage.prototype, 'firstNameField', {
    get: function() { return this.page.locator('input[placeholder="First Name"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'lastNameField', {
    get: function() { return this.page.locator('input[placeholder="Last Name"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'addressField', {
    get: function() { return this.page.locator('textarea[ng-model="Adress"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'emailField', {
    get: function() { return this.page.locator('input[type="email"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'phoneField', {
    get: function() { return this.page.locator('input[type="tel"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'passwordField', {
    get: function() { return this.page.locator('#firstpassword'); }
});

Object.defineProperty(RegistrationPage.prototype, 'confirmPasswordField', {
    get: function() { return this.page.locator('#secondpassword'); }
});

Object.defineProperty(RegistrationPage.prototype, 'submitButton', {
    get: function() { return this.page.locator('#submitbtn'); }
});

Object.defineProperty(RegistrationPage.prototype, 'skillsDropdown', {
    get: function() { return this.page.locator('#Skills'); }
});

Object.defineProperty(RegistrationPage.prototype, 'countryDropdown', {
    get: function() { return this.page.locator('#countries'); }
});

Object.defineProperty(RegistrationPage.prototype, 'yearSelect', {
    get: function() { return this.page.locator('#yearbox'); }
});

Object.defineProperty(RegistrationPage.prototype, 'monthSelect', {
    get: function() { return this.page.locator('select[ng-model="monthbox"]'); }
});

Object.defineProperty(RegistrationPage.prototype, 'daySelect', {
    get: function() { return this.page.locator('#daybox'); }
});

module.exports = { RegistrationPage };
