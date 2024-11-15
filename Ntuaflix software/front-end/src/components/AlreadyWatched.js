import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './AlreadyWatched.css';

const AlreadyWatched = () => {
  const [AlreadyWatched, setAlreadyWatched] = useState([]);
  const [AlreadyWatchedDetails, setAlreadyWatchedDetails] = useState([]);
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
    fetchAlreadyWatchedDetails(AlreadyWatched);
  }, [AlreadyWatched]);

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
        setAlreadyWatched(data.AlreadyWatched || []);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const fetchAlreadyWatchedDetails = (AlreadyWatched) => {
    const promises = AlreadyWatched.map(titleID =>
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
        setAlreadyWatchedDetails(details.filter(detail => detail !== null));
      })
      .catch(error => {
        console.error('Error fetching AlreadyWatched details:', error);
      });
  };

  return (
    <Layout>
      <div className="AlreadyWatched-container">
        <h2>AlreadyWatched</h2>
        <ul className="media-list">
          {AlreadyWatchedDetails.map(item => (
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

export default AlreadyWatched;