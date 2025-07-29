// src/App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

// Auto-login if rememberMe was saved
React.useEffect(() => {
  const remembered = localStorage.getItem('rememberMe') === 'true';
  if (remembered) {
    setLoggedIn(true);
  }
}, []);


  const todos = [
    'SDO History',
    'Updated Memorandum & Advisory DepEd 2025',
    'Retirement Plan Benefits and Checklist',
    'Availaibility of Benefits for DepEd Epmloyees',
    'Availability of the Government Car Vehicle and Venue',
    'Process Flow',
    'Workflow',
    'Mission, Vision and Code of Ethics',
  ];

  const filteredTodos = todos.filter((todo) =>
    todo.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setLoggedIn(true);
      setShowLoginModal(false);
      setError('');
  
      // 👉 Save login state and username to localStorage
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('savedUsername', username);
  
      setUsername('');
      setPassword('');
    } else {
      setError('Please enter both username and password.');
    }
  };

React.useEffect(() => {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  const savedUsername = localStorage.getItem('savedUsername');

  if (isLoggedIn) {
    setLoggedIn(true);
    if (savedUsername) {
      setUsername(savedUsername); // For welcome message
    }
  }
}, []);


const handleLogout = () => {
  setLoggedIn(false);
  setDropdownOpen(false);
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('savedUsername');
};


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="todo-wrapper">
      <div className="header-bar">
        <div className="top-title">
          <img src="/deped.png" alt="deped" className="deped-img" />
          <div className="title-text">
            <h1>DEPARTMENT OF EDUCATION</h1>
            <p>SCHOOLS DIVISION OF CADIZ CITY, NEGROS ISLAND REGION</p>
            <p>"Para sa Wais na Edukasyon, Serbisyong Makabago"</p>
          </div>
        </div>

        <div className="top-right-logos">
          <img src="/BPLO.png" alt="Settings" className="right-logo-img" />
          <img src="/sdocadiz.png" alt="Profile" className="right-logo-img" />

          {!loggedIn ? (
            <button className="login-button" onClick={handleLoginClick}>Log In</button>
          ) : (
            <div className="profile-dropdown-wrapper">
              <img
                src="/user-icon.png"
                alt="User"
                className="profile-avatar"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <p>👤 My Profile</p>
                  <p>⚙️ Settings</p>
                  <p onClick={handleLogout}>🚪 Log Out</p>
                </div>
              )}
              {loggedIn && username && (
                <div className="welcome-message">
                   👋 Maligayang Pagbalik!, <strong>{username}</strong>!
               </div>
              )}

            </div>
          )}
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Magtanong tungkol sa SDO Cadiz City. . ."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="todo-grid">
        {filteredTodos.map((item, index) => (
          <div key={index} className="todo-card" style={{ animationDelay: `${index * 0.05}s` }}>
            {item}
          </div>
        ))}
      </div>

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h2>Log In with DepEd Email Account</h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit">Sign In</button>
              <button type="button" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
