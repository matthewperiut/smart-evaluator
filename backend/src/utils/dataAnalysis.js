/* 
* Name: dataAnalysis()
* Description: Helper script that performs vendibility calculations used
* on the data collected during the data collection phase of vendibility analysis. Called by external
* functions using the dataAnalysis() function below. 
*/

exports.dataAnalysis = function(item) {

    //resulting item to be returned after data completion
    let result = item

    //Calls to auxilary functions
    result.locker_vendability = getLockerVendibility(item);
    result.coil_vendability = getCoilVendibility(item);
    result.carousel_vendibility = getCarouselVendibility(item);

    return result;
}


const getLockerVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    const locker_vendibility =  {
        num_compartments_per_locker_door: null, 
        capacity_for_express_locker: null, 
        capacity_for_prostock_locker: null,  
        capacity_for_prolock_locker: null, 
    }

    return locker_vendibility;
}

const getCoilVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    const coil_vendibility =  {
        coil_vendable: null,
        needs_repack_for_coil: null, 
        coil_pitch_num_items_per_row: null, 
        coil_type: null, 
        preferred_shelf: null, 
        preferred_row: null, 
        riser_required: null, 
        flip_bar_required: null, 
        coil_end_clock_position: null, 
    }

    return coil_vendibility;
}

const getCarouselVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    const carousel_vendibility =  {
        carousel_vendable: null,
        needs_repack_for_carousel: null, 
        num_slots_per_item: null, 
    }

    return carousel_vendibility;
}