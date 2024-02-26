const ExcelJS = require('exceljs'); // Import exceljs
const db = require('../config/DatabaseConnection');

exports.itemVendibility = async function (req, res) {
    
    const { sessionId, itemId } = req.query;

    console.log("Request data: " + req.query)
    console.log(`Received a new request for item: ${itemId} and session: ${sessionId}`);

    // Send back a response
    res.status(200).json({ message: `Received request for item: ${itemId} and session: ${sessionId}` });
}
