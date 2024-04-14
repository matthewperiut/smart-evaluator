import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './Modal.css';

const Modal = ({ onExcelUpload }) => {
    const [file, setFile] = useState(null);
    const [solutionName, setSolutionName] = useState('');
    const [areaType, setAreaType] = useState('');

    const readExcel = async (file, item_id_list, solutionId) => {
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
                if (isFirstRow) {
                    isFirstRow = false;
                    return; // Skip the first row (It was displaying the first row twice initially)
                }
                const rowData = new Array(maxColumnNumber).fill('');
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if(String(cell.value).length != 0 && cell.value !== null) rowData[colNumber - 1] = cell.value;
                    else rowData[colNumber - 1] = ''; // Ensure empty cells are represented
                });
                //Add itemID to alt item ID collumn
                rowData[4] = rowNumber > 3? item_id_list[rowNumber - 4] : rowData[4];
                rows.push(rowData);
                console.log(rowData);
            });
            onExcelUpload(rows, file.name, solutionId);
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
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });


            //Print to console
            console.log(`New Session Created! \n 
            Session ID: ${response.data._id}
            Item IDs: ${response.data.uncompleted_items}`);

            //const item_id_list = [1000000, 1000002, 1000003, 1000004];

            try {
                readExcel(file, response.data.uncompleted_items, response.data._id);
            }
            catch (error) {
                console.error('Error reading excel document:', error);
            }

            toggleModal();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file to backend server.');
        }
    };

    const toggleModal = async (e) => {
        var modal = document.getElementById("generateSolution");
        if (modal) {
            modal.style.display = modal.style.display === "block" ? "none" : "block";
        }
    }

    const handleFileInputChange = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    }

    return (
        <div style = {{ paddingBottom: '20px' }}>
            <button className=' hidden lg:block bg-green text-black absolute w-60 h-12 right-4 top-20 bottom-20 m-4' onClick={toggleModal}>+ Generate New Solution</button>
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
                                <h3 className='figtree-regular'
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
                                        <h3 className='figtree-regular'
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
                                        <h3 className='figtree-regular'
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
                                <h3 className='figtree-regular'
                                    style={{ fontSize: '18px', display: 'flex', marginLeft: '15%', color: 'rgb(20, 90, 50)' }}
                                >
                                    Instructions
                                </h3>
                                <h4
                                    style={{ display: 'flex', marginLeft: '15%', color: '#213547' }}
                                >
                                    Structure your file to assign a column to each of the values below.
                                </h4>
                                <ul style={{ marginLeft: '15%', color: '#213547' }}>
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
                                <button type='button' onClick={() => {toggleModal(); setFile(null);}}
                                    style={{ width: "24.7%", color: '#213547' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Modal;