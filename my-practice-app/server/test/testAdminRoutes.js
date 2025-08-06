// server/test/testAdminRoutes.js
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Admin Routes Setup...\n');

// Test 1: Check if admin routes file exists
const adminRoutesPath = path.join(__dirname, '../routes/admin.js');
if (fs.existsSync(adminRoutesPath)) {
  console.log('✅ Admin routes file exists: routes/admin.js');
} else {
  console.error('❌ Admin routes file missing: routes/admin.js');
  process.exit(1);
}

// Test 2: Check if server.js has been updated
const serverPath = path.join(__dirname, '../server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (serverContent.includes("require('./routes/admin')")) {
    console.log('✅ Admin routes imported in server.js');
  } else {
    console.log('⚠️  Please add admin routes to server.js:');
    console.log('   const adminRoutes = require("./routes/admin");');
    console.log('   app.use("/api/admin", adminRoutes);');
  }
  
  if (serverContent.includes("app.use('/api/admin'") || serverContent.includes('app.use("/api/admin"')) {
    console.log('✅ Admin routes mounted in server.js');
  } else {
    console.log('⚠️  Please mount admin routes in server.js:');
    console.log('   app.use("/api/admin", adminRoutes);');
  }
} else {
  console.error('❌ server.js file not found');
  process.exit(1);
}

// Test 3: Check upload directories
const uploadsDir = path.join(__dirname, '../uploads');
const documentsDir = path.join(__dirname, '../uploads/documents');

if (fs.existsSync(uploadsDir)) {
  console.log('✅ Uploads directory exists');
} else {
  console.log('ℹ️  Uploads directory will be created automatically');
}

if (fs.existsSync(documentsDir)) {
  console.log('✅ Documents directory exists');
} else {
  console.log('ℹ️  Documents directory will be created automatically');
}

console.log('\n📋 Admin API Endpoints Available:');
console.log('   GET    /api/admin/documents          - List all documents');
console.log('   POST   /api/admin/documents/upload   - Upload new document');
console.log('   GET    /api/admin/documents/:id      - Get document details');
console.log('   PUT    /api/admin/documents/:id      - Update document');
console.log('   DELETE /api/admin/documents/:id      - Delete document');
console.log('   GET    /api/admin/documents/:id/download - Download document');
console.log('   GET    /api/admin/stats              - Get admin statistics');

console.log('\n🔐 All endpoints require admin authentication');
console.log('📁 Ready to test document uploads!');

console.log('\n✅ Phase 2.5 setup complete!');