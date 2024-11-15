// SignInForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './SignInForm.css'

const SignInForm = ({ onSignIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = () => {
    fetch('/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid username or password');
      }
      // Assuming the response contains data indicating the sign-in status
      return response.json(); // Parse the response body as JSON
    })
    .then(data => {
      // Check the sign-in status from the response data
      if (data==1 || data==0) {
        // Sign-in was successful
        // Call the onSignIn function provided by the parent component (App)
        // Storing the username in localStorage
        // Redirect to the homepage after successful sign-in
        localStorage.setItem('username', username);
        localStorage.setItem('premium', data);
        navigate('/');
      } else {
        // Sign-in was unsuccessful
        alert('Invalid username or password');
      }
    })
    .catch(error => {
      setError(error.message);
    });
  };

  return (
    <Layout>
      <div className="SignInForm">
        <h2>Sign In</h2>
        {error && <p className="error">Error: {error}</p>}
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
        <button onClick={handleSignIn}>Sign In</button>
      </div>
    </Layout>
  );
};

export default SignInForm;
