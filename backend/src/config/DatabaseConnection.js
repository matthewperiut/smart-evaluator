require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const username = process.env.MONGO_DB_USERNAME; //Get Username from .env
const password = process.env.MONGO_DB_PASSWORD; //Get Password from .env
const uri = `mongodb+srv://${username}:${password}@maindatabase.3hmcoys.mongodb.net/`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
exports.client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


exports.newItem = async function (client, item) {
  try {
    //Check if item exists
    result = await client.db("Backend_Database").collection("Item").findOne({sku: item.sku, item_description: item.item_description, manufacturer_part_num: item.manufacturer_part_num});
    
    if (result) {
        // Print item information to the console
        console.log(` Item already exists: \n
        Existing id: ${result._id} \n 
        item_description: ${result.item_description} \n 
        manufacturer_part_num: ${result.manufacturer_part_num}`);

        return result; 
    } else {
      //Get Counter (Maybe we should use a semaphore??? Idk)
      const SYSTEM_DATA = await client.db("Backend_Database").collection("System_Data").findOne();

      //Add Item to database with unique counter
      item._id = SYSTEM_DATA.ITEM_COUNTER; 
      const result = await client.db("Backend_Database").collection("Item").insertOne(item);

      //Increment Item counter
      await client.db("Backend_Database").collection("System_Data").updateOne(
        { NAME: "COUNTER_INFO" },
        { $inc: { ITEM_COUNTER: 1}}
      );
      console.log("Incremented item counter");

      // Print item information to the console
      console.log(`New Item id: ${item._id} \n 
      item_description: ${item.item_description} \n 
      manufacturer_part_num: ${item.manufacturer_part_num}`);

      return item; 
    }
  } catch (error) {
    console.error("Error adding item:", error);
  }
}

