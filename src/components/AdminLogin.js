import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {
      verifyToken(authToken);
    }
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://192.168.1.32:3001/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.valid) {
        navigate('/admin-panel');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const handleLogin = async () => {
    const response = await fetch('http://192.168.1.32:3001/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      sessionStorage.setItem('authToken', data.token); 
      navigate('/admin-panel');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username && password) {
      handleLogin();
    } else if(e.key === 'Enter' && !password) {
      window.alert("Lütfen şifrenizi girin!");
    }
  };

  return (
    <div className='container'>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" onKeyDown={handleKeyDown} required />
      <button type="submit" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AdminLogin;
