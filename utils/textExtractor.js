const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Extracts text from PDF or DOCX files
 */
class TextExtractor {

  /**
   * Extract text from file based on extension
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromFile(filePath) {
    try {
      // Remove quotes if present
      const cleanPath = filePath.replace(/['"]/g, '').trim();

      const fileExtension = cleanPath.split('.').pop().toLowerCase();

      switch (fileExtension) {
        case 'pdf':
          return await this.extractFromPDF(cleanPath);
        case 'docx':
          return await this.extractFromDOCX(cleanPath);
        case 'txt':
          return await this.extractFromTXT(cleanPath);
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF appears to be empty or contains no extractable text');
      }

      return this.cleanText(data.text);
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX
   * @param {string} filePath - Path to DOCX file
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });

      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX appears to be empty or contains no extractable text');
      }

      return this.cleanText(result.value);
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from TXT file
   * @param {string} filePath - Path to TXT file
   * @returns {Promise<string>} - File contents
   */
  async extractFromTXT(filePath) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');

      if (!text || text.trim().length === 0) {
        throw new Error('TXT file is empty');
      }

      return this.cleanText(text);
    } catch (error) {
      throw new Error(`TXT extraction failed: ${error.message}`);
    }
  }

  /**
   * Clean and normalize extracted text
   * @param {string} text - Raw text
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')           // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n')       // Remove excessive line breaks
      .replace(/\t/g, ' ')               // Replace tabs with spaces
      .replace(/[ ]{2,}/g, ' ')         // Remove multiple spaces
      .trim();
  }

  /**
   * Extract text from buffer (useful for uploaded files)
   * @param {Buffer} buffer - File buffer
   * @param {string} mimetype - File mimetype
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromBuffer(buffer, mimetype) {
    try {
      switch (mimetype) {
        case 'application/pdf':
          const pdfData = await pdf(buffer);
          return this.cleanText(pdfData.text);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxResult = await mammoth.extractRawText({ buffer });
          return this.cleanText(docxResult.value);

        case 'text/plain':
          return this.cleanText(buffer.toString('utf-8'));

        default:
          throw new Error(`Unsupported mimetype: ${mimetype}`);
      }
    } catch (error) {
      throw new Error(`Buffer extraction failed: ${error.message}`);
    }
  }
}

module.exports = new TextExtractor();
