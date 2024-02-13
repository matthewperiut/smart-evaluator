const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const xlsx = require('xlsx');
const cors = require('cors'); // Import cors

const app = express();

app.use(cors()); // Enable All CORS Requests

app.post('/upload', upload.single('excelFile'), (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const cell = worksheet['A1'];
    const value = cell ? cell.v : 'Cell A1 is empty';

    res.send(value);
  } catch (error) {
    console.error('Error reading excel file:', error);
    res.status(500).send('Failed to read excel file.');
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
