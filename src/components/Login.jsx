import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost/backendPHP/api.php?action=login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
        console.log(response);
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify({
          authenticated: true,
          userId: response.data.user_id,
          userName: response.data.name
        }));
        navigate('/dashboard');
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (

    <div className="login-container">
      <img height='50' src='https://multiplierai.co/wp-content/uploads/2022/06/multiplier_logo.png'/>
      {/* <h2>Login</h2> */}
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
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
