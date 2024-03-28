import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';

// This code displays two buttons, 'Export All' and 'Export Selected'
// When clicked, the system exports the results to a .xlsx file
// Author: Cohen Miller

const ExportToExcel = ({excelData, selectedRows}) => {

    const handleExport = (excelData, selectedRows) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('SEMROS_Vendibility_Data');


        //Set the collumns for each item. 
        sheet.columns = [
            { header: 'SKU(Item Number)', key: 'sku', width: 17.5 },
            { header: 'Item Description', key: 'item_description', width: 32 },
            { header: 'Manufacturer Part #', key: 'manufacturer_part_num', width: 20 },
            { header: 'Item Manufacturer', key: 'item_manufacturer', width: 20 },
            { header: 'Alt Item ID (SKU)', key: 'alt_item_id_sku', width: 17.5 },
            { header: 'Org. Local Part Number', key: 'org_local_part_number', width: 20 },
            { header: 'All in one Point-Of-Use (POU), or Area', key: 'point_of_use', width: 25 },
            { header: 'Demand Quantity *', key: 'demand_quantity', width: 20 },
            { header: 'Demand Time-Window*', key: 'demand_time_window', width: 25 },
            { header: 'Security Level', key: 'security_level', width: 17.5 },
            { header: 'Overall vendability Y/N', key: 'overall_vendability', width: 25 },
            { header: 'Vendability Notes', key: 'vendability_notes', width: 25 },
            { header: '$ Item Cost', key: 'item_cost', width: 15 },
            { header: '% Expected Gross Profit Mafgin', key: 'expected_gross_profit_margin', width: 30 },
            { header: 'Height* inch', key: 'height_inch', width: 17.5 },
            { header: 'Width* inch', key: 'width_inch', width: 17.5 },
            { header: 'Length* inch', key: 'length_inch', width: 17.5 },
            { header: 'Weight* lbl', key: 'weight_lbs', width: 17.5 },
            { header: 'Heavy', key: 'heavy', width: 10 },
            { header: 'Fragile', key: 'fragile', width: 10 },
            { header: 'Default Issue Type (Unit)*', key: 'default_issue_type', width: 25 },
            { header: 'Default Issue Qty (inside pk, bx, or cs)*', key: 'default_issue_qty', width: 30 },
            { header: 'Stackable', key: 'stackable', width: 15 },
            { header: 'Loose', key: 'loose', width: 10 },
            { header: 'Store vertically', key: 'store_vertically', width: 20 },
            { header: 'Preferred Machine Type', key: 'preferred_machine_type', width: 25 },
            { header: 'Locker vendable Y/N', key: 'locker_vendability.locker_vendable', width: 25 },
            { header: '# of Compartments per Locker Door (6 MAX)', key: 'locker_vendability.num_compartments_per_locker_door', width: 30 },
            { header: 'Capacity for Express Locker', key: 'locker_vendability.capacity_for_express_locker', width: 25 },
            { header: 'Capacity for ProStock Locker', key: 'locker_vendability.capacity_for_prostock_locker', width: 25 },
            { header: 'Capacity for ProLock Locker', key: 'locker_vendability.capacity_for_prolock_locker', width: 25 },
            { header: 'Carousel vendable Y/N', key: 'carousel_vendability.carousel_vendable', width: 25 },
            { header: 'Needs repack for carousel  Y/N', key: 'carousel_vendability.needs_repack_for_carousel', width: 25 },
            { header: '# of Slots per Item (Max 10, Flex 14)', key: 'carousel_vendability.num_slots_per_item', width: 30 },
            { header: 'Coil vendable Y/N', key: 'coil_vendability.coil_vendable', width: 20 },
            { header: 'Needs repack for coil Y/N', key: 'coil_vendability.needs_repack_for_coil', width: 25 },
            { header: 'Coil Pitch / Number of Items per Coil Row', key: 'coil_vendability.coil_pitch_num_items_per_row', width: 40 },
            { header: 'Coil Type (SINGLE, V-CHANNEL, DUAL, LARGE)', key: 'coil_vendability.coil_type', width: 35 },
            { header: 'Preferred Shelf (Any/Bottom)', key: 'coil_vendability.preferred_shelf', width: 25 },
            { header: 'Preferred Row (Side/Middle/Any)', key: 'coil_vendability.preferred_row', width: 25 },
            { header: 'Riser Required', key: 'coil_vendability.riser_required', width: 20 },
            { header: 'Flip Bar Required', key: 'coil_vendability.flip_bar_required', width: 20 },
            { header: 'Coil end "clock" position – 3, 6, 9, or 12 (Default is 6)', key: 'coil_vendability.coil_end_clock_position', width: 40 },
            { header: 'Riser Required', key: 'riser_required', width: 20 },
            { header: 'Repacking Instructions PDF file url', key: 'repacking_instructions_pdf_file_url', width: 35 },
            { header: 'Item Image URL', key: 'item_image_url', width: 25 },
            { header: 'Repacked Image Url', key: 'repacked_image_url', width: 25 }
        ];

        // Set header cell style for first row
        const row = sheet.getRow(1);
        row.height = 50;
        
        row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };

            if (colNumber <= 6) cell.fill.fgColor = { argb: 'A3C9E0' };
            else if (colNumber <= 26) cell.fill.fgColor = { argb: 'EBBB8F' };
            else if (colNumber <= 31) cell.fill.fgColor = { argb: '91AD7A' };
            else if (colNumber <= 34) cell.fill.fgColor = { argb: 'B6CBA3' };
            else if (colNumber <= 43) cell.fill.fgColor = { argb: 'ACAA8F' };
            else if (colNumber <= 44) cell.fill.fgColor = { argb: 'C9B9E6' };
            else if (colNumber <= 48) cell.fill.fgColor = { argb: 'E5C5AD' };
        });

        // Add data rows 
        if (selectedRows) {
            for (let i in selectedRows) {
                const rowIndex = selectedRows[i];
                console.log(`Adding row with index ${rowIndex}`);
                sheet.addRow(excelData[rowIndex]);
            }
        } else {
            for (let row of excelData) {
                sheet.addRow(row);
            }
        }


        // Generate Excel file
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'SEMROS_Vendibility_Results.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    };
    return (
        <div className='flex flex-row relative top-20'>
            <button className="hidden lg:block top-40 right-44" onClick = {() => {handleExport(excelData)}}>Export All</button>
            <button className="hidden lg:block top-40 right-6" onClick = {() => {handleExport(excelData, selectedRows)}}>Export Selected</button>
        </div>
    );

};

export default ExportToExcel;