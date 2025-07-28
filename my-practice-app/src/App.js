// src/App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState('');
  const todos = [
    'SDO History',
    'Updated Memorandum & Advisory in DepEd 2025',
    'Availability of Benefits for DepEd Employees and Checklist of Requirements',
    'Retirement Plan and Benefits and Checklist',
    'Availability of the Government Car Vehicle and Room Venue',
    'Process Flow',
    'Code of Ethics',
    'Mission and Vision',
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
          <div key={index} className="todo-card">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
