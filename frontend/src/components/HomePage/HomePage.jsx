import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './HomePage.css'; // Assuming you have HomePage.css in the same directory
import Header from '../Header/Header';

const HomePage = () => {
    const [file, setFile] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [a1test, seta1] = useState(null);
    const [isExcelUploaded, setIsExcelUploaded] = useState(false);

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');
        if (uploadedExcel) {
            setExcelData(JSON.parse(uploadedExcel));
            setIsExcelUploaded(true);
        }
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

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
            seta1(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file to backend server.');
        }
    };

    const handleFormSubmit = async (e) => {

    }

    const toggleModal = async (e) => {
        var modal = document.getElementById("generateSolution");
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    }

    const handleFileInputChange = async (e) => {

    }

    return (
        <div>
            <Header />
            <div>
                <h2 className='work-dashboard'>Work Dashboard</h2>
                <button className='button generate-new-solution' onClick={toggleModal}>+ Generate New Solution</button>
                <div className="search-container">
                    <input type="text" placeholder="Search..." />
                </div>
                <br />
                <br />


                {/* Modal */}
                <div id="generateSolution" className='modal-filter'>
                    <div className='modal-container'>
                        <div className='modal-content'>
                            <span className='close' onClick={toggleModal}>&times;</span>
                            <h2 className='poppins-regular' style={{ color: 'rgb(68, 167, 110)' }}>Import New Items</h2>
                            <hr className='modal-line'></hr>
                            <div className='modal-form'>
                                <form onSubmit={handleSubmit}>
                                    <h3 className='sarabun-regular'
                                        style={{ fontSize: '18px', display: 'flex', marginLeft: '15%', color: 'rgb(20, 90, 50)' }}
                                    >
                                        Upload
                                    </h3>
                                    <div className='upload-file'>
                                        <label htmlFor="fileInput" className="upload-label">
                                            Click or drag a file here to upload
                                        </label>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            onChange={handleFileInputChange}
                                            accept=".xlsx, .xls"
                                            className="file-input"
                                        />
                                    </div>

                                    <div className='header-container'>
                                        <div className='input-container'>
                                            <h3 className='sarabun-regular'
                                                style={{ fontSize: '18px', color: 'rgb(20, 90, 50)' }}
                                            >
                                                Solution Name
                                            </h3>
                                            <input type="text" placeholder="..." />
                                        </div>
                                        <div className='input-container'>
                                            <h3 className='sarabun-regular'
                                                style={{ fontSize: '18px', color: 'rgb(20, 90, 50)' }}
                                            >
                                                Area Type
                                            </h3>
                                            <input type="text" placeholder="..." />
                                        </div>
                                    </div>

                                    <br />
                                    <h3 className='dark-green-text'>Instructions</h3>
                                </form>
                            </div>
                            <hr className='modal-line'></hr>
                        </div>
                    </div>
                </div>
                {/* <div className='display-box'>
                    {/* <form onSubmit={handleFormSubmit} encType="multipart/form-data">
                        <input type="file" name="excelFile" accept=".xlsx" required onChange={handleFileChange} />
                        <button type="submit">Upload</button>
                    </form>
                    {a1test &&
                        (
                            <p>Backend says A1 is {a1test}</p>
                        )}

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
                    {isExcelUploaded && (   // Conditional rendering to allow for further things to render once excel is uploaded
                        <div>
                            <p>Excel is uploaded</p>
                        </div>
                    )}
                </div> */}
            </div>
        </div>
    );
};

export default HomePage;
