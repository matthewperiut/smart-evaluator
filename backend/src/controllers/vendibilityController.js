const {client} = require('../config/DatabaseConnection');
const {dataAnalysis} = require('../utils/dataAnalysis')

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

            /* -------------------------------*/
            /*    DATA COLLECTION GOES HERE   */
            /* -------------------------------*/

            //Initiate Data Analysis
            const result = dataAnalysis(item);

            //log item to console
            console.log(`Processed item vendibility request for item with id: ${item._id}`);
            console.log(result);
            
            res.json(result); // Return the resulting item object as JSON response
        }
    } catch (e) {
        console.log("Error Connecting to database");
        res.status(500).json({error: "Error querying database" });
    } finally {
        await client.close();
    }
}
