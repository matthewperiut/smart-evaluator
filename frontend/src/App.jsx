import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage/HomePage.jsx';
import ItemDetails from './components/ItemDetails/ItemDetails.jsx';

function App() {
  const [excelData, setExcelData] = useState([]);
  const [isExcelUploaded, setIsExcelUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [solutionId, setSolutionId] = useState(0);

  const handleExcelUpload = (data, fileName, solutionId) => {
    localStorage.setItem('uploadedExcel', JSON.stringify(data));
    localStorage.setItem('fileName', fileName);
    localStorage.setItem('solutionId', solutionId)
    setSolutionId(solutionId);
    setExcelData(data);
    setIsExcelUploaded(true);
    setFileName(fileName);
  };

  useEffect(() => {
    const uploadedExcel = localStorage.getItem('uploadedExcel');
    if (uploadedExcel) {
      const parsedData = JSON.parse(uploadedExcel);
      handleExcelUpload(parsedData, localStorage.getItem("fileName")); // Use handleExcelUpload instead of onExcelUpload
      setFileName(localStorage.getItem("fileName")); // Set fileName state
    }
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={<HomePage excelData={excelData} solutionId={solutionId} isExcelUploaded={isExcelUploaded} onExcelUpload={handleExcelUpload} fileName={fileName} />}
          />
          <Route path="/itemDetails" element={<ItemDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;