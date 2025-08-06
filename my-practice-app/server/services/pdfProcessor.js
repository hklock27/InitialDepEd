// server/services/pdfService.js
const pdf = require('pdf-parse');
const fs = require('fs');

class PDFService {
  // Extract text from PDF buffer
  static async extractTextFromBuffer(buffer) {
    try {
      const data = await pdf(buffer);
      
      // Clean and format the extracted text
      let cleanText = data.text
        .replace(/\r\n/g, '\n')  // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
        .replace(/\s{2,}/g, ' ')  // Remove excessive spaces
        .trim();
      
      return {
        text: cleanText,
        pages: data.numpages,
        info: data.info || {}
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
  
  // Extract text from PDF file path
  static async extractTextFromFile(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      return await this.extractTextFromBuffer(buffer);
    } catch (error) {
      console.error('PDF file reading error:', error);
      throw new Error('Failed to read PDF file');
    }
  }
  
  // Clean and prepare text for search
  static prepareTextForSearch(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove special characters
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();
  }
  
  // Extract key information from DepEd documents
  static extractDepEdInfo(text) {
    const info = {
      documentNumber: null,
      subject: null,
      date: null,
      from: null
    };
    
    // Extract document number (e.g., "DO_s2024_020")
    const docNumberMatch = text.match(/(DO_s\d{4}_\d{3}|DM_s\d{4}_\d{3}|DepEd Order No\. \d+)/i);
    if (docNumberMatch) {
      info.documentNumber = docNumberMatch[0];
    }
    
    // Extract subject
    const subjectMatch = text.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      info.subject = subjectMatch[1].trim();
    }
    
    // Extract date
    const dateMatch = text.match(/(?:Date|Dated):\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
    if (dateMatch) {
      info.date = dateMatch[1];
    }
    
    // Extract from/to information
    const fromMatch = text.match(/FROM:\s*(.+?)(?:\n|TO:|$)/i);
    if (fromMatch) {
      info.from = fromMatch[1].trim();
    }
    
    return info;
  }
}

module.exports = PDFService;