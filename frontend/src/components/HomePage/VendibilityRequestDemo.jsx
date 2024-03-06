import React, { useState, useEffect } from 'react';
import axios from 'axios';

/* 
* This component is just a simple demo to demonstrate the use of the backend GET itemVendibility
* endpoint. Note how the results are displayed
* Author: Cohen Miller 
*/

const VendibilityRequestDemo = () => {
    const [itemId, setItemId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [responseData, setResponseData] = useState(null);

     //GET Request for ITEM Vendibility and returns item object
     const requestItem = async (e) => {
        e.preventDefault();
        console.log( typeof sessionId , typeof itemId);
        try {
            const response = await axios.get('http://localhost:5001/itemVendibility', {
                params: {
                    sessionId: sessionId,
                    itemId: itemId
                }
            })
            .then( function (response) {
                console.log(response)
                setResponseData(response.data)
            });
        } catch (error) {
            console.error('Error requesting item information', error);
            alert('Error requesting item information');
        }
    }

    return (
        <div  style={{ border: '2px solid white', borderRadius: '10px', padding: '20px' }}>
            {/* Sample Form to enter item info to request vendibility*/}
            <h3> Vendibility Request Demo </h3>
            <form onSubmit = {requestItem} encType=  "multipart/form-data">
            <h4>Enter SessionID </h4>
            <input type = "text" value = {sessionId} name = "sessionId" onChange = {(e) => { setSessionId(e.target.value)}}/>
            <h4>Enter ItemID</h4>
            <input type = "text" value = {itemId} name = "itemId" onChange = {(e) => { setItemId(e.target.value)}}/>
            <br></br>
            <br></br>
            <button type="submit"> Request Vendibility </button>
            </form>

           {/* Display response data */}
           {responseData && (
                    <div>
                        <h3>Response Data</h3>
                        <p>{JSON.stringify(responseData)}</p> {/* Render as JSON*/}
                        {/*Render Individual Values */}
                        Item ID: {responseData._id} <br></br> 
                        Item Description: {responseData.item_description} <br></br>
                        Manufacturer Part Number: {responseData.manufacturer_part_num} <br></br>
                    </div>
                )}
        </div>
    );
};

export default VendibilityRequestDemo;