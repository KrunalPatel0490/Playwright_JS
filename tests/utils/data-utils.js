const fs = require('fs-extra');
const { parse } = require('csv-parse/sync');
const path = require('path');

class DataUtils {
    /**
     * Load test data from a JSON file
     * @param {string} filePath - Path to the JSON file
     * @returns {Object|Array} - Parsed JSON data
     */
    static loadJsonData(filePath) {
        try {
            const absolutePath = path.resolve(process.cwd(), filePath);
            return fs.readJsonSync(absolutePath);
        } catch (error) {
            throw new Error(`Failed to load JSON data from ${filePath}: ${error.message}`);
        }
    }

    /**
     * Load test data from a CSV file
     * @param {string} filePath - Path to the CSV file
     * @returns {Array<Object>} - Array of objects representing CSV rows
     */
    static loadCsvData(filePath) {
        try {
            const absolutePath = path.resolve(process.cwd(), filePath);
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            return parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (error) {
            throw new Error(`Failed to load CSV data from ${filePath}: ${error.message}`);
        }
    }

    /**
     * Load test data from either JSON or CSV file based on file extension
     * @param {string} filePath - Path to the data file
     * @returns {Object|Array} - Parsed data
     */
    static loadTestData(filePath) {
        if (!filePath) {
            throw new Error('File path is required');
        }

        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.json') {
            return this.loadJsonData(filePath);
        } else if (ext === '.csv') {
            return this.loadCsvData(filePath);
        } else {
            throw new Error(`Unsupported file format: ${ext}. Only .json and .csv are supported.`);
        }
    }
}

module.exports = DataUtils;
