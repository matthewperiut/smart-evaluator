const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {uploadSpreadsheet, getTableFromSessionID} = require("./controllers/sessionController")
const {itemVendibility} = require ("./controllers/vendibilityController")
const {getSessionIDs} = require ("./controllers/sessionController")
const cors = require('cors'); // Import cors
const app = express();

app.use(cors()); // Enable All CORS Requests

// POST /upload endpoint axcepts excel file, and generates a new session
app.post('/upload', upload.single('excelFile'), uploadSpreadsheet);

// GET /itemVendibility endpoint accepts itemId, sessionID, Calculates and returns vendibility info
app.get('/itemVendibility', itemVendibility);

// GET /getSessionIDs endpoint returns sessionIDs
app.get('/getSessionIDs', getSessionIDs);

// GET /getTableFromSessionID endpoint returns table data based on sessionID
app.get('/getTableFromSessionID', getTableFromSessionID)

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));

