const {dataCollection} = require("../dataCollection");

exports.dataCollectionTests = async function() {
//Sample item for testing.
const item = {
item_description: 'Random Item, no Manufacturer ID',
//height_inch: 3.7,
//width_inch: 1,
//length_inch: 1,
weight_lbs: 0.5,
fragile: false,
default_issue_type: 'ea',
default_issue_qty: '1',
manufacturer_part_num: 'random Item, no manufacturer part number.'
};


    try {
        let result = await dataCollection(item)
        console.log(result);
    }  catch (error) { console.error("Error during GPT prompt:", error)}


}
