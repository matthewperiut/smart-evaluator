import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TableDisplay.css';

const TableDisplay = ({ solutionId, excelData, isExcelUploaded }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');
        if (uploadedExcel) {
            const parsedExcelData = JSON.parse(uploadedExcel);
            setFilteredData(parsedExcelData);
        } else if (excelData) {
            setFilteredData(excelData);
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

    const toggleRow = (rowIndex) => {
        if (selectedRows.includes(rowIndex)) {
            setSelectedRows(selectedRows.filter(row => row !== rowIndex));
        }
        else {
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

            <div className="fixed left-4 top-36 p-4">
            <h2>SolutionID = {solutionId}</h2>
                <input type="text" placeholder="Search..." className="px-4 text-xs border border-gray-400 rounded-md bg-gray-200 w-80 text-left" placeholder-class="text-gray-400 font-bold text-xl" value={searchQuery} onChange={handleSearchInputChange} />
                {isExcelUploaded &&
                    <div>
                        <button className="hidden lg:block fixed top-40 right-44">Export All</button>
                        <button className="hidden lg:block fixed top-40 right-6">Export Selected</button>
                    </div>
                }
                <br />
                <br />
            </div>
            {isLoading && (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green">
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
                                                disabled={rowIndex == 0}
                                            />
                                        </td>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex}>
                                                {rowIndex >= 1 && cellIndex === 1 ? (
                                                    <Link
                                                        to={"/itemDetails"}
                                                        state={{ rowData: row, columnHeaders: excelData[0] }}
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
    );
}

export default TableDisplay;