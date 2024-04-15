const {dataAnalysis} = require("../dataAnalysis");

exports.dataAnalysisTests = async function() {
//Sample item for testing.
const item = {
item_description: `135354 24221 242 REMOVABLE TL 10 ML BO`,
manufacturer_part_num: "135354" ,
height_inch: 0.5,
width_inch: 0.5,
length_inch: 0.5,
weight_lbs: 0.5,
fragile: false,
default_issue_type: "ea", 
default_issue_qty: "1"    
};


    try {
        let result = await dataAnalysis(item)
        console.log(result);
    }  catch (error) { console.error("Error during Analysis:", error)}


}