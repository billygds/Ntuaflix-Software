// Import React, useState, useEffect, and other necessary modules
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import './MediaSearch.css';

// Define the MediaSearch component
const MediaSearch = () => {
    // Get the search data from the location
    const location = useLocation();
    const searchData = location.state?.searchData || [];
    
    // Define state variables
    const [showOptions, setShowOptions] = useState({});
    const [currentUser, setUsername] = useState(localStorage.getItem('username') || '');
    const [userData, setUserData] = useState(null);
  
    // useEffect hook to fetch user lists when the component mounts or currentUser changes
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
            fetchUserLists(storedUsername);
        }
    }, [currentUser]);

    // Function to fetch user lists
    const fetchUserLists = (username) => {
        fetch(`/fetchlists/${username}`)
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

    // Function to toggle options
    const toggleOptions = (mediaItemId) => {
        setShowOptions(prevState => ({
            ...prevState,
            [mediaItemId]: !prevState[mediaItemId]
        }));
    };

    // Function to handle adding/removing from the watchlist or already watched
    const handleAddToList = (event, movieId, listType) => {
        event.stopPropagation();
        const list = listType === "watchlist" ? "Watchlist" : "AlreadyWatched";
        const requestBody = {
            username: currentUser,
            titleid: movieId,
            list_to_manipulate: listType,
            add_or_remove: "add" // Always add the movie initially
        };
    
        // Check if the movie is already in the list
        const isMovieInList = userData && userData[list] && userData[list].includes(movieId);
    
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
            console.log(`Successfully ${isMovieInList ? "removed" : "added"} movie with ID ${movieId} to the ${listType}.`);
            // After updating the list, fetch the updated user lists
            setShowOptions({});
            fetchUserLists(currentUser);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    // Function to handle clicks outside options container
    const handleClickOutside = (event) => {
        const isOutsideExtraButtons = !event.target.closest('.extra-buttons');
        const isOutsideOptionsContainer = !event.target.closest('.options-container');
        if (isOutsideExtraButtons && isOutsideOptionsContainer) {
            setShowOptions({});
        }
    };

    // useEffect hook to add click event listener for outside clicks
    useEffect(() => {
        document.body.addEventListener('click', handleClickOutside);
        return () => {
            document.body.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // If searchData is not an array, display no search results
    if (!Array.isArray(searchData)) {
        return <Layout><div>No search results available.</div></Layout>;
    }

    // Return the JSX for the MediaSearch component
    return (
        <Layout>
            <div className="media-search-container">
                <h2 className="search-results-heading">Media Search Results</h2>
                <ul className="media-list">
                    {searchData.map(item => (
                        <li key={item.titleID} className="media-item">
                            <div className="media-details">
                                <div className="extra-buttons">
                                    <button className="extra-button" onClick={() => toggleOptions(item.titleID)}>+</button>
                                    {showOptions[item.titleID] && (
                                        <div className="options-container">
                                            {userData && userData.Watchlist && userData.Watchlist.includes(item.titleID) ? (
                                                <button className="option" onClick={(event) => handleAddToList(event, item.titleID, 'watchlist')}>(-)Watchlist</button>
                                            ) : (
                                                <button className="option" onClick={(event) => handleAddToList(event, item.titleID, 'watchlist')}>(+)Watchlist</button>
                                            )}
                                            {userData && userData.AlreadyWatched && userData.AlreadyWatched.includes(item.titleID) ? (
                                                <button className="option" onClick={(event) => handleAddToList(event, item.titleID, 'already watched')}>(-)Already Watched</button>
                                            ) : (
                                                <button className="option" onClick={(event) => handleAddToList(event, item.titleID, 'already watched')}>(+)Already Watched</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <a href={`/media/${item.titleID}`} className="media-link">
                                {item.titlePoster && <img src={item.titlePoster} alt={item.OriginalTitleName} className="media-poster" />} {/* Display the poster image if available */}
                                    <div className="media-info-container">
                                        <div className="media-info-label">Title:</div>
                                        <div className="media-info-value">{item.OriginalTitleName}</div>
                                    </div>
                                    <div className="media-info-container">
                                        <div className="media-info-label">Type:</div>
                                        <div className="media-info-value">{item.TitleType}</div>
                                    </div>
                                    <div className="media-info-container">
                                        <div className="media-info-label">Start Year:</div>
                                        <div className="media-info-value">{item.StartYear}</div>
                                    </div>
                                    <div className="media-info-container">
                                        <div className="media-info-label">End Year:</div>
                                        <div className="media-info-value">{item.EndYear || 'N/A'}</div>
                                    </div>
                                    {/* Check if Genre exists and is not null */}
                                    <div className="media-info-container">
                                        <div className="media-info-label">Genres:</div>
                                        <div className="media-info-value">{item.Genre ? item.Genre.map(genre => genre.genreTitle).join(', ') : 'N/A'}</div>
                                    </div>
                                    {/* Check if AkasInfo exists and is not null */}
                                    <div className="media-info-container">
                                        <div className="media-info-label">Akas:</div>
                                        <div className="media-info-value">{item.AkasInfo ? item.AkasInfo.map(aka => `${aka.akaTitle} (${aka.regionAbbrev})`).join(', ') : 'N/A'}</div>
                                    </div>
                                    {/* Check if PersonInfo exists and is not null */}
                                    <div className="media-info-container">
                                        <div className="media-info-label">People:</div>
                                        <div className="media-info-value">{item.PersonInfo ? item.PersonInfo.map(person => `${person.name} (${person.category})`).join(', ') : 'N/A'}</div>
                                    </div>
                                    {/* Check if rating exists and is not null */}
                                    <div className="media-info-container">
                                        <div className="media-info-label">Rating:</div>
                                        <div className="media-info-value">{item.rating ? `${item.rating.avRating} (Votes: ${item.rating.nVotes})` : 'N/A'}</div>
                                    </div>
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Layout>
    );
};

// Export the MediaSearch component
export default MediaSearch;
