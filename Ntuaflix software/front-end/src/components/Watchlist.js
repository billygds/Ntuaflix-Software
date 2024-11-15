import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistDetails, setWatchlistDetails] = useState([]);
  const [showOptions, setShowOptions] = useState({});
  const [currentUser, setUsername] = useState(localStorage.getItem('username') || '');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserLists(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchUserLists(currentUser);
  }, []);

  useEffect(() => {
    fetchWatchlistDetails(watchlist);
  }, [watchlist]);

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
        setWatchlist(data.Watchlist || []);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const fetchWatchlistDetails = (watchlist) => {
    const promises = watchlist.map(titleID =>
      fetch(`/title/${titleID}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch media details for ID: ${titleID}`);
          }
          return response.json();
        })
        .catch(error => {
          console.error(`Error fetching details for ID: ${titleID}`, error);
          return null;
        })
    );

    Promise.all(promises)
      .then(details => {
        setWatchlistDetails(details.filter(detail => detail !== null));
      })
      .catch(error => {
        console.error('Error fetching watchlist details:', error);
      });
  };

  return (
    <Layout>
      <div className="watchlist-container">
        <h2>Watchlist</h2>
        <ul className="media-list">
          {watchlistDetails.map(item => (
            <li key={item.titleID} className="media-item">
              <div className="media-details">
                <a href={`/media/${item.titleID}`} className="media-link">
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
                  {/* Add more details as needed */}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Watchlist;
