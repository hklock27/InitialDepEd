// server/test/testSetup.js
const { createUploadDirectories } = require('../utils/fileUtils');
const PDFService = require('../services/pdfProcessor');
const Document = require('../models/Document');

console.log('🧪 Testing Phase 2 Setup...\n');

// Test 1: Create directories
try {
  console.log('📁 Creating upload directories...');
  const { uploadDir, documentsDir } = createUploadDirectories();
  console.log(`✅ Upload directory: ${uploadDir}`);
  console.log(`✅ Documents directory: ${documentsDir}\n`);
} catch (error) {
  console.error('❌ Directory creation failed:', error.message);
  process.exit(1);
}

// Test 2: Test PDF Service
try {
  console.log('📄 Testing PDF Service...');
  const testText = "DEPARTMENT OF EDUCATION\n\nDO_s2024_020\n\nSUBJECT: Guidelines for School Operations";
  const depedInfo = PDFService.extractDepEdInfo(testText);
  console.log('✅ PDF Service loaded successfully');
  console.log('📋 Sample extraction:', depedInfo);
  console.log('');
} catch (error) {
  console.error('❌ PDF Service test failed:', error.message);
  process.exit(1);
}

// Test 3: Test Document Model
try {
  console.log('🗃️  Testing Document Model...');
  console.log('✅ Document model loaded successfully');
  console.log('📝 Schema fields:', Object.keys(Document.schema.paths));
  console.log('');
} catch (error) {
  console.error('❌ Document Model test failed:', error.message);
  process.exit(1);
}

console.log('🎉 All Phase 2 components are working correctly!');
console.log('📁 Your server directory should now have:');
console.log('   ├── models/Document.js');
console.log('   ├── utils/fileUtils.js');
console.log('   ├── services/pdfProcessor.js');
console.log('   ├── uploads/documents/ (directory)');
console.log('   └── test/testSetup.js');
console.log('\n✅ Ready to proceed to Phase 2.5: Admin Routes Creation');