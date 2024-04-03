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
            for (let row = 4; row <= worksheet.rowCount; row ++) {
              const item = {
                sku: worksheet.getCell(`A${row}`).value,
                item_description: worksheet.getCell(`B${row}`).value,
                manufacturer_part_num: worksheet.getCell(`C${row}`).value,
                point_of_use: worksheet.getCell(`G${row}`).value,
                overall_vendability: worksheet.getCell(`K${row}`).value,
                vendability_notes: worksheet.getCell(`L${row}`).value,
                height_inch: worksheet.getCell(`O${row}`).value, 
                width_inch: worksheet.getCell(`P${row}`).value, 
                length_inch: worksheet.getCell(`Q${row}`).value, 
                weight_lbs: worksheet.getCell(`R${row}`).value, 
                heavy: worksheet.getCell(`S${row}`).value, 
                fragile: worksheet.getCell(`T${row}`).value, 
                default_issue_type: worksheet.getCell(`U${row}`).value, 
                default_issue_qty: worksheet.getCell(`V${row}`).value, 
                stackable: worksheet.getCell(`W${row}`).value, 
                loose: worksheet.getCell(`X${row}`).value, 
                store_vertically: worksheet.getCell(`Y${row}`).value, 
                preferred_machine_type: worksheet.getCell(`Z${row}`).value, 
                locker_vendability: {
                  locker_vendable: worksheet.getCell(`AA${row}`).value, 
                  num_compartments_per_locker_door: worksheet.getCell(`AB${row}`).value, 
                  capacity_for_express_locker: worksheet.getCell(`AC${row}`).value, 
                  capacity_for_prostock_locker: worksheet.getCell(`AD${row}`).value, 
                  capacity_for_prolock_locker: worksheet.getCell(`AE${row}`).value, 
                },
                carousel_vendability: {
                  carousel_vendable: worksheet.getCell(`AF${row}`).value, 
                  needs_repack_for_carousel: worksheet.getCell(`AG${row}`).value, 
                  num_slots_per_item: worksheet.getCell(`AH${row}`).value, 
                },
                coil_vendability: {
                  coil_vendable: worksheet.getCell(`AI${row}`).value, 
                  needs_repack_for_coil: worksheet.getCell(`AJ${row}`).value, 
                  coil_pitch: null, //Added this to separate coil pitch from coil capacity
                  coil_capacity: null, //Added this to represent actual capacity of an entire coil, factoring in weight.
                  seven_shelf_compatable: null, //Added this to indicate if the item is vendable on the seven shelf toolbox, which has a smaller max height.           
                  coil_type: worksheet.getCell(`AL${row}`).value, 
                  preferred_shelf: worksheet.getCell(`AM${row}`).value, 
                  preferred_row: worksheet.getCell(`AN${row}`).value, 
                  riser_required: worksheet.getCell(`AO${row}`).value, 
                  flip_bar_required: worksheet.getCell(`AP${row}`).value, 
                  coil_end_clock_position: worksheet.getCell(`AQ${row}`).value, 
                }
              }

        //Add item object to database. 
        const result = await db.newItem(db.client, item);

        //Add item to session's uncompleted_items[]
        session.uncompleted_items.push(result._id);
      }

      //Create new session with session counter 
      await db.client.db("Backend_Database").collection("Session").insertOne(session);
      console.log(`Created New Session With ID: ${session._id}`);


      //Encrement Session Counter
      const result = await db.client.db("Backend_Database").collection("System_Data").updateOne(
        { NAME: "COUNTER_INFO" },
        { $inc: { SESSION_COUNTER: 1 } }
      );
      console.log(`${result.matchedCount} Sessions(s) were found.`);
      console.log(`${result.modifiedCount} Sessions(s) were updated.`);

      //Response must include array of items and the sessionid. 
      res.json({
        _id: session._id,
        uncompleted_items: session.uncompleted_items,
      })

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

exports.getSessionIDs = async function (req, res) {
  try {
    // Connect to the Database
    await db.client.connect();

    // Get all documents from the "Session" collection
    const sessions = await db.client.db("Backend_Database").collection("Session").find().toArray();

    // Extract _id field from each document
    const sessionIDs = sessions.map(session => session._id);
    // Extract completed_items and uncompleted_items from each document
    const completedItems = sessions.map(session => session.completed_items);
    const uncompletedItems = sessions.map(session => session.uncompleted_items);

    console.log("Completed Items:", completedItems);
    console.log("Uncompleted Items:", uncompletedItems);

    res.json({
      _ids: sessionIDs,
      completedItems: completedItems,
      uncompletedItems: uncompletedItems
    })
  } catch (error) {
    console.error("Error fetching session IDs:", error);
    res.status(500).json({ error: 'Internal server error' }); // Send error response to client
  }
}

exports.getItem = async function (req, res) {
  //get parameters from request
  const { sessionId, itemId } = req.query;

  try {
      //Connect to database
      await db.client.connect();

      //Check Session For ItemId
      const session = await db.client.db("Backend_Database").collection("Session").findOne({
          _id: Number(sessionId),
          uncompleted_items: Number (itemId)
      });

      //If the session contains the itemID, return the item data. 
      if(!session) { 
          console.error("Session does not contain requested ID");
          res.status(500).json({error: "That Item doesn't exist in the requested session"});
      } else {
          //Query Database for Item Info
          const item = await db.client.db("Backend_Database").collection("Item").findOne({_id: Number(itemId)});
          res.json(item); // Return the resulting item object as JSON response
      }
  } catch (e) {
      console.log("Error Connecting to database: " , e);
      res.status(500).json({error: "Error querying database" });
  } finally {
      await db.client.close();
  }
}

exports.createSession = async function (req, res) {
  try {
    await db.client.connect();

    // Get the current session counter
    const SYSTEM_DATA = await db.client.db("Backend_Database").collection("System_Data").findOne();

    // Create a new session object
    const session = {
      _id: SYSTEM_DATA.SESSION_COUNTER,
      completed_items: [],
      uncompleted_items: [],
    };

    // Insert the new session into the database
    await db.client.db("Backend_Database").collection("Session").insertOne(session);

    // Increment the session counter
    await db.client.db("Backend_Database").collection("System_Data").updateOne(
        { NAME: "COUNTER_INFO" },
        { $inc: { SESSION_COUNTER: 1 } }
    );

    res.json({ sessionId: session._id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.client.close();
  }
}

/* a little documentation: the json should be formatted something like this, not all values are needed
{
  "sku": "some_sku_value",
  "item_description": "some_description",
  "manufacturer_part_num": "some_part_number",
  "point_of_use": "some_point_of_use",
  "overall_vendability": "some_overall_vendability",
  "vendability_notes": "some_notes",
  "height_inch": 0,
  "width_inch": 0,
  "length_inch": 0,
  "weight_lbs": 0,
  "heavy": true,
  "fragile": true,
  "default_issue_type": "some_issue_type",
  "default_issue_qty": 0,
  "stackable": true,
  "loose": true,
  "store_vertically": true,
  "preferred_machine_type": "some_machine_type",
  "locker_vendability": {
    "locker_vendable": true,
    "num_compartments_per_locker_door": 0,
    "capacity_for_express_locker": 0,
    "capacity_for_prostock_locker": 0,
    "capacity_for_prolock_locker": 0
  },
  "carousel_vendability": {
    "carousel_vendable": true,
    "needs_repack_for_carousel": true,
    "num_slots_per_item": 0
  },
  "coil_vendability": {
    "coil_vendable": true,
    "needs_repack_for_coil": true,
    "coil_pitch": null,
    "coil_capacity": null,
    "seven_shelf_compatable": null,
    "coil_type": "some_coil_type",
    "preferred_shelf": "some_shelf",
    "preferred_row": "some_row",
    "riser_required": true,
    "flip_bar_required": true,
    "coil_end_clock_position": "some_position"
  }
}
 */

exports.addItem = async function (req, res) {
  const { sessionId, item } = req.body;

  try {
    await db.client.connect();

    // Find the session by ID
    const session = await db.client.db("Backend_Database").collection("Session").findOne({ _id: sessionId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Insert the item into the 'Item' collection and get the inserted ID
    const result = await db.client.db("Backend_Database").collection("Item").insertOne(item);
    const itemId = result.insertedId;

    // Add the item ID to the session's uncompleted_items array
    await db.client.db("Backend_Database").collection("Session").updateOne(
        { _id: sessionId },
        { $push: { uncompleted_items: itemId } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding item to session:", error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.client.close();
  }
}