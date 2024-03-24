import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExportToExcel from './ExportToExcel';
import './TableDisplay.css';

const TableDisplay = ({ solutionId, excelData, isExcelUploaded }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionID] = useState();
    const [sessionIDs, setSessionIDs] = useState([]);
    const [completedItems, setCompletedItems] = useState([[]]);
    const [uncompletedItems, setUncompletedItems] = useState([[]]);
    useEffect(() => {
        const fetchSessionIDs = async () => {
            try {
                const response = await axios.get('http://localhost:5001/getSessionIDs');
                console.log("Response:", response.data._ids);
                if (Array.isArray(response.data._ids)) {
                    setSessionIDs(response.data._ids);
                } else {
                    console.error("Invalid response format: expected an array");
                }

                if (Array.isArray(response.data.completedItems)) {
                    setCompletedItems(response.data.completedItems);
                } else {
                    console.error("Invalid response format: expected an array");
                }

                if (Array.isArray(response.data.uncompletedItems)) {
                    setUncompletedItems(response.data.uncompletedItems);
                } else {
                    console.error("Invalid response format: expected an array");
                }
            } catch (error) {
                console.error("Error fetching session IDs:", error);
                throw error;
            }
        };

        fetchSessionIDs(); // Call the async function
    }, []);

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');
        if (uploadedExcel) {
            const parsedExcelData = JSON.parse(uploadedExcel);
            setFilteredData(parsedExcelData);
        } else if (excelData) {
            setFilteredData(excelData);
        }

        const id = localStorage.getItem('solutionId');

        if (solutionId) {
            setSessionID(solutionId);
        } else if (id) {
            setSessionID(id);
        }
    }, [solutionId]);

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

        // Update selectedRows to only contain valid indices after filtering
        setSelectedRows(selectedRows.filter(rowIndex => rowIndex < filtered.length));
    };

    // Function to handle search input change
    const handleSearchInputChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        filterData(query);
    };

    //Initicates vendibility request for each item currently selected on the table. 
    const handleVendibiilityRequest = async () => {
        let updatedData = [...filteredData];
        //Cycle through each row (item) and request the backend for vendibility. 
        for (const rowIndex of selectedRows) {
            console.log(`Session: ${sessionId} \n ItemId: ${filteredData[rowIndex][4]}`);
            try {
                const response = await axios.get('http://localhost:5001/itemVendibility', {
                    params: {
                        sessionId: sessionId,
                        itemId: filteredData[rowIndex][4]
                    }
                })
                const item = response.data;

                // Check if 'item' is not null or undefined
                if (item) {

                    console.log(item);
                    //Update rows with information
                    // If the value from the response is null or undefined, updatedData is filled with the original updatedData index
                    updatedData[rowIndex][0] = item.sku || updatedData[rowIndex][0];
                    updatedData[rowIndex][1] = item.item_description || updatedData[rowIndex][1];
                    updatedData[rowIndex][2] = item.manufacturer_part_num || updatedData[rowIndex][2];
                    updatedData[rowIndex][3] = item.item_manufacturer || updatedData[rowIndex][3];
                    updatedData[rowIndex][4] = item._id || updatedData[rowIndex][4];
                    updatedData[rowIndex][5] = item.org_local_part_number || updatedData[rowIndex][5];
                    updatedData[rowIndex][6] = item.point_of_use || updatedData[rowIndex][6];
                    updatedData[rowIndex][7] = item.demand_quantity || updatedData[rowIndex][7];
                    updatedData[rowIndex][8] = item.demand_time_window || updatedData[rowIndex][8];
                    updatedData[rowIndex][9] = item.security_level || updatedData[rowIndex][9];
                    updatedData[rowIndex][10] = item.overall_vendability || updatedData[rowIndex][10];
                    updatedData[rowIndex][11] = item.vendability_notes || updatedData[rowIndex][11];
                    updatedData[rowIndex][12] = item.item_cost || updatedData[rowIndex][12];
                    updatedData[rowIndex][13] = item.expected_gross_profit_margin || updatedData[rowIndex][13];
                    updatedData[rowIndex][14] = item.height_inch || updatedData[rowIndex][14];
                    updatedData[rowIndex][15] = item.width_inch || updatedData[rowIndex][15];
                    updatedData[rowIndex][16] = item.length_inch || updatedData[rowIndex][16];
                    updatedData[rowIndex][17] = item.weight_lbs || updatedData[rowIndex][17];
                    updatedData[rowIndex][18] = item.heavy || updatedData[rowIndex][18];
                    updatedData[rowIndex][19] = item.fragile || updatedData[rowIndex][19];
                    updatedData[rowIndex][20] = item.default_issue_type || updatedData[rowIndex][20];
                    updatedData[rowIndex][21] = item.default_issue_qty || updatedData[rowIndex][21];
                    updatedData[rowIndex][22] = item.stackable || updatedData[rowIndex][22];
                    updatedData[rowIndex][23] = item.loose || updatedData[rowIndex][23];
                    updatedData[rowIndex][24] = item.store_vertically || updatedData[rowIndex][24];
                    updatedData[rowIndex][25] = item.preferred_machine_type || updatedData[rowIndex][25];
                    updatedData[rowIndex][26] = item.locker_vendability.locker_vendable || updatedData[rowIndex][26];
                    updatedData[rowIndex][27] = item.locker_vendability.num_compartments_per_locker_door || updatedData[rowIndex][27];
                    updatedData[rowIndex][28] = item.locker_vendability.capacity_for_express_locker || updatedData[rowIndex][28];
                    updatedData[rowIndex][29] = item.locker_vendability.capacity_for_prostock_locker || updatedData[rowIndex][29];
                    updatedData[rowIndex][30] = item.locker_vendability.capacity_for_prolock_locker || updatedData[rowIndex][30];
                    updatedData[rowIndex][31] = item.carousel_vendability.carousel_vendable || updatedData[rowIndex][31];
                    updatedData[rowIndex][32] = item.carousel_vendability.needs_repack_for_carousel || updatedData[rowIndex][32];
                    updatedData[rowIndex][33] = item.carousel_vendability.num_slots_per_item || updatedData[rowIndex][33];
                    updatedData[rowIndex][34] = item.coil_vendability.coil_vendable ? 'Y' : 'N' || updatedData[rowIndex][34];
                    updatedData[rowIndex][35] = item.coil_vendability.needs_repack_for_coil || updatedData[rowIndex][35];
                    updatedData[rowIndex][36] = item.coil_vendability.coil_pitch || updatedData[rowIndex][36];
                    updatedData[rowIndex][37] = item.coil_vendability.coil_type || updatedData[rowIndex][37];
                    updatedData[rowIndex][38] = item.coil_vendability.preferred_shelf || updatedData[rowIndex][38];
                    updatedData[rowIndex][39] = item.coil_vendability.preferred_row || updatedData[rowIndex][39];
                    updatedData[rowIndex][40] = item.coil_vendability.riser_required || updatedData[rowIndex][40];
                    updatedData[rowIndex][41] = item.coil_vendability.flip_bar_required || updatedData[rowIndex][41];
                    updatedData[rowIndex][42] = item.coil_vendability.coil_end_clock_position || updatedData[rowIndex][42];
                    updatedData[rowIndex][43] = item.repacking_instructions_pdf_file_url || updatedData[rowIndex][43];
                    updatedData[rowIndex][44] = item.item_image_url || updatedData[rowIndex][44];
                    updatedData[rowIndex][45] = item.repacked_image_url || updatedData[rowIndex][45];
                } else {
                    console.error('Received null or undefined response for item');
                    alert('Received null or undefined response for item');
                }
                console.log(updatedData[rowIndex]);
            } catch (error) {
                console.error('Error requesting Vendibility', error);
                alert('Error requesting Vendibility');
            }
        }
        setFilteredData(updatedData);
        localStorage.setItem('uploadedExcel', JSON.stringify(updatedData));
    }

    return (
        <div>
            <div className="fixed left-4 top-36 p-4">


                {isExcelUploaded &&
                    <div>
                        Session ID: {sessionId}
                        <ExportToExcel excelData={filteredData} selectedRows={selectedRows} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-4 text-xs border border-gray-400 rounded-md bg-gray-200 w-80 text-left"
                            placeholder-class="text-gray-400 font-bold text-xl"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
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
                {filteredData.length > 0 ? (
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
                                                        {cell !== undefined && cell !== null ? String(cell) : ''}
                                                    </Link>
                                                ) : (
                                                    cell !== undefined && cell !== null ? String(cell) : ''
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='display-box'>
                        <div>
                            <table style={{
                                position: "fixed", width:"auto",
                                left:"50%", transform: "translateX(-50%)",
                                border: "1px solid #ccc",
                                "margin-top": "20px",
                                "box-shadow": "0 2px 10px #787878"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th>Session IDs</th>
                                        <th>Completed Items</th>
                                        <th>Uncompleted Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionIDs.map((sessionId, index) => (
                                        <tr key={index}>
                                            <td>{sessionId}</td>
                                            <td>{completedItems[index] ? completedItems[index].length : 0}</td>
                                            <td>{uncompletedItems[index] ? uncompletedItems[index].length : 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {selectedRows.length > 0 &&
                    <button className='vendibility-button' onClick={handleVendibiilityRequest}> Calculate Vendibility for {selectedRows.length} Item(s) </button>
                }
            </div>
        </div>
    );
}

export default TableDisplay;