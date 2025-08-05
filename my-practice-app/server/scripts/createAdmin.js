const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@deped.gov.ph' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    const admin = new User({
      username: 'deped_admin',
      email: 'admin@deped.gov.ph',
      password: 'admin123456', // You can change this
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@deped.gov.ph');
    console.log('🔑 Password: admin123456');
    console.log('👤 Username: deped_admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();