import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import axios from 'axios';
import ExportToExcel from './ExportToExcel';
import './TableDisplay.css';
import ItemDetails from '../ItemDetails/ItemDetails';
import SessionIDs from '../SessionIDs/SessionIDs';

const TableDisplay = ({ solutionId, excelData, isExcelUploaded, onExcelUpload, setIsExcelUploaded }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionID, setSessionID] = useState();
    const [chosenSessionID, setChosenSessionID] = useState();
    const [isSessionIDChosen, setIsSessionIDChosen] = useState(false);
    const [completedItems, setCompletedItems] = useState([]);

    // Selected Item Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowData, setRowData] = useState(null);
    const [columnHeaders, setColumnHeaders] = useState(null);

    const openModal = (row) => {
        setRowData(row);
        setColumnHeaders(filteredData[0]); // Assuming this is how you determine column headers
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (chosenSessionID || chosenSessionID == 0) {
            console.log("test");
            fetchTableFromSessionID(chosenSessionID);
        }
    }, [chosenSessionID]);

    const fetchTableFromSessionID = async (sessionID) => {
        try {
            const response = await axios.get('/api/getTableFromSessionID', {
                params: {
                    sessionID: sessionID
                }
            });
            const sessionData = response.data.items;

            const workbook = new ExcelJS.Workbook(); // Create a new Excel workbook
            const worksheet = workbook.addWorksheet('Data'); // Add a worksheet to the workbook



            const headers = [
                'SKU(Item Number)*', 'Item Description*', 'Manufacturer Part #', 'Item Manufacturer', 'Alt Item ID (SKU)',
                'Org. Local Part Number', 'All in one Point-Of-Use (POU), or Area', 'Demand Quantity *', 'Demand Time-Window*',
                'Security Level', 'Overall vendability Y/N', 'Vendability Notes', '$ Item Cost', '% Expected Gross Profit Mafgin',
                'Height* inch', 'Width* inch', 'Length* inch', 'Weight* lbl', 'Heavy', 'Fragile', 'Default Issue Type (Unit)*',
                'Default Issue Qty (inside pk, bx, or cs)*', 'Stackable', 'Loose', 'Store vertically', 'Preferred Machine Type',
                'Locker vendable   Y/N', '# of Compartments per Locker Door (6 MAX)', 'Capacity for Express Locker',
                'Capacity for ProStock Locker', 'Capacity for ProLock Locker', 'Carousel vendable Y/N', 'Needs repack for carousel  Y/N',
                '# of Slots per Item (Max 10, Flex 14)', 'Coil vendable Y/N', 'Needs repack for coil Y/N', 'Coil Pitch / Number of Items per Coil Row',
                'Coil Type (SINGLE, V-CHANNEL, DUAL, LARGE)', 'Preferred Shelf (Any/Bottom)', 'Preferred Row (Side/Middle/Any)',
                'Riser Required', 'Flip Bar Required', 'Coil end “clock” position - 3, 6, 9, or 12 (Default is 6)',
                'Repacking Instructions PDF file url', 'Item Image URL', 'Repacked Image Url'
            ];


            // Add column headers to the worksheet
            worksheet.addRow(headers);

            // Add data rows to the worksheet and array
            const data = [headers]; // Start with headers as the first row
            sessionData.slice(0).forEach(item => {
                const rowData = [
                    item.sku,
                    item.item_description,
                    item.manufacturer_part_num,
                    item.item_manufacturer,
                    item._id,
                    item.org_local_part_number,
                    item.point_of_use,
                    item.demand_quantity,
                    item.demand_time_window,
                    item.security_level,
                    item.overall_vendability,
                    item.vendability_notes,
                    item.item_cost,
                    item.expected_gross_profit_margin,
                    item.height_inch,
                    item.width_inch,
                    item.length_inch,
                    item.weight_lbs,
                    item.heavy,
                    item.fragile,
                    item.default_issue_type,
                    item.default_issue_qty,
                    item.stackable,
                    item.loose,
                    item.store_vertically,
                    item.preferred_machine_type,
                    item.locker_vendability.locker_vendable,
                    item.locker_vendability.num_compartments_per_locker_door,
                    item.locker_vendability.capacity_for_express_locker,
                    item.locker_vendability.capacity_for_prostock_locker,
                    item.locker_vendability.capacity_for_prolock_locker,
                    item.carousel_vendability.carousel_vendable,
                    item.carousel_vendability.needs_repack_for_carousel,
                    item.carousel_vendability.num_slots_per_item,
                    item.coil_vendability.coil_vendable,
                    item.coil_vendability.needs_repack_for_coil,
                    item.coil_vendability.coil_pitch,
                    item.coil_vendability.coil_type,
                    item.coil_vendability.preferred_shelf,
                    item.coil_vendability.preferred_row,
                    item.coil_vendability.riser_required,
                    item.coil_vendability.flip_bar_required,
                    item.coil_vendability.coil_end_clock_position,
                    item.repacking_instructions_pdf_file_url,
                    item.item_image_url,
                    item.repacked_image_url
                ];
                worksheet.addRow(rowData);
                data.push(rowData);
            });

            onExcelUpload(data, 'Session ' + sessionID, sessionID)

            localStorage.setItem('uploadedExcel', JSON.stringify(data));
            setFilteredData(data);
            setIsSessionIDChosen(true);
        } catch (error) {
            console.error('Error fetching table from sessionID', error);
        }
    };

    useEffect(() => {
        const uploadedExcel = localStorage.getItem('uploadedExcel');

        if (uploadedExcel) {
            const parsedExcelData = JSON.parse(uploadedExcel);
            setFilteredData(parsedExcelData);
            setIsExcelUploaded(true);
        } else {
            setIsExcelUploaded(false);
        }

        const sessionID = localStorage.getItem('solutionId');
        const chosenSessionID = localStorage.getItem('chosenSessionID');

        if (sessionID || chosenSessionID) {
            setSessionID(sessionID);
            setIsSessionIDChosen(true);
        } else if (chosenSessionID) {
            setChosenSessionID(chosenSessionID);
            setIsSessionIDChosen(true);
        } else {
            setIsSessionIDChosen(false);
        }
    }, []);

    useEffect(() => {
        // Check if completedItems exists in local storage
        const storedCompletedItems = localStorage.getItem('completedItems');
        if (storedCompletedItems) {
            setCompletedItems(JSON.parse(storedCompletedItems));
        }
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

    const toggleFilter = async (e) => {
        var form = document.getElementById("filterChoices");
        if (form) {
            form.style.display = form.style.display === "block" ? "none" : "block";
        }
    }

    const toggleCollapsible = async (options) => {
        var content = document.getElementById(options);
        if (content) {
            content.style.display = content.style.display === "block" ? "none" : "block";
        }
    }

    const clearFilters = async (e) => {

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

    // Initicates vendibility request for each item currently selected on the table. 
    const handleVendibiilityRequest = async () => {
        setIsLoading(true);
        let updatedData = [...filteredData.map(row => [...row])];
        //Cycle through each row (item) and request the backend for vendibility. 
        for (const rowIndex of selectedRows) {
            console.log(`Session: ${sessionID} \n ItemId: ${filteredData[rowIndex][4]}`);
            try {
                const response = await axios.get('/api/itemVendibility', {
                    params: {
                        sessionId: sessionID,
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
                    updatedData[rowIndex][26] = item.locker_vendability.locker_vendable ? 'Y' : 'N' || updatedData[rowIndex][26];
                    updatedData[rowIndex][27] = item.locker_vendability.num_compartments_per_locker_door || updatedData[rowIndex][27];
                    updatedData[rowIndex][28] = item.locker_vendability.capacity_for_express_locker || updatedData[rowIndex][28];
                    updatedData[rowIndex][29] = item.locker_vendability.capacity_for_prostock_locker || updatedData[rowIndex][29];
                    updatedData[rowIndex][30] = item.locker_vendability.capacity_for_prolock_locker || updatedData[rowIndex][30];
                    updatedData[rowIndex][31] = item.carousel_vendability.carousel_vendable ? 'Y' : 'N' || updatedData[rowIndex][31];
                    updatedData[rowIndex][32] = item.carousel_vendability.needs_repack_for_carousel || updatedData[rowIndex][32];
                    updatedData[rowIndex][33] = item.carousel_vendability.num_slots_per_item || updatedData[rowIndex][33];
                    updatedData[rowIndex][34] = item.coil_vendability.coil_vendable || updatedData[rowIndex][34];
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
        setIsLoading(false);
    }

    // Handles the choice of sessionID in the SessionIDs component
    const handleChosenSessionID = (chosenSessionID) => {
        console.log("test");
        localStorage.setItem('chosenSessionID', chosenSessionID);
        localStorage.setItem('solutionId', chosenSessionID);
        localStorage.setItem('isSessionIDChosen', true);
        setIsSessionIDChosen(true);
        setChosenSessionID(chosenSessionID);
        setSessionID(chosenSessionID);
    }

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            const allRowIndices = filteredData.map((_, index) => index).slice(1);
            setSelectedRows(allRowIndices);
        }
        setSelectAll(!selectAll);
    };

    const displaySessionIDList = () => {
        localStorage.removeItem('uploadedExcel');
        localStorage.removeItem('chosenSessionID');
        localStorage.removeItem('solutionId');
        localStorage.removeItem('isSessionIDChosen');
        onExcelUpload(null, '', ''); // Update isExcelUploaded state variable
        setIsSessionIDChosen(false);
        setFilteredData([]);
        setChosenSessionID(null);

        console.log(isSessionIDChosen);
        console.log(isExcelUploaded);
        console.log(filteredData);
    }

    if (isModalOpen) {
        return (
            <div>
                <ItemDetails
                    rowData={rowData}
                    columnHeaders={columnHeaders}
                    onClose={closeModal}
                    fetchTableFromSessionID={fetchTableFromSessionID}
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full' style={{ paddingTop: '100px' }}>
            {isExcelUploaded &&
                <div className='flex flex-col w-full'>
                    <div>
                        <div className='flex flex-row items-start p-2' style={{ paddingTop: '20px' }}>
                            <button onClick={() => displaySessionIDList()}>Session ID List</button>
                            <h1 className='self-center ml-10'>
                            </h1>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="px-4 text-xs border border-gray-400 rounded-md bg-gray-200 lg:w-80 md:w-64 sm:w-40 text-left"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                        <br />
                        <div className='ml-2'>
                            <div className='flex flex-row items-start justify-between'>
                                <div className="flex">
                                    <button onClick={toggleSelectAll} className="ml-2 w-[120px] max-h-[100%] lg:text-[15px] md:text-[14px] sm:text-[12px]">
                                        {selectAll ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <button className='top-44 ml-2 lg:text-[16px] md:text-[14px] sm:text-[12px]' onClick={toggleFilter}>Filters</button>
                                </div>
                                <div className='flex self-center ml-8'>
                                        <div style={{ width: "45px", height: "25px", backgroundColor: "#44A76E" }} />
                                        <h1 className='ml-1 text-[10px]'>in Alt Item ID cell indicates completed vendibility generation</h1>
                                </div>
                                <div className='flex flex-row truncate w-[100%] ml-[12.6%]' style={{ justifyContent: 'flex-end' }}>
                                    {selectedRows.length > 0 && (
                                        <button
                                            className='vendibility-button flex max-h-[70%] mt-1 items-center bg-[#44A76E]'
                                            onClick={handleVendibiilityRequest}
                                            style={{ marginLeft: 'auto', marginRight: '0px' }}>
                                            Calculate Vendibility for {selectedRows.length} Item(s)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isLoading &&
                            <h1>Generating... (May take some time)</h1>
                        }
                    </div>

                </div>
            }
            {isExcelUploaded &&
                <div dir="rtl">
                    <ExportToExcel excelData={filteredData} selectedRows={selectedRows} />
                </div>
            }
            <div className='display-box top-64'>
                {filteredData.length > 0 ? (
                    <div className="scrollable-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        {/* Checkbox to act as Select All/Deselect All - adjusts based on `selectAll` state */}
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAll}
                                            checked={selectAll}
                                        />
                                    </th>
                                    {filteredData[0].map((header, headerIndex) => (
                                        <th key={headerIndex}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex + 1} className={selectedRows.includes(rowIndex + 1) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(rowIndex + 1)}
                                                onChange={() => toggleRow(rowIndex + 1)}
                                            />
                                        </td>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className={cellIndex === 4 && completedItems[localStorage.getItem("solutionId")].includes(cell) ? 'completed-item' : ''}>
                                                {selectedRows.includes(rowIndex + 1) && cellIndex !== 1 && cell === null && isLoading && (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green"></div>
                                                )}
                                                {cellIndex === 1 ? (
                                                    <span style={{ cursor: 'pointer', color: '#666DFA', textDecoration: 'none' }}
                                                        onClick={() => openModal(row)}>
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    cell === true ? 'Y' : cell === false ? 'N' : cell
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <SessionIDs chosenSessionID={handleChosenSessionID} completedItems={completedItems} setCompletedItems={setCompletedItems} />
                )}
            </div>
            <div id="filterChoices" className="filter-overlay">
                <div className='filter-container'>
                    <div className='filter-header'>Filters</div>
                    <div className='filter-subhead'>
                        <div>Vendibility</div>
                        <div>Data Availability</div>

                    </div>

                    <button className='filter-select'>Apply</button>
                    <button className='filter-select' onClick={clearFilters}>Clear All</button>
                    <button className='filter-cancel' onClick={toggleFilter}>Cancel</button>
                </div>
            </div>

        </div>
    );
}

export default TableDisplay;