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

    let value = 'All cells from A1 to A5 are empty'; // Default message if all cells are empty

    // Loop from A1 to A5
    for (let row = 1; row <= 5; row++) {
      const cell = worksheet.getCell(`A${row}`); // Get cell at current row in column A
      if (cell && cell.value !== null && cell.value !== undefined) {
        // If the cell is not empty, update the value and break out of the loop
        value = cell.value;
        break;
      }
    }

    // Ensure we have a string to send as a response
    res.send(value.toString());
  } catch (error) {
    console.error('Error reading excel file:', error);
    res.status(500).send('Failed to read excel file.');
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));

