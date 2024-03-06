import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './HomePage.css';
import Header from '../Header/Header';
import VendibilityRequestDemo from './VendibilityRequestDemo'

const HomePage = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [excelData, setExcelData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columnHeaders, setColumnHeaders] = useState([]);
    const [solutionName, setSolutionName] = useState('');
    const [areaType, setAreaType] = useState('');
    const [isExcelUploaded, setIsExcelUploaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');
        setFileName(localStorage.getItem("fileName"));
        if (uploadedExcel) {
            const parsedExcelData = JSON.parse(uploadedExcel);
            setExcelData(parsedExcelData);
            setFilteredData(parsedExcelData);
        }
        if (excelData.length > 0) {
            setColumnHeaders(excelData[0]);
        }
    }, []);

    useEffect(() => {
        if (debouncedSearchQuery === '') {
            setFilteredData(excelData);
        } else {
            filterData(debouncedSearchQuery);
        }
    }, [debouncedSearchQuery, excelData]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 10000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const readExcel = async (file) => {
        try {
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
                setIsLoading(true);
                if (isFirstRow) {
                    isFirstRow = false;
                    return; // Skip the first row (It was displaying the first row twice initially)
                }
                const rowData = new Array(maxColumnNumber).fill('');
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData[colNumber - 1] = cell.value || ''; // Ensure empty cells are represented
                });
                rows.push(rowData);
                setIsLoading(false);
            });
            setExcelData(rows);
            setFileName(file.name);
            setFilteredData(rows);
            localStorage.setItem('uploadedExcel', JSON.stringify(rows));
            localStorage.setItem('fileName', file.name);
        } catch (error) {
            console.error('Error reading excel document:', error);
        }
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
            //Print to DOM
            seta1(`Session ID: ${response.data._id} \n ItemIDs: ${response.data.uncompleted_items}`);

            //Print to console
            console.log(`New Session Created! \n 
            Session ID: ${response.data._id}
            Item IDs: ${response.data.uncompleted_items}`);

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

    const toggleRow = (rowIndex) => {
        if (selectedRows.includes(rowIndex)) {
            setSelectedRows(selectedRows.filter(row => row !== rowIndex));
        }
        else{
            setSelectedRows([...selectedRows, rowIndex]);
        }
    }


    // Function to filter data based on search query
    const filterData = (query) => {
        const filtered = excelData.filter((row, index) => {
            // Always include the first row (headers)
            if (index === 0) return true;
            // Filter rows based on search query
            return row.some((cell) => String(cell).toLowerCase().includes(query));
        });
        // Set filtered data including the first row (headers)
        setFilteredData(filtered.length > 0 ? filtered : excelData);
    };
    
    // Function to handle search input change
    const handleSearchInputChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        filterData(query);
    };

    return (
        <div>
            <Header />
            <div>
                <div>
                {!excelData.length > 0 ? (
                    <h2 className = 'font-poppins text-green text-lg absolute left-4 top-20 md:absolute p-4 rounded-lg'>Work Dashboard</h2>
                ) : (
                    <h2 className='font-poppins text-green text-lg fixed left-4 top-20 md:absolute p-4 rounded-lg'>{fileName}</h2>
                )}
                <button className='button generate-new-solution' onClick={toggleModal}>+ Generate New Solution</button>
                <div className ="fixed left-4 top-36 p-4">
                <input type="text" placeholder="Search..." className="px-4 text-xs border border-gray-400 rounded-md bg-gray-200 w-80 text-left" placeholder-class="text-gray-400 font-bold text-xl"  value={searchQuery} onChange={handleSearchInputChange}/>
                <button className = "hidden md:block fixed top-40 right-44">Export All</button>
                <button className = "hidden md:block fixed top-40 right-6">Export Selected</button>
                {/* <div className="magnify"></div> */}
                <br />
                <br />
                </div>
                
                
                
                {/* Modal */}
                <div id="generateSolution" className='modal-filter'>
                    <div className='modal-container'>
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <div className='modal-content'>
                                <h2 className='poppins-regular'
                                    style={{ 
                                        color: 'rgb(68, 167, 110)',
                                        fontSize: '24px',
                                        margin: '5%'
                                    
                                    }}>
                                    Import New Items
                                </h2>
                                <hr className='modal-line'></hr>
                                <div className='modal-form'>
                                    <h3 className='sarabun-regular'
                                        style={{
                                            fontSize: '18px',
                                            display: 'flex',
                                            marginLeft: '15%',
                                            padding: '2%',
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
                                                <label htmlFor="fileInput" style={{ color: '#213547' }}>
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
                                        style={{ display: 'flex', marginLeft: '15%', color: '#213547'}}
                                    >
                                        Structure your file to assign a column to each of the values below.
                                    </h4>
                                    <ul style={{ marginLeft: '15%', color: '#213547'}}> 
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
                                        style={{ width: "24.7%", color: '#213547' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                {isLoading && (
                        <div className = "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green">
                        </div>
                    )}
                <div className='display-box'>
                    {filteredData.length > 0 && (
                        <div className="scrollable-container">
                            <table>
                                <tbody>
                                    {filteredData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={selectedRows.includes(rowIndex) ? 'selected-row' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(rowIndex)}
                                                    onChange={() => toggleRow(rowIndex)}
                                                    disabled={rowIndex== 0}
                                                    />
                                            </td>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>
                                                    {rowIndex >= 1 && cellIndex === 1 ? (
                                                        <Link
                                                            to={"/itemDetails"}
                                                            state={{ rowData: row, columnHeaders: columnHeaders }}
                                                        >
                                                            {cell}
                                                        </Link>
                                                    ) : (
                                                        cell
                                                    )}
                                                </td>
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
        </div>
    );
};


export default HomePage;
