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
        locker_vendable: null, 
        num_compartments_per_locker_door: null, //This one is only for prolock. 
        capacity_for_express_locker: null, 
        capacity_for_prostock_locker: null,  
        capacity_for_prolock_locker: null, 
    }

    //Manual Calculation of ProLock Capacity
    const getProLockCapacity = () => {
        const LOCKER_DEPTH_INCH = 28.25
        const LOCKER_WIDTH_INCH = 11
        const LOCKER_HEIGHT_SINGLE = 5.06
        const LOCKER_HEIGHT_ADDITIONAL = 6.12
        const LOCKER_WEIGHT_CAP = 70

        //Order Dimensions from largest to smallest
        const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];
        Dimensions.sort((a, b) => {return b-a}); 

        /* calculates the approximate number of items that can fit in a locker.*/
        const capacityCalculation = (height, width, depth) => {
            let cap = 0; //Capacity count
            console.log(item.stackable , locker_vendibility.num_compartments_per_locker_door);
            if (item.stackable && locker_vendibility.num_compartments_per_locker_door == 1) {
                //If stackable, calculate in 3 Dimensions
                cap = Math.trunc(LOCKER_WIDTH_INCH/width) * Math.trunc(LOCKER_DEPTH_INCH/depth) * Math.trunc(LOCKER_HEIGHT_SINGLE/height);
            } else {
                //If not stackable, calculate number to fill bottom shelf with one layer
                cap = Math.trunc(LOCKER_WIDTH_INCH/width) * Math.trunc(LOCKER_DEPTH_INCH/depth);
            }
            //Returned capacity must not exceed shelf weight cap. 
            return (item.weight_lbs * cap) > LOCKER_WEIGHT_CAP ? Math.floor(LOCKER_WEIGHT_CAP/item.weight_lbs) : cap
        }

        //Check Weight
        if (item.weight_lbs > LOCKER_WEIGHT_CAP) {
            return 0; 
        } else {
            //Check if item must be stored vertically  
            if (item.store_vertically) {
                //Check Item's height, width, and length
                if(Math.max(item.width_inch, item.length_inch) < LOCKER_DEPTH_INCH && Math.min(item.width_inch, item.length_inch) < LOCKER_WIDTH_INCH) {
                    if(item.height_inch < (LOCKER_HEIGHT_SINGLE + (5 * LOCKER_HEIGHT_ADDITIONAL))) {
                        //Calculate minimum number of compartments necessary to store item
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((item.height_inch - LOCKER_HEIGHT_SINGLE)/LOCKER_HEIGHT_ADDITIONAL) + 1);
                        //ITEM IS VENDABLE
                        return capacityCalculation(item.height_inch, Math.min(item.width_inch, item.length_inch), Math.max(item.width_inch, item.length_inch));
                    } else return 0;
                } else return 0;
            } else {
                //If the item can be rotated, Check if the largest dimension is smaller than the locker depth.
                if(Dimensions[0] < LOCKER_DEPTH_INCH) {
                    //Check if second largest dimension is smaller than the locker width
                    if(Dimensions[1] < LOCKER_WIDTH_INCH) {
                        //Calculate necessary locker height based on the smallest dimension
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions[2] - LOCKER_HEIGHT_SINGLE)/LOCKER_HEIGHT_ADDITIONAL) + 1);
                        //ITEM IS VENDABLE
                        return capacityCalculation(Dimensions[2], Dimensions[1], Dimensions[0]);
                    } else {
                        //Calculate necessary locker height based on the median dimension
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions [1]- LOCKER_HEIGHT_SINGLE)/LOCKER_HEIGHT_ADDITIONAL) + 1);
                        if(Dimensions [2] < LOCKER_WIDTH_INCH) {
                            //ITEM is VENDABLE
                           return capacityCalculation(Dimensions[1], Dimensions[2], Dimensions[0]); 
                        } else return 0;
                    }
                //Check Height, depth and width if item exceeds the locker depth
                } else if (Dimensions [0] < (LOCKER_HEIGHT_SINGLE + (5 * LOCKER_HEIGHT_ADDITIONAL)) && Dimensions [1] < LOCKER_DEPTH_INCH && Dimensions [2] < LOCKER_WIDTH_INCH) {
                     //Calculate necessary locker height based on the largest dimension
                     locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions [0]- LOCKER_HEIGHT_SINGLE)/LOCKER_HEIGHT_ADDITIONAL) + 1);
                     //ITEM IS VENDABLE, Perform Area Calculation
                     return capacityCalculation(Dimensions[0], Dimensions[2], Dimensions[1]);
                } else return 0;
            }
        }
    }

    //Manual Calculation of ProStock Capacity
    const getProStockCapacity = () => {
        
    }

    //Use Method Calls
    locker_vendibility.capacity_for_prolock_locker = getProLockCapacity();

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