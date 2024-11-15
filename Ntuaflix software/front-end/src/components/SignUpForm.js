import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './SignUpForm.css'

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPrem, setIsPrem] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = () => {
    const userData = {
      username: username,
      password: password,
      premium_user: isPrem
    };
  
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to sign up');
      }
      // Handle successful sign-up
      // For example, you can show a success message to the user
      alert('Sign up successful! You can now sign in.');
      navigate('/signin');
    })
    .catch(error => {
      alert(`Username '${username}' is already in use.`);
    });
  };

  return (
    <Layout>
      <div className="SignUpForm">
        <h2>Sign Up</h2>
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
        <label>
          <input
            type="checkbox"
            checked={isPrem}
            onChange={(e) => setIsPrem(e.target.checked)}
          />
          Premium
        </label>
        <button onClick={handleSignUp}>Sign Up</button>
      </div>
    </Layout>
  );
};

export default SignUpForm;
