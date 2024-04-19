const {continuous_scrape} = require("../generative/continuous_gpt");


// Name: dataCollection()
// Description: This code represents the data analysis phase of a vendibility request.
// If a field is not filled, this function uses the continuous_scrape() function from continuous_gpt.js
// To fill that field. These functions currently execute synchonously to avoid rate limiting,
// but it can be made asynchronous by removing await keywords and un-commenting
// the last line of the function. 

// This function makes extensive use of the 'extra information' field in the continuous_scrape() function
// That 'extra information' field helps us define to the GPT/Webscraping function the type of output we are expecting.

exports.dataCollection = async function(item) {
    // Array to store all asynchronous tasks
    const tasks = [];

    // Check if manufacturer part number exists, if not, scrape for it.
    // Manufacturer part number is critical to the successful operation of the continuous_scrape() function.
    if (!item.manufacturer_part_num) {
        tasks.push( await continuous_scrape(item.item_description, "",
            "manufacturer_part_num",
            "string",
            "May be listed as manufacturer model number, manufacturer part number, mpn, item model number, product code, manufacturer # or something similar")
            .then(result => item.manufacturer_part_num = result.slice(1, -1)));

        console.log("manufacturer part number just fired");
    }

    // Check if height inch exists, if not, scrape for it
    if (!item.height_inch || !item.width_inch || !item.length_inch) {
        tasks.push( continuous_scrape(item.item_description, item.manufacturer_part_num,
            "dimensions",
            "string",
            item.default_issue_type == "BX" ?
            `Dimensional data must be for the boxed form of the item containing exactly ${item.default_issue_qty} pieces. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
            item.default_issue_type == "PK" ?
            `Dimensional data must be for the packaged form of the item containing exactly ${item.default_issue_qty} pieces. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
            item.default_issue_type == "PR" ?
            `Dimensional data must be for a single, unboxed pair of the item(s). Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
            `Dimensional data must be for the individual, unboxed form of the item containing exactly 1 piece. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>`)
            .then(result => {
                const dimensions = result.match(/(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/);
                
                if (dimensions) {
                    item.height_inch = parseFloat(dimensions[1]);
                    item.width_inch = parseFloat(dimensions[3]);
                    item.length_inch = parseFloat(dimensions[5]);
                } else {
                    item.height_inch = null;
                    item.width_inch = null;
                    item.length_inch = null;
                    item.vendability_notes = "Unable to find item dimensions. Vendibility cannot be calculated."
                }

            }));
    }

    // Check if weight exists, if not, scrape for it
    if (!item.weight_lbs) {
        tasks.push( continuous_scrape(item.item_description, item.manufacturer_part_num,
            "weight_lbs",
            "float",
            "Item's weight in pounds rounded to two decimal places, convert if necessary ")
            .then(result => item.weight_lbs = parseFloat(result)));
    }

    // Check if fragile flag exists, if not, scrape for it
    if (typeof item.fragile === 'undefined' || item.fragile === null) {
        tasks.push(continuous_scrape(item.item_description,
            "fragile",
            "boolean",
            "An item is fragile if it has any chance of breaking or shattering from a 18 inch drop")
            .then(result => item.fragile = String(result).toLowerCase === 'true'));
    }

    // Wait for all asynchronous tasks to complete
    await Promise.all(tasks);

    return item;
}