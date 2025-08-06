// server/routes/admin.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');
const Document = require('../models/Document');
const PDFService = require('../services/pdfProcessor');
const { createUploadDirectories, generateUniqueFilename, validatePDF } = require('../utils/fileUtils');

// Initialize upload directories
createUploadDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { documentsDir } = createUploadDirectories();
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    try {
      validatePDF(file);
      cb(null, true);
    } catch (error) {
      cb(new Error(error.message), false);
    }
  }
});

// GET /api/admin/documents - Get all documents
router.get('/documents', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', documentType = '' } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (documentType && documentType !== 'all') {
      query.documentType = documentType;
    }
    
    // Execute query with pagination
    const documents = await Document.find(query)
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDocuments: total
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// POST /api/admin/documents/upload - Upload new document
router.post('/documents/upload', adminAuth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { title, documentType = 'other', tags = '' } = req.body;
    
    if (!title || title.trim().length === 0) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Document title is required' });
    }
    
    console.log('📄 Processing PDF:', req.file.originalname);
    
    // Extract text from PDF
    const pdfData = await PDFService.extractTextFromFile(req.file.path);
    const depedInfo = PDFService.extractDepEdInfo(pdfData.text);
    
    // Parse tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    
    // Create document record
    const document = new Document({
      title: title.trim(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadPath: req.file.path,
      extractedText: pdfData.text,
      documentType,
      tags: tagArray,
      uploadedBy: req.user._id
    });
    
    await document.save();
    
    console.log('✅ Document saved to database');
    
    // Populate uploadedBy for response
    await document.populate('uploadedBy', 'username email');
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        ...document.toObject(),
        depedInfo, // Include extracted DepEd information
        pages: pdfData.pages
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 10MB allowed.' });
    }
    
    res.status(500).json({ 
      message: 'Failed to upload document',
      error: error.message 
    });
  }
});

// GET /api/admin/documents/:id - Get single document details
router.get('/documents/:id', adminAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'username email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// PUT /api/admin/documents/:id - Update document
router.put('/documents/:id', adminAuth, async (req, res) => {
  try {
    const { title, documentType, tags } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title.trim();
    if (documentType) updateData.documentType = documentType;
    if (tags !== undefined) {
      updateData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    }
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'username email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// DELETE /api/admin/documents/:id - Delete document
router.delete('/documents/:id', adminAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(document.uploadPath)) {
      fs.unlinkSync(document.uploadPath);
      console.log('🗑️  File deleted:', document.filename);
    }
    
    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// GET /api/admin/documents/:id/download - Download document
router.get('/documents/:id/download', adminAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (!fs.existsSync(document.uploadPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Increment download count
    document.downloadCount += 1;
    await document.save();
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.fileType);
    
    // Send file
    res.sendFile(path.resolve(document.uploadPath));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download document' });
  }
});

// GET /api/admin/stats - Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const totalDownloads = await Document.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    
    const documentsByType = await Document.aggregate([
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);
    
    const recentUploads = await Document.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title documentType createdAt uploadedBy');
    
    res.json({
      totalDocuments,
      totalDownloads: totalDownloads[0]?.total || 0,
      documentsByType,
      recentUploads
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;