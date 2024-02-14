import React, { useState } from 'react';
import axios from 'axios';

const HomePage = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const response = await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(`File uploaded. Content of A1: ${response.data}`);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file to backend server.');
        }
    };
    return (
    <div>
        <h1>Upload Excel Sheet to display A1's contents</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input type="file" name="excelFile" accept=".xlsx" required onChange={handleFileChange} />
            <button type="submit">Upload</button>
        </form>
    </div>
    )
}

export default HomePage