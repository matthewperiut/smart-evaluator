import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage/HomePage.jsx';
import axios from 'axios';

function App() {
  const [excelData, setExcelData] = useState([]);
  const [isExcelUploaded, setIsExcelUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [solutionId, setSolutionId] = useState();

  const handleExcelUpload = (data, fileName, solutionId) => {
    if (data) {
      console.log("test");
      localStorage.setItem('uploadedExcel', JSON.stringify(data));
      if (fileName !== null) {
        localStorage.setItem('fileName', fileName);
      } else {
        localStorage.setItem('fileName', 'Session ' + solutionId);
      }
      localStorage.setItem('solutionId', solutionId)
      setSolutionId(solutionId);
      setExcelData(data);
      setIsExcelUploaded(true);
      setFileName(fileName);
    } else {
      setIsExcelUploaded(false);
      localStorage.removeItem('uploadedExcel');
      localStorage.removeItem('chosenSessionID');
      localStorage.removeItem('solutionId');
      localStorage.removeItem('fileName');
    }
  };

  useEffect(() => {
    const uploadedExcel = localStorage.getItem('uploadedExcel');
    if (uploadedExcel) {
      setIsExcelUploaded(true);
      const parsedData = JSON.parse(uploadedExcel);
      handleExcelUpload(parsedData, localStorage.getItem("fileName"), localStorage.getItem('solutionId')); // Use handleExcelUpload instead of onExcelUpload
      setSolutionId(localStorage.getItem("solutionId"));
      setFileName(localStorage.getItem("fileName")); // Set fileName state
    }
  }, [solutionId]);

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={<HomePage excelData={excelData} solutionId={solutionId} isExcelUploaded={isExcelUploaded}
              onExcelUpload={handleExcelUpload} fileName={fileName} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;