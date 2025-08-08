const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const documentRoutes = require('./routes/documents');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');

// Import chat service for document search
const chatService = require('./services/chatService');


require('dotenv').config();

const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use('/api/Document', documentRoutes);



// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Initialize chat service
chatService.loadDocuments().then(() => {
  console.log('🤖 Chat service initialized with document search');
}).catch(error => {
  console.error('Failed to initialize chat service:', error);
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(' Auth routes available at /api/auth');
  console.log(' Admin routes available at /api/admin');
  console.log(' Chat routes available at /api/chat');
});