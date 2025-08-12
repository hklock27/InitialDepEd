import React, { useState } from 'react';
import './Dashboard.css'; // Your existing styles
import ChatInterface from './ChatInterface';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('chat'); // Start with chat as default

  return (
    <div className="dashboard-container">
      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          🤖 DepEd Assistant
        </button>
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📚 Documents
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'chat' && (
          <div className="chat-container">
            <ChatInterface />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>Welcome to DepEd Assistant</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>🤖 AI Assistant</h3>
                <p>Get instant answers to DepEd policies and procedures</p>
                <button onClick={() => setActiveTab('chat')}>
                  Start Chatting
                </button>
              </div>
              <div className="stat-card">
                <h3>📚 Document Library</h3>
                <p>Browse official DepEd documents and resources</p>
                <button onClick={() => setActiveTab('documents')}>
                  View Documents
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-section">
            <h2>📚 Document Library</h2>
            <p>Browse and search DepEd documents</p>
            {/* Add your existing document browsing component here */}
            <div className="coming-soon">
              <p>📁 Document browsing interface coming soon!</p>
              <p>For now, use the chat assistant to ask questions about documents.</p>
              <button onClick={() => setActiveTab('chat')}>
                Ask the Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;