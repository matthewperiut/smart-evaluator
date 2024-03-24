import './HomePage.css';
import Header from '../Header/Header';
import TableDisplay from '../TableDisplay/TableDisplay';
import Modal from '../Modal/Modal';
import axios from 'axios';
import { useEffect, useState } from 'react';

const HomePage = ({ excelData, solutionId, isExcelUploaded, onExcelUpload, fileName }) => {
    const [sessionIDs, setSessionIDs] = useState([]);
    useEffect(() => {
        const fetchSessionIDs = async () => {
            try {
                const response = await axios.get('http://localhost:5001/getSessionIDs');
                setSessionIDs(response.data);
            } catch (error) {
                console.error("Error fetching session IDs:", error);
                throw error;
            }
        };

        fetchSessionIDs(); // Call the async function
    }, []);

    return (
        <div>
            <Header />
            <div>
                <div>
                    {!isExcelUploaded ? (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg text-sm md:text-lg'>Work Dashboard</h2>
                    ) : (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg text-sm md:text-lg'>{fileName}</h2>
                    )}
                    <Modal onExcelUpload={onExcelUpload} />
                    <TableDisplay excelData={excelData} solutionId={solutionId} isExcelUploaded={isExcelUploaded} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;