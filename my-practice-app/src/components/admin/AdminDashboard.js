// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentManager from './DocumentList';
import api from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalDownloads: 0,
    documentsByType: [],
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDocumentUploaded = () => {
    // Refresh stats when a new document is uploaded
    fetchStats();
    if (activeTab === 'overview') {
      // Stay on overview to show updated stats
    } else {
      // Switch to management tab to see the new document
      setActiveTab('manage');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="deped-logo">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMDY2Q0MiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPgo8cGF0aCBkPSJNMTIgNkw2IDEyVjE4TDEyIDI0SDE4TDI0IDE4VjEyTDE4IDZIMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" alt="DepEd Logo" />
            <div className="header-text">
              <h1>DepEd Admin Dashboard</h1>
              <p>Document Management System</p>
            </div>
          </div>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="deped-logo">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMDY2Q0MiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPgo8cGF0aCBkPSJNMTIgNkw2IDEyVjE4TDEyIDI0SDE4TDI0IDE4VjEyTDE4IDZIMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" alt="DepEd Logo" />
          <div className="header-text">
            <h1>DepEd Admin Dashboard</h1>
            <p>Document Management System</p>
          </div>
        </div>
        
        <div className="admin-actions">
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => handleTabChange('upload')}
        >
          📄 Upload Documents
        </button>
        <button 
          className={`nav-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => handleTabChange('manage')}
        >
          🗂️ Manage Documents
        </button>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>{stats.totalDocuments}</h3>
                  <p>Total Documents</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⬇️</div>
                <div className="stat-info">
                  <h3>{stats.totalDownloads}</h3>
                  <p>Total Downloads</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>{stats.documentsByType.length}</h3>
                  <p>Document Types</p>
                </div>
              </div>
            </div>

            {/* Documents by Type */}
            {stats.documentsByType.length > 0 && (
              <div className="chart-section">
                <h3>Documents by Type</h3>
                <div className="type-breakdown">
                  {stats.documentsByType.map((item, index) => (
                    <div key={index} className="type-item">
                      <span className="type-label">
                        {item._id === 'memo_circular' ? 'Memo Circular' :
                         item._id === 'department_order' ? 'Department Order' :
                         item._id === 'policy' ? 'Policy' :
                         item._id === 'guidelines' ? 'Guidelines' :
                         'Other'}
                      </span>
                      <span className="type-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Uploads */}
            {stats.recentUploads.length > 0 && (
              <div className="recent-section">
                <h3>Recent Uploads</h3>
                <div className="recent-list">
                  {stats.recentUploads.map((doc) => (
                    <div key={doc._id} className="recent-item">
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <h4>{doc.title}</h4>
                        <p>
                          {doc.documentType} • 
                          Uploaded by {doc.uploadedBy?.username} • 
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.totalDocuments === 0 && (
              <div className="empty-state">
                <h3>No documents uploaded yet</h3>
                <p>Start by uploading your first PDF document using the Upload Documents tab.</p>
                <button 
                  onClick={() => handleTabChange('upload')}
                  className="primary-btn"
                >
                  Upload First Document
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
        )}

        {activeTab === 'manage' && (
          <DocumentManager />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;