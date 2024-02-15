import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './HomePage.css'; // Assuming you have HomePage.css in the same directory

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

    return (
        <div>
            <br/>
            <h1>Upload and Display Excel Sheet</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
        </div>
    );
};

export default HomePage;
