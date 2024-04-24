const {continuous_scrape} = require("../generative/continuous_gpt");


// Name: dataCollection()
// Description: This code represents the data analysis phase of a vendibility request.
// If a field is not filled, this function uses the continuous_scrape() function from continuous_gpt.js
// To fill that field.  

// This function makes extensive use of the 'extra information' field in the continuous_scrape() function
// That 'extra information' field helps us define to the GPT/Webscraping function the type of output we are expecting.

exports.dataCollection = async function(item) {
    // Array to store all properties and data. 
    const property_data = [];

    // Check if manufacturer part number exists, if not, scrape for it.
    // Manufacturer part number is critical to the successful operation of the continuous_scrape() function.
    if (!item.manufacturer_part_num) {
        let result = await continuous_scrape(item.item_description, "" , 
            [{
                property_name: "manufacturer_part_num",
                property_type: "string",
                additional_info:"May be listed as manufacturer model number, manufacturer part number, mpn, item model number, product code, manufacturer # or something similar"    
            }]);
        item.manufacturer_part_num = result? result[0].value.slice(1, -1): null; 
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

    if (property_data != []) {
        let result = await continuous_scrape(item.item_description,item.manufacturer_part_num, property_data);
    
        // Update item object with scraped data
        for (const prop of result) {
            switch (prop.property_name) {
                case 'manufacturer_part_num':
                    item.manufacturer_part_num = prop.value? prop.value.slice(1, -1): null;
                    break;
                case 'dimensions':
                    if (prop.value){
                    const dimensions = prop.value.match(/(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/);
                    if (dimensions) {
                        item.height_inch = parseFloat(dimensions[1]);
                        item.width_inch = parseFloat(dimensions[3]);
                        item.length_inch = parseFloat(dimensions[5]);
                    }
                    } else {
                        item.height_inch = null;
                        item.width_inch = null;
                        item.length_inch_inch = null;
                    }
                    break;
                case 'weight_lbs':
                    item.weight_lbs = prop.value? parseFloat(prop.value): null;
                    break;
                case 'fragile':
                    item.fragile = prop.value? String(prop.value).toLowerCase === 'true': false;
                    break;
                default:
                    // Handle unexpected property names
                    break;
            }
        }
    }
 
    return item;
}