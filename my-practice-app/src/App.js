// src/App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState('');
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

  return (
  
    
    <div className="todo-wrapper"> 
      <div className="top-container">
        <div className="top-title">
                  <img src="/deped.png" alt="deped" className="deped-img" />
        <div className="title-text">
            <h1>DEPARTMENT OF EDUCATION</h1>
            <p>SCHOOLS DIVISION OF CADIZ CITY, NEGROS ISLAND REGION</p>
      </div>
      <div className="top-right-logos">
          <img src="/BPLO.png" alt="Settings" className="right-logo-img" />
           <img src="/sdocadiz.png" alt="Profile" className="right-logo-img" />
        </div> 
        </div>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Ask Anything About SDO Cadiz City..."
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

    </div>
  );
}

export default App;
