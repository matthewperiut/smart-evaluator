const ExcelJS = require('exceljs'); // Import exceljs
const db = require('../config/DatabaseConnection');

exports.uploadSpreadsheet = async function (req, res) {
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(req.file.buffer); // Load the Excel file from the buffer
          const worksheet = workbook.worksheets[0]; // Get the first worksheet
      
          try {
            // Connect to the Database
            await db.client.connect();
      
            //Get Session Counter by querying first item in collection
            const SYSTEM_DATA = await db.client.db("Backend_Database").collection("System_Data").findOne();

            //Create new Session Item 
            const session = {
              _id: SYSTEM_DATA.SESSION_COUNTER,
              completed_items: [],
              uncompleted_items: [],
            }
  
            //Create item object for each row in the spreadsheet
            let counter = 0
            for (let row = 4; row <= 8; row ++) {
              const item = {
                _id: SYSTEM_DATA.ITEM_COUNTER + counter,
                sku: worksheet.getCell(`A${row}`).value,
                item_description: worksheet.getCell(`B${row}`).value,
                manufacturer_part_num: worksheet.getCell(`C${row}`).value,
                session_id: SYSTEM_DATA.SESSION_COUNTER
              }
              //Add item object to database. 
              //await db.newItem(db.client, item);
      
              //Add item to session's uncompleted_items[]
              session.uncompleted_items.push(item._id);
              counter ++;
            }
      
            /*
            //Create new session with session counter 
            await db.client.db("Backend_Database").collection("Session").insertOne(session);
            console.log(`Created New Session With ID: ${session._id}`);
      

            
            //Encrement Session Counter
            const result = await db.client.db("Backend_Database").collection("System_Data").updateOne(
              { NAME: "COUNTER_INFO" },
              { $inc: { SESSION_COUNTER: 1}}
            );
            console.log(`${result.matchedCount} Sessions(s) were found.`);
            console.log(`${result.modifiedCount} Sessions(s) were updated.`);
            */

            //Response must include array of items and the sessionid. 
            res.json(session.uncompleted_items, session._id);
            

          } catch (e) {
              console.error(e);
          } finally {
            // Ensures that the client will close when you finish/error
            await db.client.close();
          }
      
        } catch (error) {
          console.error('Error reading excel file:', error);
          res.status(500).send('Failed to read excel file.');
        }
}