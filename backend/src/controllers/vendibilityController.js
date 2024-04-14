const {client} = require('../config/DatabaseConnection');
const {dataAnalysis} = require('../utils/dataAnalysis');
const {dataCollection} = require('../utils/dataCollection');

exports.itemVendibility = async function (req, res) {
    //get parameters from request
    const { sessionId, itemId } = req.query;



    try {
        //Connect to database
        await client.connect();

        //Check Session For ItemId
        const session = await client.db("Backend_Database").collection("Session").findOne({
            _id: Number(sessionId),
            uncompleted_items: Number (itemId)
        });

        //If the session contains the itemID, proceed with vendibility Analysis
        if(!session) { 
            console.error("Session does not contain requested ID");
            res.status(500).json({error: "That Item doesn't exist in the requested session"});
        } else {

            const item = await client.db("Backend_Database").collection("Item").findOne({_id: Number(itemId)});//Query Database for Item Info

            //for testing
            // const item = {
            //     item_description: `135354 24221 242 REMOVABLE TL 10 ML BO`,
            //     sku: "00770791",
            //     manufacturer_part_num: "135354" ,
            //     height_inch: 0.2,
            //     width_inch: 0.2,
            //     length_inch: 0.4,
            //     weight_lbs: 0.5,
            //     fragile: false,
            //     default_issue_type: "ea", 
            //     default_issue_qty: "1"
            // };


            /* INITIATE DATA COLLECTION */
            let item_filled_data;
            try { item_filled_data = await dataCollection(item);}
            catch (e) {console.log(`Error Occurred During Data Collection Phase ${e}`)}

            /*-----INITIATE DATA ANALYSIS-----*/
            let result; 
            try { result = await dataAnalysis(item_filled_data);}
            catch (e) {console.log(`Error Occurred During Data Analysis Phase ${e}`)}


            /*-----UPDATE ITEM INFO IN DATABASE------*/
            try {
                // Find the session by ID
                const session = await client.db("Backend_Database").collection("Session").findOne({ _id: Number(sessionId) });
                
                if (session) {
                    result._id = Number(itemId);
                    console.log("Updated Item:", result);
            
                    // Replace the item in the 'Item' collection
                    const replaceResult = await client.db("Backend_Database").collection("Item").replaceOne(
                        { _id: Number(itemId) },
                        result
                    );
            
                    // Place the item from the uncompleted array to the completed array within session
                    const updateSessionResult = await client.db("Backend_Database").collection("Session").updateOne(
                        { _id: Number(sessionId) },
                        {
                            $addToSet: { completed_items: Number(itemId) }, // Add itemId to completed_items if it's not already present
                            $pull: { uncompleted_items: Number(itemId) } // Remove itemId from uncompleted_items
                        }
                    );
                } else {
                    console.log("Session not found.");
                }
            } catch (error) {
                console.error("Error occurred while updating item info:", error);
            }


            //log item to console
            console.log(`Processed item vendibility request for item with id: ${result._id}`);
            console.log(result);
            
            res.json(result); // Return the resulting item object as JSON response
        }
    } catch (e) {
        console.log("Error Connecting to database: " , e);
        res.status(500).json({error: "Error querying database" });
    } finally {
        await client.close();
    }
}
