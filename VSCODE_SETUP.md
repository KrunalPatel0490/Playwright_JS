# VS Code Setup Guide

This guide helps you configure VS Code for optimal development experience with
this Playwright framework.

## Recommended Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "ms-playwright.playwright",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.test-adapter-converter"
  ]
}
```

## VS Code Settings

Create `.vscode/settings.json` in your project root with these settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": ["."],
  "prettier.requireConfig": true,
  "files.associations": {
    "*.json": "jsonc"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/test-results": true,
    "**/playwright-report": true,
    "**/allure-results": true,
    "**/allure-report": true,
    "**/allure-single-report": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/test-results": true,
    "**/playwright-report": true,
    "**/allure-results": true,
    "**/allure-report": true
  }
}
```

## Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
      "args": ["test", "--debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
      "args": ["test", "${relativeFile}", "--debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Tasks Configuration

Create `.vscode/tasks.json` for common tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Playwright Tests",
      "type": "shell",
      "command": "npm",
      "args": ["run", "test"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Lint & Format",
      "type": "shell",
      "command": "npm",
      "args": ["run", "quality:fix"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Generate Allure Report",
      "type": "shell",
      "command": "npm",
      "args": ["run", "allure:single"],
      "group": "build"
    }
  ]
}
```

## Setup Steps

1. **Install Extensions**: Use the Command Palette (`Ctrl+Shift+P`) and run
   "Extensions: Show Recommended Extensions"

2. **Create Settings**: Copy the settings above into `.vscode/settings.json`

3. **Create Launch Config**: Copy the launch configuration into
   `.vscode/launch.json`

4. **Create Tasks**: Copy the tasks configuration into `.vscode/tasks.json`

5. **Reload VS Code**: Restart VS Code to apply all settings

## Keyboard Shortcuts

Add these to your VS Code keybindings for faster development:

```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Run Playwright Tests"
  },
  {
    "key": "ctrl+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "Lint & Format"
  }
]
```

## Troubleshooting

- **ESLint not working**: Ensure the ESLint extension is installed and enabled
- **Prettier not formatting**: Check that Prettier is set as the default
  formatter
- **Playwright extension issues**: Restart VS Code after installing the
  Playwright extension
