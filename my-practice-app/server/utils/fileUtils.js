// server/utils/fileManager.js
const fs = require('fs');
const path = require('path');

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  const documentsDir = path.join(uploadDir, 'documents');
  
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Created uploads directory');
    }
    
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
      console.log('✅ Created documents directory');
    }
    
    return { uploadDir, documentsDir };
  } catch (error) {
    console.error('❌ Error creating directories:', error);
    throw error;
  }
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
};

// Validate file type
const validatePDF = (file) => {
  const allowedMimes = ['application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Only PDF files are allowed');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  return true;
};

module.exports = {
  createUploadDirectories,
  generateUniqueFilename,
  validatePDF
};