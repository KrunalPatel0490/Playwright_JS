const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate a single HTML file Allure report for email sharing
 */
async function generateSingleHtmlReport() {
  try {
    console.log('🚀 Generating single HTML Allure report...');
    
    // Step 1: Generate regular Allure report
    console.log('📊 Generating Allure report...');
    execSync('npx allure generate allure-results --clean -o allure-temp', { stdio: 'inherit' });
    
    // Step 2: Read the main HTML file
    const htmlPath = path.join('allure-temp', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Step 3: Inline all CSS files
    const cssDir = path.join('allure-temp', 'styles');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
      
      cssFiles.forEach(cssFile => {
        const cssPath = path.join(cssDir, cssFile);
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const cssLink = new RegExp(`<link[^>]*href="[^"]*${cssFile}"[^>]*>`, 'g');
        htmlContent = htmlContent.replace(cssLink, `<style>${cssContent}</style>`);
      });
    }
    
    // Step 4: Inline all JavaScript files
    const jsDir = path.join('allure-temp', 'app.js');
    if (fs.existsSync(jsDir)) {
      const jsContent = fs.readFileSync(jsDir, 'utf8');
      const jsScript = new RegExp(`<script[^>]*src="[^"]*app.js"[^>]*></script>`, 'g');
      htmlContent = htmlContent.replace(jsScript, `<script>${jsContent}</script>`);
    }
    
    // Step 5: Create single report directory
    const singleReportDir = 'allure-single-report';
    if (!fs.existsSync(singleReportDir)) {
      fs.mkdirSync(singleReportDir, { recursive: true });
    }
    
    // Step 6: Write the single HTML file
    const singleHtmlPath = path.join(singleReportDir, 'AllureReport.html');
    fs.writeFileSync(singleHtmlPath, htmlContent);
    
    // Step 7: Clean up temporary directory
    fs.rmSync('allure-temp', { recursive: true, force: true });
    
    console.log('✅ Single HTML report generated successfully!');
    console.log(`📁 Location: ${path.resolve(singleHtmlPath)}`);
    console.log('📧 This file can be shared via email');
    
    return singleHtmlPath;
    
  } catch (error) {
    console.error('❌ Error generating single HTML report:', error.message);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  generateSingleHtmlReport();
}

module.exports = { generateSingleHtmlReport };
