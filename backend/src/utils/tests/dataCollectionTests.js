const {dataCollection} = require("../dataCollection");

exports.dataCollectionTests = async function() {
// //Sample item for testing.
// const item = {
// item_description: `135354 24221 242 REMOVABLE TL 10 ML BO`,
// //height_inch: 3.7,
// //width_inch: 1,
// //length_inch: 1,
// //weight_lbs: 0.5,
// //fragile: false,
// default_issue_type: 'ea',
// default_issue_qty: '1',
// manufacturer_part_num: "135354" 
// };

const item = {
    item_description: 'SHIELD GLASSES SIDE',
    manufacturer_part_num: 99705,
    point_of_use: 'POU 2',
    overall_vendability: null,
    vendability_notes: null,
    //height_inch: 2,
    //width_inch: 0.25,
    //length_inch: 0.25,
    //weight_lbs: 0.25,
    //fragile: false,
    default_issue_type: 'EA',
    default_issue_qty: 1,
};
    


    try {
        let result = await dataCollection(item)
        console.log(result);
    }  catch (error) { console.error("Error during GPT prompt:", error)}


}
