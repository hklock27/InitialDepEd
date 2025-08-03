const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const chatSchema = new mongoose.Schema({


  userId: ObjectId,
  messages: [{
    content: String,
    sender: String, // 'user' or 'bot'
    timestamp: Date,
    sourceDocuments: [ObjectId] // References to documents used
  }],
  createdAt: Date,
  updatedAt: Date

})