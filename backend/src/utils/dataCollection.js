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
    // Array to store all properties and data. 
    const property_data = [];

    // Check if manufacturer part number exists, if not, scrape for it.
    // Manufacturer part number is critical to the successful operation of the continuous_scrape() function.
    if (!item.manufacturer_part_num) {
        property_data.push(
            {
                property_name: "manufacturer_part_num",
                property_type: "string",
                additional_info:"May be listed as manufacturer model number, manufacturer part number, mpn, item model number, product code, manufacturer # or something similar"    
            });
    }

    // Check if height inch exists, if not, scrape for it
    if (!item.height_inch || !item.width_inch || !item.length_inch) {
        property_data.push(
            {
                property_name: "dimensions",
                property_type: "string",
                additional_info:item.default_issue_type == "BX" ?
                `Dimensional data must be for the boxed form of the item containing exactly ${item.default_issue_qty} pieces. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
                item.default_issue_type == "PK" ?
                `Dimensional data must be for the packaged form of the item containing exactly ${item.default_issue_qty} pieces. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
                item.default_issue_type == "PR" ?
                `Dimensional data must be for a single, unboxed pair of the item(s). Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>` :
                `Dimensional data must be for the individual, unboxed form of the item containing exactly 1 piece. Return the dimensions in inches rounded to 2 decimal places using the format: <width>x<depth>x<height>`  
            });
    }

    // Check if weight exists, if not, scrape for it
    if (!item.weight_lbs) {
        property_data.push(
            {
                property_name: "weight_lbs",
                property_type: "float",
                additional_info:"Item's weight in pounds rounded to two decimal places, convert if necessary "    
            });
    }

    // Check if fragile flag exists, if not, scrape for it
    if (typeof item.fragile === 'undefined' || item.fragile === null) {
        property_data.push(
            {
                property_name: "fragile",
                property_type: "boolean",
                additional_info:"An item is fragile if it has any chance of breaking or shattering from a 18 inch drop"    
            });
    }

    let result = await continuous_scrape(item.item_description,item.manufacturer_part_num, property_data);
 
       // Update item object with scraped data
       for (const prop of result) {
        switch (prop.property_name) {
            case 'manufacturer_part_num':
                item.manufacturer_part_num = result.slice(1, -1);
                break;
            case 'dimensions':
                const dimensions = prop.value.match(/(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/);
                item.height_inch = parseFloat(dimensions[1]);
                item.width_inch = parseFloat(dimensions[3]);
                item.length_inch = parseFloat(dimensions[5]);
                break;
            case 'weight_lbs':
                item.weight_lbs = parseFloat(prop.value);
                break;
            case 'fragile':
                item.fragile = String(prop.value).toLowerCase === 'true';
                break;
            default:
                // Handle unexpected property names
                break;
        }
    }

    return item;
}