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

// feel free to delete, just for testing
const {continuous_scrape} = require("./generative/continuous_gpt");

async function test() {
    //for testing
    const item = {
        item_description: "CL110 CHECKLITE CLEAR LENS"
    };

    try {
        // Using the function and sending response back to the client
        let answer = await continuous_scrape(item.item_description,
            "weight_in_lbs",
            "float",
            "weight in lbs, please calculate if only given oz, grams, etc.")
        console.log(answer);
    } catch (error) {
        console.error("Error during GPT prompt:", error);
    }
}

test();