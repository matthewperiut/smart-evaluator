import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './HomePage.css';
import Header from '../Header/Header';

const HomePage = () => {
    const [file, setFile] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [solutionName, setSolutionName] = useState('');
    const [areaType, setAreaType] = useState('');
    const [isExcelUploaded, setIsExcelUploaded] = useState(false);

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');
        if (uploadedExcel) {
            setExcelData(JSON.parse(uploadedExcel));
            setIsExcelUploaded(true);
        }
    }, []);

    const readExcel = async (file) => {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];
        let maxColumnNumber = 0;
        worksheet.eachRow((row) => {
            if (row.cellCount > maxColumnNumber) {
                maxColumnNumber = row.cellCount;
            }
        });

        const rows = [];
        let isFirstRow = true;
        worksheet.eachRow((row, rowNumber) => {
            if (isFirstRow) {
                isFirstRow = false;
                return; // Skip the first row (It was displaying the first row twice initially)
            }
            const rowData = new Array(maxColumnNumber).fill('');
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                rowData[colNumber - 1] = cell.value || ''; // Ensure empty cells are represented
            });
            rows.push(rowData);
        });
        setExcelData(rows);
        setIsExcelUploaded(true);
        localStorage.setItem('uploadedExcel', JSON.stringify(rows));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            readExcel(file);
        }
        catch (error) {
            console.error('Error reading excel document:', error);
        }
        try {
            const response = await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toggleModal();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file to backend server.');
        }
    };

    const toggleModal = async (e) => {
        var modal = document.getElementById("generateSolution");
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    }

    const handleFileInputChange = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        console.log(file);
    }

    return (
        <div>
            <Header />
            <div>
                <h2 className='work-dashboard'>Work Dashboard</h2>
                <button className='button generate-new-solution' onClick={toggleModal}>+ Generate New Solution</button>
                <div className="search-container">
                    <input type="text" placeholder="Search" />
                </div>
                <div className="magnify"></div>
                <br />
                <br />


                {/* Modal */}
                <div id="generateSolution" className='modal-filter'>
                    <div className='modal-container'>
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <div className='modal-content'>
                                <h2 className='poppins-regular'
                                    style={{ color: 'rgb(68, 167, 110)' }}>
                                    Import New Items
                                </h2>
                                <hr className='modal-line'></hr>
                                <div className='modal-form'>
                                    <h3 className='sarabun-regular'
                                        style={{
                                            fontSize: '18px',
                                            display: 'flex',
                                            marginLeft: '15%',
                                            color: 'rgb(20, 90, 50)'
                                        }}
                                    >
                                        Upload
                                    </h3>
                                    <div>
                                        {file ? (
                                            <div>
                                                <p>File selected: {file.name}</p>
                                                <button onClick={() => setFile(null)}>Clear</button>
                                            </div>
                                        ) : (
                                            <div className='upload-file'>
                                                <label htmlFor="fileInput">
                                                    Click or drag a file here to upload
                                                </label>
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    required onChange={handleFileInputChange}
                                                    accept=".xlsx, .xls"
                                                    className="file-input"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className='header-container'>
                                        <div className='input-container'>
                                            <h3 className='sarabun-regular'
                                                style={{ fontSize: '18px', color: 'rgb(20, 90, 50)' }}
                                            >
                                                Solution Name
                                            </h3>
                                            <input 
                                                type="text"
                                                placeholder="..."
                                                value={solutionName}
                                                onChange={(e) => setSolutionName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className='input-container'>
                                            <h3 className='sarabun-regular'
                                                style={{ fontSize: '18px', color: 'rgb(20, 90, 50)' }}
                                            >
                                                Area Type
                                            </h3>
                                            <input 
                                                type="text"
                                                placeholder="..."
                                                value={areaType}
                                                onChange={(e) => setAreaType(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <h3 className='sarabun-regular'
                                        style={{ fontSize: '18px', display: 'flex', marginLeft: '15%', color: 'rgb(20, 90, 50)' }}
                                    >
                                        Instructions
                                    </h3>
                                    <h4
                                        style={{ display: 'flex', marginLeft: '15%' }}
                                    >
                                        Structure your file to assign a column to each of the values below.
                                    </h4>
                                    <ul>
                                        <li>SKU</li>
                                        <li>Item Description</li>
                                        <li>Manufacturer Part #</li>
                                        <li>Item Manufacturer</li>
                                        <li>Alt Item ID (SKU)</li>
                                        <li>Org. Local Part Number</li>
                                        <li>All in one Point-Of-Use (POU), or Area</li>
                                        <li>Demand Quantity</li>
                                        <li>Demand Time-Window</li>
                                        <li>Security Level</li>
                                    </ul>
                                </div>
                                <hr className='modal-line'></hr>
                                <div style={{ display: "flex", justifyContent: "center", padding: "3%" }}>
                                    <button type='button'
                                        style={{
                                            backgroundColor: "rgb(68, 167, 110)",
                                            justifyContent: "center", width: "24.7%", marginRight: "10%"
                                        }}
                                        onClick={handleSubmit}
                                    >
                                        Import
                                    </button>
                                    <button type='button' onClick={toggleModal}
                                        style={{ width: "24.7%" }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='display-box'>
                    {excelData.length > 0 && (
                        <div className="scrollable-container">
                            <table>
                                <tbody>
                                    {excelData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
