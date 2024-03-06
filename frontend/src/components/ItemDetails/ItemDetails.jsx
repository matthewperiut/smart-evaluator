import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
        <div className="max-w-4xl mx-auto px-4 py-12 mt-20">
          {rowData && columnHeaders && (
            <div>
              <h1 className="text-2xl font-poppins text-lg text-green mb-4">{rowData[1]}</h1>
              <Link to="/" className="mb-4 inline-block text-white no-underline">
            <button className="bg-light-green hover:bg-green border-dark-green text-white py-2 px-4 w-24 rounded">
              Return
            </button>
            </Link>
              <ul className="space-y-4">
                {rowData.map((item, index) => (
                  <li key={index} className="border-b border-light-green py-2 flex justify-end">
                    <span className="text-green text-left">{columnHeaders[index]}:</span> 
                     <span className = "ml-auto">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div> 
      )
                }

export default ItemDetails;