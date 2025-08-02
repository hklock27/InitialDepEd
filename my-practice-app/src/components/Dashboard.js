// src/components/Dashboard.js
import React from 'react';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <div className="dashboard-content">
        <div className="user-info-card">
          <h3>User Information</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
        
        <div className="welcome-message">
          <h3>You're successfully logged in!</h3>
          <p>This is your dashboard where you can manage your account and access features.</p>
          <p>Your authentication is working with MongoDB Atlas!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
