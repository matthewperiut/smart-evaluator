const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {getSessionIDs, getItem, uploadSpreadsheet, addItem, createSession, getTableFromSessionID, updateItem} = require ("./controllers/sessionController")
const {itemVendibility} = require ("./controllers/vendibilityController")
const cors = require('cors'); // Import cors
const app = express();

// Enable All CORS Requests
app.use(cors());

// To parse JSON bodies
app.use(express.json());

// To parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// POST /upload endpoint axcepts excel file, and generates a new session
app.post('/upload', upload.single('excelFile'), uploadSpreadsheet);

// GET /itemVendibility endpoint accepts itemId, sessionID, Calculates and returns vendibility info
app.get('/itemVendibility', itemVendibility);

// GET /getSessionIDs endpoint returns sessionIDs
app.get('/getSessionIDs', getSessionIDs);

// GET /getItem endpoint returns item data if it exists in the session. 
app.get('/getItem', getItem);

// POST /createSession endpoint returns a new session ID
app.post('/createSession', createSession);

// POST /addItem takes a sessionId and item json to add it to the system, may respond with an error
app.post('/addItem', addItem);

// GET /getTableFromSessionID endpoint returns table data based on sessionID
app.get('/getTableFromSessionID', getTableFromSessionID)

// POST /updateItem endpoint updates an existing item in a session
app.post('/updateItem', updateItem);

const PORT = 5001;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));


const {dataCollection} = require("./utils/dataCollection");

async function test() {
        //Sample item for testing
        const item = {
            item_description: `135354 24221 242 REMOVABLE TL 10 ML BO`,
            //sku: "Mar P208";
            manufacturer_part_num: "135354" ,
            height_inch: 0.5,
            width_inch: 0.5,
            length_inch: 0.5,
            //weight_lbs: 0.5,
            //fragile: false,
            default_issue_type: "ea", 
            default_issue_qty: "1"
        };

        try {await dataCollection(item)} 
        catch (error) { console.error("Error during GPT prompt:", error)}

        console.log(item);
}

//test();