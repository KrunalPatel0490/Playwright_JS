# CI/CD Setup Guide

This document explains how to configure and use the GitHub Actions workflows for automated testing.

## 🚀 Quick Setup

1. **Push the workflow files** to your repository:
   ```bash
   git add .github/
   git commit -m "Add GitHub Actions CI/CD workflows"
   git push origin main
   ```

2. **Enable GitHub Actions** in your repository settings (usually enabled by default)

3. **Configure secrets** (if needed) in Repository Settings → Secrets and variables → Actions

## 📋 Workflow Overview

### Main Workflows

1. **`playwright.yml`** - Comprehensive testing with matrix strategy
2. **`ci.yml`** - Optimized CI/CD pipeline with staged execution

### Workflow Triggers

- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches  
- **Scheduled runs** daily at 2 AM UTC
- **Manual trigger** from GitHub Actions tab

## 🔧 Workflow Jobs

### 1. Smoke Tests
- **Purpose**: Quick validation before running full test suite
- **Duration**: ~15 minutes
- **Browsers**: Chromium only
- **Tests**: Basic example tests

### 2. Full Test Suite
- **Purpose**: Complete UI testing across browsers
- **Duration**: ~60 minutes
- **Browsers**: Chromium, Firefox, WebKit
- **Matrix**: Cross-browser parallel execution

### 3. API Tests
- **Purpose**: Validate API functionality
- **Duration**: ~30 minutes
- **Tests**: All tests in `tests/api/` directory

### 4. Docker Tests
- **Purpose**: Containerized test execution
- **Duration**: ~45 minutes
- **Environment**: Docker container

### 5. Security Scan
- **Purpose**: Check for vulnerabilities
- **Tools**: npm audit, audit-ci

## 📊 Test Reports

### Artifacts
- Test results are uploaded as artifacts for failed runs
- Reports are retained for 7-30 days
- Download from the Actions run page

### HTML Reports
- Published to GitHub Pages (if enabled)
- Accessible at: `https://YOUR_USERNAME.github.io/YOUR_REPO/test-reports/RUN_NUMBER`

## 🔐 Environment Configuration

### Required Secrets (Optional)
Add these in Repository Settings → Secrets:

```yaml
# API Testing
API_BASE_URL: "https://your-api.com"
TEST_USER_EMAIL: "test@example.com"
TEST_USER_PASSWORD: "secure_password"

# Notifications
SLACK_WEBHOOK: "https://hooks.slack.com/..."
```

### Environment Variables
Set in Repository Settings → Variables:

```yaml
NODE_VERSION: "20"
TEST_ENV: "staging"
HEADLESS: "true"
```

## 🎯 Customization

### Modify Test Selection
Edit the workflow files to change which tests run:

```yaml
# Run specific test files
- name: Run smoke tests
  run: npx playwright test tests/example/example.test.js

# Run tests by tag
- name: Run critical tests
  run: npx playwright test --grep "@critical"
```

### Add New Browsers
Extend the matrix in `playwright.yml`:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit, chrome, edge]
```

### Change Triggers
Modify the `on:` section:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main ]
  workflow_dispatch: # Manual trigger
```

## 📈 Monitoring

### Status Badges
Add to your README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Notifications
Configure in workflow files:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**
   - Check browser versions
   - Verify environment variables
   - Review timeout settings

2. **Artifacts not uploading**
   - Ensure paths exist: `test-results/`, `playwright-report/`
   - Check file permissions

3. **Matrix jobs failing**
   - Review browser installation logs
   - Check dependency compatibility

### Debug Commands

```bash
# Local testing with CI environment
CI=true npx playwright test

# Check workflow syntax
gh workflow view

# Manual workflow trigger
gh workflow run "CI/CD Pipeline"
```

## 🔄 Best Practices

1. **Use matrix strategy** for cross-browser testing
2. **Stage jobs** with dependencies (smoke → full tests)
3. **Upload artifacts** only on failures to save storage
4. **Set appropriate timeouts** for different job types
5. **Use caching** for node_modules and Playwright browsers
6. **Fail fast** disabled for matrix jobs to see all results

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Docker with Playwright](https://playwright.dev/docs/docker)
