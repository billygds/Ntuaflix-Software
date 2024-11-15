import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import './MediaPage.css';

const MediaPage = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState({});
  const [currentUser, setUsername] = useState(localStorage.getItem('username') || '');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
          setUsername(storedUsername);
          // Fetch the user's lists when the component mounts
          fetchUserLists(storedUsername);
      }
  }, []);

  useEffect(() => {
      const fetchData = () => {
          fetchUserLists(currentUser);
      };

      const intervalId = setInterval(fetchData, 500); // Fetch data every 2 seconds

      return () => clearInterval(intervalId); // Cleanup function to clear interval when component unmounts

  }, [currentUser]); // Run effect whenever currentUser changes
  
  const toggleOptions = (titleID) => {
    setShowOptions(prevOptions => ({
      ...prevOptions,
      [titleID]: !prevOptions[titleID]
    }));
  };
  
  useEffect(() => {
    // Fetch media data from backend API
    fetch(`/title/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        return response.json();
      })
      .then(data => {
        // Set media data in state
        console.log(data.OriginalTitleName);
        setMedia(data);
        setLoading(false);
      })
      .catch(error => {
        // Handle fetch errors
        setError(error.message);
        setLoading(false);
      });
      
    // Fetch user data when component mounts
    fetchUserLists();
  }, [id]);

  const fetchUserLists = () => {
    // Fetch user data from backend API
    // Adjust the endpoint and logic according to your backend implementation
    fetch(`/fetchlists/${currentUser}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user lists');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleAddToList = (event, titleID, listType) => {
    event.stopPropagation();
    const list = listType === "watchlist" ? "Watchlist" : "AlreadyWatched";
    const requestBody = {
      username: currentUser,
      titleid: titleID,
      list_to_manipulate: listType,
      add_or_remove: "add" // Always add the movie initially
    };

    // Check if the movie is already in the list
    const isMovieInList = userData && userData[list] && userData[list].includes(titleID);

    // If the movie is already in the list, set add_or_remove to "remove"
    if (isMovieInList) {
      requestBody.add_or_remove = "remove";
    }

    // Send the request to update the list
    fetch('/editlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update list');
      }
      return response.json();
    })
    .then(data => {
      console.log(`Successfully ${isMovieInList ? "removed" : "added"} movie with ID ${titleID} to the ${listType}.`);
      // After updating the list, fetch the updated user lists
      setShowOptions({});
      fetchUserLists();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <Layout>
      <div className="media-page-container">
        <h1>Media Page</h1>
        {loading && <p className="loading-message">Loading...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {media && (
          <div className="media-details">
            <div className="extra-buttons">
                <button className="extra-button" onClick={() => toggleOptions(media.titleID)}>+</button>
                {showOptions[media.titleID] && (
                    <div className="options-container">
                        {userData && userData.Watchlist && userData.Watchlist.includes(media.titleID) ? (
                            <button className="option" onClick={(event) => handleAddToList(event, media.titleID, 'watchlist')}>(-)Watchlist</button>
                        ) : (
                            <button className="option" onClick={(event) => handleAddToList(event, media.titleID, 'watchlist')}>(+)Watchlist</button>
                        )}
                        {userData && userData.AlreadyWatched && userData.AlreadyWatched.includes(media.titleID) ? (
                            <button className="option" onClick={(event) => handleAddToList(event, media.titleID, 'already watched')}>(-)Already Watched</button>
                        ) : (
                            <button className="option" onClick={(event) => handleAddToList(event, media.titleID, 'already watched')}>(+)Already Watched</button>
                        )}
                    </div>
                )}
            </div>
            <h3 className="media-title">Title: {media.OriginalTitleName}</h3>
            <p className="media-info-item">Title ID: {media.titleID}</p>
            <p className="media-info-item">Title Type: {media.TitleType}</p>
            <p className="media-info-item">Start Year: {media.StartYear}</p>
            <p className="media-info-item">End Year: {media.EndYear || 'N/A'}</p>
            <p className="media-info-item">Genres: {media.Genre.map(genre => genre.genreTitle).join(', ')}</p>
            {media.rating && (
              <div>
                <p className="media-info-item">Rating: {media.rating.avRating}</p>
                <p className="media-info-item">Votes: {media.rating.nVotes}</p>
              </div>
            )}
            {!media.rating && <p className="media-info-item">No rating available</p>}
            <div className="akas-info">
              <h4>Akas Info:</h4>
              <ul>
                {media.AkasInfo.map((info, index) => (
                  <li key={index}>
                    <strong>Title:</strong> {info.akaTitle}, <strong>Region:</strong> {info.regionAbbrev}
                  </li>
                ))}
              </ul>
            </div>
            <div className="person-info">
              <h4>Person Info:</h4>
              <ul className="person-info-list">
                {media.PersonInfo.map((info, index) => (
                  <li key={index} className="person-info-item">
                    <strong>Name:</strong> <Link to={`/worker/${info.nameID}`} className="person-name-link">{info.name}</Link>,
                    <strong>Category:</strong> {info.category}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MediaPage;
