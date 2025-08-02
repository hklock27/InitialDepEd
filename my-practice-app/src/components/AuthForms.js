// src/components/AuthForm.js
import React, { useState } from 'react';
import axios from 'axios';

export default function AuthForm({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // or 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = `/api/auth/${mode}`;
    try {
      const res = await axios.post(endpoint, { username, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        onAuth(res.data.username);
      }
    } catch (err) {
      alert('Auth failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">{mode}</button>
      <p onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        Switch to {mode === 'login' ? 'Sign Up' : 'Login'}
      </p>
    </form>
  );
}
