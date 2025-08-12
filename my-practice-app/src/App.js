// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatInterface from './components/ChatInterface';
import './App.css';
import './styles/Admin.css';


function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Set view based on user role
        if (parsedUser.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Redirect based on user role
    if (userData.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />
      )}
      
      {currentView === 'register' && (
        <Register 
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
      
      {currentView === 'dashboard' && user && user.role === 'user' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'admin' && user && user.role === 'admin' && (
        <AdminDashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
    </div>,
    
    <div className="chat-section">
      <ChatInterface />
    </div>
  );
}

export default App;