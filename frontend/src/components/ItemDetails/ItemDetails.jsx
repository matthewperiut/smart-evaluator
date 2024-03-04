import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './ItemDetails.css';
import Header from '../Header/Header';

const ItemDetails = () => {
    const location = useLocation();
    console.log('Location:', location);
    const rowData = location.state ? location.state.rowData : null;
    const columnHeaders = location.state ? location.state.columnHeaders : null;

    return (
        <div>
            <Header />
            <div className='display-box'>
                {rowData && columnHeaders && (
                    <div className='scrollable-container'>
                    <table>
                        <tbody>
                            <tr>
                                {columnHeaders.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                            <tr>
                                {rowData.map((item, index) => (
                                    <td key={index}>{item}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemDetails;