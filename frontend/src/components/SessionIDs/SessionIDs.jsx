import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SessionIDs = ({ chosenSessionID }) => {
    const [sessionIDs, setSessionIDs] = useState([]);
    const [completedItems, setCompletedItems] = useState([[]]);
    const [uncompletedItems, setUncompletedItems] = useState([[]]);

    useEffect(() => {
        const fetchSessionIDs = async () => {
            try {
                const response = await axios.get('/api/getSessionIDs');
                console.log(response);
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

    const handleSessionIDClick = (sessionId) => {
        chosenSessionID(sessionId);
    }

    return (
        <div className='scrollable-container'>
            {sessionIDs.length > 0 && (
                <table style={{ width: "100%" }}>
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
                                <td>
                                    <button onClick={() => handleSessionIDClick(sessionId)}>
                                        {sessionId}
                                    </button>
                                </td>
                                <td>{completedItems[index] ? completedItems[index].length : 0}</td>
                                <td>{uncompletedItems[index] ? uncompletedItems[index].length : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default SessionIDs