const {client} = require('../config/DatabaseConnection');

exports.itemVendibility = async function (req, res) {
    //get parameters from request
    const { sessionId, itemId } = req.query;

    /* -------------------------------*/
    /* VENDIBILITY ANALYSIS GOES HERE */
    /* -------------------------------*/

    try {
        //Connect to database
        await client.connect();

        //Query Database for Item Info
        const item = await client.db("Backend_Database").collection("Item").findOne({_id: Number(itemId)});

        //log item to console
        console.log(`Processed item vendibility request for item with id: ${item._id}`);

        res.json(item); // Return the item object as JSON response

    } catch (e) {
        console.log("Error querying database");
        res.status(500).json({error: "Error querying database" });
    } finally {
        await client.close();
    }
}
