// src/components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import DocumentUpload from './admin/DocumentUpload';
import '../styles/Chat.css';

const ChatInterface = () => {
  const [activeTab, setActiveTab] = useState('chat');
  console.log('Current activeTab:', activeTab);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Add a render counter to force re-renders
  const [renderKey, setRenderKey] = useState(0);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial suggestions when component mounts
  useEffect(() => {
    loadSuggestions();
    // Add welcome message
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: 'Hello! I\'m the DepEd Assistant. I can help you find information about DepEd policies, procedures, and guidelines. What would you like to know?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Load query suggestions from backend
  const loadSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/suggestions');
      const data = await response.json();
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions.slice(0, 4)); // Show only first 4 suggestions
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  // Send message to chat backend
  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to backend
      const response = await fetch('http://localhost:5000/api/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: textToSend
        }),
      });

      const data = await response.json();
      
      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response?.message || 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        sources: data.response?.sources || [],
        followUp: data.response?.followUp || [],
        responseType: data.response?.type || 'error'
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
        responseType: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDocumentUploaded = (document) => {
    console.log('Document uploaded:', document);
    // You could add a success message or refresh document list here
  };

  // Enhanced tab switching with forced re-render
  const switchTab = (tabName) => {
    console.log(`Switching to ${tabName} tab`);
    setActiveTab(tabName);
    setRenderKey(prev => prev + 1); // Force re-render
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    console.log(`Rendering content for tab: ${activeTab}`);
    
    switch (activeTab) {
      case 'chat':
        return (
          <div className="chat-tab-content" key={`chat-${renderKey}`}>
            {/* Messages Container */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                    </div>
                    
                    {/* Show sources if available */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="message-sources">
                        <p><strong>📚 Sources:</strong></p>
                        <ul>
                          {message.sources.map((source, index) => (
                            <li key={index}>
                              <span className="source-title">{source.title}</span>
                              {source.page && <span className="source-page"> (Page {source.page})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Show follow-up questions if available */}
                    {message.followUp && message.followUp.length > 0 && (
                      <div className="follow-up-questions">
                        <p><strong>💡 Follow-up questions:</strong></p>
                        <div className="follow-up-buttons">
                          {message.followUp.map((question, index) => (
                            <button
                              key={index}
                              className="follow-up-btn"
                              onClick={() => handleSuggestionClick(question)}
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="message-timestamp">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">DepEd Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (show only when chat is empty or no recent activity) */}
            {messages.length <= 1 && suggestions.length > 0 && (
              <div className="chat-suggestions">
                <p className="suggestions-title">💬 Try asking:</p>
                <div className="suggestions-grid">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about DepEd policies, procedures, or guidelines..."
                  disabled={isLoading}
                  rows="1"
                />
                <button
                  className="send-button"
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </div>
              <div className="input-hint">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="documents-tab-content" key={`documents-${renderKey}`}>
            <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
          </div>
        );

      case 'analytics':
        return (
          <div className="analytics-tab-content" key={`analytics-${renderKey}`}>
            <div className="analytics-placeholder">
              <div className="placeholder-content">
                <h2>📊 Analytics Coming Soon</h2>
                <p>This section will show:</p>
                <ul>
                  <li>Chat usage statistics</li>
                  <li>Most asked questions</li>
                  <li>Document access reports</li>
                  <li>User engagement metrics</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chat-interface">
      {/* Chat Header with Tabs */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-title">
            <h2>🤖 DepEd Assistant</h2>
            <p>Ask me about DepEd policies, procedures, and guidelines</p>
          </div>
          <div className="chat-status">
            <span className="status-indicator online"></span>
            <span>Online</span>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => switchTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => switchTab('documents')}
          >
            📁 Documents
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => switchTab('analytics')}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Tab Content - Single container with dynamic content */}
      <div className="tab-content" key={`tab-content-${renderKey}`}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ChatInterface;