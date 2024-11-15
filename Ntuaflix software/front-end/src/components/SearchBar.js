import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('media');
  const [genreQuery, setGenreQuery] = useState('');
  const [minRatingQuery, setMinRatingQuery] = useState('');
  const [yearFromQuery, setYearFromQuery] = useState('');
  const [yearToQuery, setYearToQuery] = useState('');

  const handleSearch = () => {
    const trimmedSearchQuery = searchQuery.trim();
    const trimmedGenreQuery = genreQuery.trim();
    const trimmedMinRatingQuery = minRatingQuery.trim();
    const trimmedYearFromQuery = yearFromQuery.trim();
    const trimmedYearToQuery = yearToQuery.trim();

    if (
      (searchCategory !== 'genre' && trimmedSearchQuery !== '') ||
      (searchCategory === 'genre' &&
        (trimmedGenreQuery !== '' || trimmedMinRatingQuery !== ''))
    ) {
      let url;
      let requestBody;

      switch (searchCategory) {
        case 'media':
          url = '/searchtitle';
          requestBody = { titlepart: trimmedSearchQuery };
          break;
        case 'worker':
          url = '/searchname';
          requestBody = { namepart: trimmedSearchQuery };
          break;
        case 'genre':
          url = '/bygenre';
          requestBody = {
            qgenre: trimmedGenreQuery,
            minrating: trimmedMinRatingQuery,
          };

          // Add yearFrom and yearTo to the requestBody if they are not null
          if (trimmedYearFromQuery !== '' || trimmedYearToQuery !== '') {
            requestBody = {
              ...requestBody,
              yrFROM: trimmedYearFromQuery,
              yrTO: trimmedYearToQuery,
            };
          }
          break;
        default:
          // Handle default case
          break;
      }

      fetch(url, {
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
          let searchResultsPage;
          switch (searchCategory) {
            case 'media':
            case 'genre':
              searchResultsPage = '/media-search';
              break;
            case 'worker':
              searchResultsPage = '/worker-search';
              break;
            default:
              // Handle default case
              break;
          }
          navigate(searchResultsPage, { state: { searchData: data } });
        })
        .catch((error) => {
          console.error('Error:', error);
          if (error.message === 'Empty response from database') {
            // Handle empty response from database
            // For example, set a state to display a message to the user
          }
        });
    }
  };

  // Render additional inputs when 'genre' is selected
  const renderGenreInputs = () => {
    if (searchCategory === 'genre') {
      return (
        <div className="genre-inputs">
          <div className="input-group">
            <input
              id="genreQuery"
              className="SearchBar-input"
              type="text"
              placeholder="Enter genre"
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              id="minRatingQuery"
              className="SearchBar-input"
              type="text"
              placeholder="Enter min rating"
              value={minRatingQuery}
              onChange={(e) => setMinRatingQuery(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              id="yearFromQuery"
              className="SearchBar-input"
              type="text"
              placeholder="Enter year from"
              value={yearFromQuery}
              onChange={(e) => setYearFromQuery(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              id="yearToQuery"
              className="SearchBar-input"
              type="text"
              placeholder="Enter year to"
              value={yearToQuery}
              onChange={(e) => setYearToQuery(e.target.value)}
            />
          </div>
        </div>
      );
    } else {
      return (
        <input
          className="SearchBar-input"
          type="text"
          placeholder="Enter search query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      );
    }
  };

  return (
    <div className={`search-bar ${searchCategory === 'genre' ? 'expanded' : ''}`}>
      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
        className="search-category"
      >
        <option value="media">Media Title</option>
        <option value="worker">Worker Name</option>
        <option value="genre">Genre</option>
      </select>
      {renderGenreInputs()}
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
