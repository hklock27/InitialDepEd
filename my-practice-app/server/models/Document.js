// server/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['application/pdf']
  },
  uploadPath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['memo_circular', 'department_order', 'policy', 'guidelines', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
documentSchema.index({ title: 'text', extractedText: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);