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
            //     //sku: "Mar P208";
            //     manufacturer_part_num: "135354" ,
            //     height_inch: null,
            //     width_inch: null,
            //     length_inch: null,
            //     //weight_lbs: 0.5,
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


            //log item to console
            console.log(`Processed item vendibility request for item with id: ${item._id}`);
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
