const {client} = require('../config/DatabaseConnection');
const {dataAnalysis} = require('../utils/dataAnalysis')
const {fillData} = require ('../generative/gpt')

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
            //Query Database for Item Info
            const item = await client.db("Backend_Database").collection("Item").findOne({_id: Number(itemId)});

            /* INITIATE DATA COLLECTION */
            const item_data = await fillData(item);
            item.width_inch = item_data.width_inch;
            item.height_inch = item_data.height_inch;
            item.length_inch = item_data.length_inch;
            item.weight_lbs = item_data.weight_lbs;

            //FOR TESTING VARIOUS ITEM CONFIGS.
            // item.width_inch = 5;
            // item.height_inch = 2;
            // item.length_inch = 1;
            // item.weight_lbs = 0.01

            /*-----INITIATE DATA ANALYSIS-----*/
            let result;
            try { result = dataAnalysis(item);}
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
