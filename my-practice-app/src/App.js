// src/App.js
import React from 'react';
import './App.css';

function App() {
  const todos = [
    'Buy groceries',
    'Walk the dog',
    'Learn React',
    'Finish homework',
    'Exercise',
    'Read a book',
    'Clean the house',
    'Call a friend',
  ];

  return (
    <div className="todo-wrapper">
      <div className="todo-grid">
        {todos.map((item, index) => (
          <div key={index} className="todo-card">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
