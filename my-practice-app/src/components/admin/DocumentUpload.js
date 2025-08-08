// src/components/DocumentUpload.js
import React, { useState } from 'react';
import api from '../../services/api';

const DocumentUpload = ({ onDocumentUploaded }) => {
  const [uploadData, setUploadData] = useState({
    title: '',
    documentType: 'memo_circular',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dragOver, setDragOver] = useState(false);

  const documentTypes = [
    { value: 'memo_circular', label: 'Memo Circular' },
    { value: 'department_order', label: 'Department Order' },
    { value: 'policy', label: 'Policy' },
    { value: 'guidelines', label: 'Guidelines' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage({ text: '', type: '' });
      
      // Auto-generate title if empty
      if (!uploadData.title) {
        const fileName = file.name.replace('.pdf', '');
        setUploadData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    } else {
      setMessage({ text: 'Please select a PDF file only.', type: 'error' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ text: 'Please select a PDF file to upload.', type: 'error' });
      return;
    }

    if (!uploadData.title.trim()) {
      setMessage({ text: 'Please enter a document title.', type: 'error' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', uploadData.title.trim());
      formData.append('documentType', uploadData.documentType);
      formData.append('tags', uploadData.tags);

      const response = await api.post('/admin/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setMessage({ 
        text: `Document "${response.data.document.title}" uploaded successfully!`, 
        type: 'success' 
      });

      // Reset form
      setUploadData({
        title: '',
        documentType: 'memo_circular',
        tags: ''
      });
      setSelectedFile(null);
      setUploadProgress(0);

      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded(response.data.document);
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      setMessage({ text: errorMessage, type: 'error' });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>📄 Upload New Document</h2>
        <p>Upload PDF documents to make them available for the chatbot to reference.</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* File Upload Area */}
        <div className="form-section">
          <label className="section-label">Select PDF Document</label>
          <div 
            className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <div className="selected-file">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <h4>{selectedFile.name}</h4>
                  <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    document.getElementById('file-input').value = '';
                  }}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">📁</div>
                <h3>Drop PDF file here or click to browse</h3>
                <p>Maximum file size: 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Information */}
        <div className="form-section">
          <label className="section-label">Document Information</label>
          
          <div className="form-group">
            <label htmlFor="title">Document Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={uploadData.title}
              onChange={handleInputChange}
              placeholder="Enter document title (e.g., DO_s2024_020)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="documentType">Document Type</label>
            <select
              id="documentType"
              name="documentType"
              value={uploadData.documentType}
              onChange={handleInputChange}
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={uploadData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas (e.g., policy, guidelines, 2024)"
            />
            <small className="help-text">
              Tags help users find documents more easily through search
            </small>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="upload-btn" 
          disabled={uploading || !selectedFile}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;