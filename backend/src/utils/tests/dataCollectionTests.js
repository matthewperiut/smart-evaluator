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

// const item = {
//     item_description: 'PEN BLUE MED BALL PNT PENTEL',
//     manufacturer_part_num: 'BK440C',
//     point_of_use: 'POU 2',
//     overall_vendability: null,
//     vendability_notes: null,
//     default_issue_type: 'EA',
//     default_issue_qty: 1,
//     fragile: false,
//     // weight_lbs: 0.36,
//     // height_inch: 5.75,
//     // width_inch: 3.5,
//     // length_inch: 1.2
// };

// const item = {
//     item_description: 'CL110 CHECKLITE CLEAR LENS',
//     manufacturer_part_num: 'CL110',
//     point_of_use: 'POU 2',
//     overall_vendability: null,
//     vendability_notes: null,
//     default_issue_type: 'PR',
//     default_issue_qty: 1,
//     // fragile: false,
//     // weight_lbs: 0.36,
//     // height_inch: 5.75,
//     // width_inch: 3.5,
//     // length_inch: 1.2
// };

const item = {
    item_description: '1251L LED FLASHLIGHT 2 D BATTERIES',
    manufacturer_part_num: '1251L',
    point_of_use: 'POU 2',
    overall_vendability: null,
    vendability_notes: null,
    default_issue_type: 'EA',
    default_issue_qty: 1,
    // fragile: false,
    // weight_lbs: 0.36,
    // height_inch: 5.75,
    // width_inch: 3.5,
    // length_inch: 1.2
};


    


    try {
        let result = await dataCollection(item)
        console.log(result);
    }  catch (error) { console.error("Error during GPT prompt:", error)}


}
