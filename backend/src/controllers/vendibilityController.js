const {client} = require('../config/DatabaseConnection');
const {dataAnalysis} = require('../utils/dataAnalysis')
const {fillDimensions} = require ('../generative/gpt')

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
            const item_dimensions = await fillDimensions(item);
            item.width_inch = item_dimensions.width_inch;
            item.height_inch = item_dimensions.height_inch;
            item.length_inch = item_dimensions.length_inch;

            /*-----INITIATE DATA ANALYSIS-----*/
            const result = dataAnalysis(item); 

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
