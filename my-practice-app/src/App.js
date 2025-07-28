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
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
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
