import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage/HomePage.jsx';
import ItemDetails from './components/ItemDetails/ItemDetails.jsx';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/itemDetails" element={<ItemDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;