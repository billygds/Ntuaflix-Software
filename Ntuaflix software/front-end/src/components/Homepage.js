import React, { useState, useEffect } from 'react';
import Layout from './Layout'; // Your layout component
import './Homepage.css';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();
  const [genre, setGenre] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestBody = { qgenre: genre, amount: amount };

    fetch('/bestofgenre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.length === 0) {
          throw new Error('Empty response from database');
        }
        // Redirect to the appropriate search results page
        let searchResultsPage = '/media-search';
        navigate(searchResultsPage, { state: { searchData: data } });
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.message === 'Empty response from database') {
          // Handle empty response from database
          // For example, set a state to display a message to the user
        }
      });
  };

  return (
    <Layout>
      <div className="homepage">
        <h1>Welcome to Ntuaflix</h1>
        <p>Explore your favorite movies here!</p>
        <form onSubmit={handleSubmit}>
          <label>
            Select a Genre:
            <input type="text" value={genre} onChange={handleGenreChange} />
          </label>
          <label>
            And a range:
            <input type="number" value={amount} onChange={handleAmountChange} min="1" />
          </label>
          <button type="submit">Search</button>
        </form>
        {error ? (
          <p>Error: {error}</p>
        ) : null}
      </div>
    </Layout>
  );
}

export default Homepage;
