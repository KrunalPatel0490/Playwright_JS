# Use the official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.41.2-jammy

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Create directories for test results
RUN mkdir -p test-results playwright-report

# Set environment variables for CI
ENV CI=true
ENV NODE_ENV=production

# Run the tests
CMD ["npx", "playwright", "test", "--reporter=html"]
