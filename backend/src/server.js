const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const ExcelJS = require('exceljs'); // Import exceljs
const cors = require('cors'); // Import cors

const app = express();

app.use(cors()); // Enable All CORS Requests

app.post('/upload', upload.single('excelFile'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer); // Load the Excel file from the buffer
    const worksheet = workbook.worksheets[0]; // Get the first worksheet
    const cell = worksheet.getCell('A1'); // Get cell A1
    const value = cell ? cell.value : 'Cell A1 is empty'; // Get the value of cell A1

    res.send(value.toString()); // Send the value as a response
  } catch (error) {
    console.error('Error reading excel file:', error);
    res.status(500).send('Failed to read excel file.');
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));

