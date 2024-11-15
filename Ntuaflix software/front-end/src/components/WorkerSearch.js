import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import './WorkerSearch.css';

const WorkerSearch = () => {
    const location = useLocation();
    const searchData = location.state?.searchData || [];

    // Check if searchData is null
    if (!Array.isArray(searchData)) {
        return <Layout><div className="error-message">No search results available.</div></Layout>;
    }

    return (
        <Layout>
            <div className="worker-search-container">
                <h2 className="search-results-heading">Worker Search Results</h2>
                <ul className="worker-list">
                    {searchData.map(worker => (
                        <li key={worker.nameID} className="worker-item">
                            <a href={`/worker/${worker.nameID}`} className="worker-link">
                                <div className="worker-details">
                                    <div className="worker-info-container">
                                        <div className="worker-info-label">Name:</div>
                                        <div className="worker-info-value">{worker.name}</div>
                                    </div>
                                    <div className="worker-info-container">
                                        <div className="worker-info-label">Birth Year:</div>
                                        <div className="worker-info-value">{worker.birthYr || 'N/A'}</div>
                                    </div>
                                    <div className="worker-info-container">
                                        <div className="worker-info-label">Death Year:</div>
                                        <div className="worker-info-value">{worker.deathYr || 'N/A'}</div>
                                    </div>
                                    <div className="worker-info-container">
                                        <div className="worker-info-label">Profession:</div>
                                        <div className="worker-info-value">{worker.profession}</div>
                                    </div>
                                    {/* Check if nameTitles exists and is not null */}
                                    <div className="worker-info-container">
                                        <div className="worker-info-label">Titles:</div>
                                        <div className="worker-info-value">{worker.nameTitles ? worker.nameTitles.map(title => `${title.titleID} (${title.category})`).join(', ') : 'N/A'}</div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </Layout>
    );
};

export default WorkerSearch;