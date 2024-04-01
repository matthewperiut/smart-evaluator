const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {getSessionIDs, getItem, uploadSpreadsheet} = require ("./controllers/sessionController")
const {itemVendibility} = require ("./controllers/vendibilityController")
const cors = require('cors'); // Import cors
const app = express();

app.use(cors()); // Enable All CORS Requests

// POST /upload endpoint axcepts excel file, and generates a new session
app.post('/upload', upload.single('excelFile'), uploadSpreadsheet);

// GET /itemVendibility endpoint accepts itemId, sessionID, Calculates and returns vendibility info
app.get('/itemVendibility', itemVendibility);

// GET /getSessionIDs endpoint returns sessionIDs
app.get('/getSessionIDs', getSessionIDs);

// GET /getItem endpoint returns item data if it exists in the session. 
app.get('/getItem', getItem); 

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));

