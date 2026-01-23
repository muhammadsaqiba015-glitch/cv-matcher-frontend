const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class TextExtractor {
  async extractFromFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.pdf':
        return await this.extractFromPDF(filePath);
      case '.docx':
        return await this.extractFromDOCX(filePath);
      case '.doc':
        return await this.extractFromDOCX(filePath);
      case '.txt':
        return await this.extractFromTXT(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}. Supported types: .pdf, .docx, .txt`);
    }
  }

  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      let text = data.text || '';
      text = this.cleanText(text);

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });

      let text = result.value || '';
      text = this.cleanText(text);

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in DOCX');
      }

      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages);
      }

      return text;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  async extractFromTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      return this.cleanText(text);
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error(`Failed to read TXT file: ${error.message}`);
    }
  }

  cleanText(text) {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

module.exports = new TextExtractor();
