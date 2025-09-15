const BasePage = require('./base-page');

class RegistrationPage extends BasePage {
  constructor(page) {
    super(page);

    // Personal Information selectors
    this.firstNameInput = '#firstName';
    this.lastNameInput = '#lastName';
    this.emailInput = '#email';
    this.phoneInput = '#phone';
    this.genderMaleRadio = '#male';
    this.genderFemaleRadio = '#female';
    this.dobInput = '#dateOfBirth';

    // Address Information selectors
    this.addressInput = '#address';
    this.cityInput = '#city';
    this.stateSelect = '#state';
    this.zipInput = '#zip';
    this.countrySelect = '#country';

    // Account Information selectors
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.confirmPasswordInput = '#confirmPassword';
    this.termsCheckbox = '#terms';
    this.newsletterCheckbox = '#newsletter';

    // Form controls
    this.submitButton = '#submitBtn';
    this.resetButton = '#resetBtn';
    this.backButton = '#backBtn';

    // Error messages
    this.errorMessage = '.error-message';
    this.successMessage = '.success-message';

    // Progress indicators
    this.progressBar = '.progress-bar';
    this.stepIndicator = '.step-indicator';

    // Validation messages
    this.fieldValidation = '.field-validation';
    this.formValidation = '.form-validation';
  }

  async fillPersonalInfo(firstName, lastName, email, phone, gender = 'male') {
    await this.fillField(this.firstNameInput, firstName);
    await this.fillField(this.lastNameInput, lastName);
    await this.fillField(this.emailInput, email);
    await this.fillField(this.phoneInput, phone);

    if (gender === 'male') {
      await this.clickElement(this.genderMaleRadio);
    } else {
      await this.clickElement(this.genderFemaleRadio);
    }
  }

  async fillAddressInfo(address, city, state, zip, country) {
    await this.fillField(this.addressInput, address);
    await this.fillField(this.cityInput, city);
    await this.selectOption(this.stateSelect, state);
    await this.fillField(this.zipInput, zip);
    await this.selectOption(this.countrySelect, country);
  }

  async fillAccountInfo(username, password, confirmPassword) {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.fillField(this.confirmPasswordInput, confirmPassword);
  }

  async acceptTerms() {
    await this.clickElement(this.termsCheckbox);
  }

  async subscribeNewsletter() {
    await this.clickElement(this.newsletterCheckbox);
  }

  async setDateOfBirth(date) {
    await this.fillField(this.dobInput, date);
  }

  async getErrorMessage() {
    return await this.getElementText(this.errorMessage);
  }

  async getSuccessMessage() {
    return await this.getElementText(this.successMessage);
  }

  async isFormValid() {
    const validationErrors = await this.page.locator(this.fieldValidation).count();
    return validationErrors === 0;
  }

  async getProgressPercentage() {
    const progressBar = this.page.locator(this.progressBar);
    return await progressBar.getAttribute('aria-valuenow');
  }

  async getCurrentStep() {
    const activeStep = this.page.locator(`${this.stepIndicator}.active`);
    return await activeStep.textContent();
  }

  async validateField(fieldSelector) {
    const field = this.page.locator(fieldSelector);
    const isValid = await field.getAttribute('aria-invalid');
    return isValid !== 'true';
  }

  async validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone);
  }

  async validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  async validateZip(zip) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  }

  async clearForm() {
    await this.clickElement(this.resetButton);
  }

  async goBack() {
    await this.clickElement(this.backButton);
  }

  async waitForFormLoad() {
    await this.waitForElement(this.firstNameInput);
    await this.waitForElement(this.submitButton);
  }

  async isSubmitButtonEnabled() {
    const submitBtn = this.page.locator(this.submitButton);
    return await submitBtn.isEnabled();
  }

  async getFieldValue(fieldSelector) {
    const field = this.page.locator(fieldSelector);
    return await field.inputValue();
  }

  async highlightRequiredFields() {
    await this.page.evaluate(() => {
      const requiredFields = document.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        field.style.border = '2px solid red';
      });
    });
  }

  async removeFieldHighlight() {
    await this.page.evaluate(() => {
      const fields = document.querySelectorAll('input, select, textarea');
      fields.forEach(field => {
        field.style.border = '';
      });
    });
  }

  async takeFormScreenshot(name = 'registration-form') {
    await this.takeScreenshot(name);
  }

  async scrollToField(fieldSelector) {
    await this.page.locator(fieldSelector).scrollIntoViewIfNeeded();
  }

  async focusField(fieldSelector) {
    await this.page.locator(fieldSelector).focus();
  }

  async blurField(fieldSelector) {
    await this.page.locator(fieldSelector).blur();
  }

  async getFormData() {
    return {
      firstName: await this.getFieldValue(this.firstNameInput),
      lastName: await this.getFieldValue(this.lastNameInput),
      email: await this.getFieldValue(this.emailInput),
      phone: await this.getFieldValue(this.phoneInput),
      address: await this.getFieldValue(this.addressInput),
      city: await this.getFieldValue(this.cityInput),
      zip: await this.getFieldValue(this.zipInput),
      username: await this.getFieldValue(this.usernameInput),
    };
  }

  async fillBasicRegistrationForm(userData) {
    await this.fillPersonalInfo(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phone,
      userData.gender
    );

    if (userData.dateOfBirth) {
      await this.setDateOfBirth(userData.dateOfBirth);
    }

    await this.fillAddressInfo(
      userData.address,
      userData.city,
      userData.state,
      userData.zip,
      userData.country
    );

    await this.fillAccountInfo(userData.username, userData.password, userData.confirmPassword);

    if (userData.acceptTerms) {
      await this.acceptTerms();
    }

    if (userData.subscribeNewsletter) {
      await this.subscribeNewsletter();
    }
  }

  async submitForm() {
    await this.clickElement(this.submitButton);
    // Wait for DOM to be ready instead of network idle
    await this.page.waitForLoadState('domcontentloaded');

    // Alternative: Wait for a specific success indicator if available
    // await this.page.waitForSelector('.success-message', { timeout: 10000 });
    // or await this.page.waitForURL(/success|dashboard/, { timeout: 10000 });
  }
}

module.exports = RegistrationPage;
