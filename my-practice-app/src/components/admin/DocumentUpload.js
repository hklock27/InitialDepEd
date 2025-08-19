import React, { useState, useEffect } from 'react';
import '../../styles/DocumentStyles.css';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    documentType: 'memo_circular',
    documentNumber: ''
  });

  const documentTypes = [
    { value: 'memo_circular', label: 'Memo Circular' },
    { value: 'department_order', label: 'Department Order' },
    { value: 'policy', label: 'Policy' },
    { value: 'guidelines', label: 'Guidelines' },
    { value: 'other', label: 'Other' }
  ];

  // Load existing documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      // Try to get documents from your existing route
      const response = await fetch('http://localhost:5000/api/Document');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  };

  const handleInputChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Auto-generate title if empty
      if (!uploadData.title) {
        const fileName = file.name.replace('.pdf', '');
        setUploadData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    } else {
      alert('Please select a PDF file only.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Auto-generate title if empty
      if (!uploadData.title) {
        const fileName = file.name.replace('.pdf', '');
        setUploadData(prev => ({
          ...prev,
          title: fileName
        }));
      }
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    if (!uploadData.title.trim()) {
      alert('Please enter a document title.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('title', uploadData.title.trim());
      formData.append('documentType', uploadData.documentType);
      formData.append('documentNumber', uploadData.documentNumber);
      formData.append('uploadedBy', 'Admin');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        alert(`Document "${uploadData.title}" uploaded successfully!`);
        
        // Reset form
        setSelectedFile(null);
        setUploadData({
          title: '',
          documentType: 'memo_circular',
          documentNumber: ''
        });
        
        // Refresh document list
        loadDocuments();
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        alert('Upload failed: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const deleteDocument = async (documentId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadDocuments(); // Refresh the list
        alert('Document deleted successfully');
      } else {
        console.error('Failed to delete document');
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="document-manager">
      {/* Header */}
      <div className="document-header">
        <div className="header-content">
          <h2>📚 DepEd Document Management</h2>
          <p>Upload and manage DepEd documents for the AI chatbot</p>
        </div>
        <div className="document-stats">
          <div className="stat">
            <span className="stat-number">{documents.length}</span>
            <span className="stat-label">Documents</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>
          <h3>Upload DepEd Document</h3>
          <p>Drag and drop a PDF file here or click to browse</p>
          <input
            type="file"
            id="file-input"
            accept=".pdf"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="file-input" className="upload-btn">
            Choose PDF File
          </label>
        </div>

        {/* Selected file and form */}
        {selectedFile && (
          <div className="selected-files">
            <h4>Selected File</h4>
            <div className="file-item">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>

            {/* Document Information Form */}
            <div className="document-form">
              <div className="form-group">
                <label htmlFor="title">Document Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadData.title}
                  onChange={handleInputChange}
                  placeholder="Enter document title"
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
                <label htmlFor="documentNumber">Document Number (optional)</label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  value={uploadData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., DO_s2024_020"
                />
              </div>
            </div>

            <button 
              onClick={uploadDocument}
              disabled={uploading}
              className="upload-submit-btn"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>

            {uploading && (
              <div className="upload-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className="progress-text">{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="document-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Documents List */}
      <div className="documents-list">
        <div className="list-header">
          <h3>Uploaded Documents ({filteredDocuments.length})</h3>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Documents Found</h3>
            <p>
              {documents.length === 0 
                ? "Upload your first DepEd document to get started"
                : "No documents match your search criteria"
              }
            </p>
          </div>
        ) : (
          <div className="document-grid">
            {filteredDocuments.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="document-icon">📄</div>
                <div className="document-info">
                  <h4 className="document-title">{doc.title || doc.originalName}</h4>
                  <div className="document-meta">
                    <span className="document-size">{formatFileSize(doc.fileSize)}</span>
                    <span className="document-date">{formatDate(doc.uploadedAt)}</span>
                  </div>
                  <div className="document-status">
                    <span className="status-badge processed">
                      ✅ Ready for Search
                    </span>
                  </div>
                </div>
                <div className="document-actions">
                  <button 
                    onClick={() => deleteDocument(doc._id, doc.title || doc.originalName)}
                    className="delete-btn"
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;