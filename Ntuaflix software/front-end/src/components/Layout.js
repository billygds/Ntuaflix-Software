import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Layout.css';

const Layout = ({ children, onSignOut }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [storedPrem, setStoredPrem] = useState(localStorage.getItem('prem') || '');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    const storedPrem = localStorage.getItem('prem');
    if (storedPrem) {
      setStoredPrem(storedPrem);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('username');
    setUsername('');
    localStorage.removeItem('prem');
    setStoredPrem('');
    navigate('/');
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <div className={`layout ${storedPrem === 1 ? 'premium' : 'default'}`}>
      <header>
        <div className="header-content">
          <h1 onClick={handleTitleClick}>Ntuaflix</h1>
          <SearchBar />
          <div className="sign-links">
            {username ? (
              <>
                <button onClick={toggleOptions} className="sign-link">Lists</button>
                {showOptions && (
                  <div className="options-menu">
                    <Link to="/watchlist" className="sign-link">Watchlist</Link>
                    <Link to="/already-watched" className="sign-link">Already Watched</Link>
                  </div>
                )}
                <button onClick={handleSignOut} className="sign-link">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="sign-link">Sign In</Link>
                <span className="separator"> | </span>
                <Link to="/signup" className="sign-link">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;