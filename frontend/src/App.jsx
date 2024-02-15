import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header.jsx';
import HomePage from './components/HomePage/HomePage.jsx';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HeaderAndPage page={<HomePage />} />} />
        </Routes>
      </div>
    </Router>
  );
}

const HeaderAndPage = ({ page }) => (
  <div>
    <Header />
    {page}
  </div>
);

export default App;
