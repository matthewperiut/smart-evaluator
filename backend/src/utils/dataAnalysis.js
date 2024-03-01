/* 
* Name: dataAnalysis()
* Description: Helper script(s) hat performs vendibility calculations used
* on the data collected during the data collection phase of vendibility analysis. 
*/

exports.dataAnalysis = function(item) {

    //resulting item to be returned after data completion
    const result = {
        _id: item._id,
        sku: item.sku,
        item_description: item.item_description,
        manufacturer_part_num: item.manufacturer_part_num,
        session_id: item.session_id
    }

    /* ANALYSIS HERE */

    return result
}

