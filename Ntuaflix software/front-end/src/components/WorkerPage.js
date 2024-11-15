import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import './WorkerPage.css'; // Import the CSS file

const WorkerPage = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/name/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch worker');
        }
        return response.json();
      })
      .then(data => {
        // If the response data is an array, select the first worker
        const selectedWorker = Array.isArray(data) ? data[0] : data;
        setWorker(selectedWorker);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout>
      <div className="worker-page-container">
        <div className="worker-details">
          <h1 className="worker-title">{worker.name}</h1>
          <p>Birth Year: {worker.birthYr || 'N/A'}</p>
          <p>Death Year: {worker.deathYr || 'N/A'}</p>
          <p>Profession: {worker.profession}</p>
          <h4>Name Titles:</h4>
          <ul>
            {worker.nameTitles.map((title, index) => (
              <li key={index}>
                <strong>Title ID:</strong> <Link to={`/media/${title.titleID}`}>{title.titleID}</Link>, <strong>Category:</strong> {title.category}
              </li>
            ))}
          </ul>
          {/* Render other worker details */}
        </div>
      </div>
    </Layout>
  );
};

export default WorkerPage;
