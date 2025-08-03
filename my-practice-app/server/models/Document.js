const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    originalname: {
        type: String,
        required: true,
    },
    filesize: {
        type: Number,
        required: true, 
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    Content: {
        type: String,
        required: true,
    },
    documentType: {
        type: String, 
        required: true
    },
    documentNumber: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },



});
module.exports = mongoose.model('Document', documentSchema);