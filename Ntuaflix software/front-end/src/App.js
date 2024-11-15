// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignUpForm';
import WorkerPage from './components/WorkerPage';
import MediaPage from './components/MediaPage';
import MediaSearch from './components/MediaSearch';
import WorkerSearch from './components/WorkerSearch';
import Watchlist from './components/Watchlist';
import AlreadyWatched from './components/AlreadyWatched';

function App() {

  return (
    <Router>
      <div className="App">
          <Routes>
            <Route exact path="/" element={<Homepage />} />
            <Route path="/signin" element={<SignInForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/worker/:id" element={<WorkerPage />} />
            <Route path="/media/:id" element={<MediaPage />} />
            <Route path="/media-search" element={<MediaSearch />} />
            <Route path="/worker-search" element={<WorkerSearch />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/already-watched" element={<AlreadyWatched />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
