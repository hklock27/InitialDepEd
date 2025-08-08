// src/components/DocumentManager.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    documentType: 'all'
  });
  const [editingDoc, setEditingDoc] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const documentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'memo_circular', label: 'Memo Circular' },
    { value: 'department_order', label: 'Department Order' },
    { value: 'policy', label: 'Policy' },
    { value: 'guidelines', label: 'Guidelines' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: filters.search,
        documentType: filters.documentType
      });

      const response = await api.get(`/admin/documents?${params}`);
      setDocuments(response.data.documents);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setMessage({ text: 'Failed to fetch documents', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleDownload = async (docId, title) => {
    try {
      const response = await api.get(`/admin/documents/${docId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ text: 'Failed to download document', type: 'error' });
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc({
      ...doc,
      tags: doc.tags.join(', ')
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        title: editingDoc.title,
        documentType: editingDoc.documentType,
        tags: editingDoc.tags
      };

      await api.put(`/admin/documents/${editingDoc._id}`, updateData);
      setMessage({ text: 'Document updated successfully', type: 'success' });
      setEditingDoc(null);
      fetchDocuments();
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ text: 'Failed to update document', type: 'error' });
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/documents/${docId}`);
      setMessage({ text: 'Document deleted successfully', type: 'success' });
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ text: 'Failed to delete document', type: 'error' });
    }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type) => {
    const typeObj = documentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  return (
    <div className="document-manager">
      <div className="manager-header">
        <h2>🗂️ Document Management</h2>
        <p>Manage and organize uploaded documents</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search documents..."
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </div>
          
          <select
            name="documentType"
            value={filters.documentType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button 
            onClick={() => setMessage({ text: '', type: '' })}
            className="close-message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="loading-state">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <h3>No documents found</h3>
          <p>Try adjusting your search criteria or upload new documents.</p>
        </div>
      ) : (
        <>
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="doc-header">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <h3>{doc.title}</h3>
                    <div className="doc-meta">
                      <span className="doc-type">{getDocumentTypeLabel(doc.documentType)}</span>
                      <span className="doc-size">{formatFileSize(doc.fileSize)}</span>
                      <span className="doc-downloads">⬇️ {doc.downloadCount}</span>
                    </div>
                  </div>
                  <div className="doc-actions">
                    <button
                      onClick={() => handleDownload(doc._id, doc.title)}
                      className="action-btn download-btn"
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="doc-details">
                  <p><strong>Original Name:</strong> {doc.originalName}</p>
                  <p><strong>Uploaded:</strong> {formatDate(doc.createdAt)} by {doc.uploadedBy?.username}</p>
                  {doc.tags.length > 0 && (
                    <div className="doc-tags">
                      <strong>Tags:</strong>
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Document</h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={editingDoc.documentType}
                  onChange={(e) => setEditingDoc({...editingDoc, documentType: e.target.value})}
                >
                  {documentTypes.slice(1).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={editingDoc.tags}
                  onChange={(e) => setEditingDoc({...editingDoc, tags: e.target.value})}
                  placeholder="Enter tags separated by commas"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setEditingDoc(null)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;