import React from 'react';
import axios from 'axios'; // Only keep this if you're making API calls.
import './ItemDetails.css';
import Header from '../Header/Header';

// Modify the component to accept props, including a close function for the modal
const ItemDetails = ({ rowData, columnHeaders, onClose }) => {
  // Assuming rowData and columnHeaders are directly passed as props now.

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 mt-20">
        {rowData && columnHeaders && (
          <div>
            <h1 className="text-2xl font-poppins text-lg text-green mb-4">{rowData[1]}</h1>
            {/* Replace Link with a button that calls onClose */}
            <button onClick={onClose} className="return-button">
              Return
            </button>
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
  );
};

export default ItemDetails;
