const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const extractTextFromPDF = require('../utils/textProcessing');
const Document = require('../models/Document');

// POST /api/documents/upload
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { title, documentType, documentNumber, uploadedBy } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const content = await extractTextFromPDF(file.path);

    const doc = new Document({
      title,
      filename: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      uploadedBy,
      uploadedAt: new Date(),
      content,
      documentType,
      documentNumber,
      isActive: true
    });

              // GET /api/documents - Get all documents
          router.get('/', async (req, res) => {
            try {
              const documents = await Document.find({ isActive: true })
                .sort({ uploadedAt: -1 });
              res.json(documents);
            } catch (error) {
              console.error('Error fetching documents:', error);
              res.status(500).json({ error: 'Failed to fetch documents' });
            }
          });

    await doc.save();
    res.status(201).json({ message: 'Document uploaded successfully', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

module.exports = router;
