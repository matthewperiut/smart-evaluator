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
    result.carousel_vendability = getCarouselVendibility(item);

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
    //NOTE, this function does contain side-effects.
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
                /*If vertical storage isn't necessary, Sort item dimensions from largest to smallest. This 
                * effectively allows the item to be 'rotated' on any axis. If the item can be rotated, 
                * Check if the largest dimension is smaller than the locker depth. */
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
        coil_vendable: true,
        needs_repack_for_coil: null, 
        coil_pitch: null, //SEPARATED coil_pitch_num_items_per_row because the two values may not be equal due to weight
        coil_capacity: null,
        seven_shelf_compatable: null, //Added this to indicate if the item is vendable on the seven shelf toolbox, which has a smaller max height. 
        coil_type: null, 
        preferred_shelf: null, 
        preferred_row: null, 
        riser_required: null, 
        flip_bar_required: null, 
        coil_end_clock_position: null, 
    }

    //Constants Containing Coil Information
    const SIX_SHELF_MAX_HEIGHT = 6; 
    const SEVEN_SHELF_MAX_HEIGHT = 8; 
    const DUAL_HELIX_DIAMETER = 5;
    const LARGE_HELIX_DIAMETER = 3.75;
    const SINGLE_HELIX_DIAMETER = 2.5;
    const HELIX_MAX_WEIGHT = 10;
    
    const SINGLE_PITCH_COUNTS = [5, 7, 8, 9, 10, 12, 15, 18, 24, 32];
    const SINGLE_SLOT_DEPTHS = [4.04, 2.9, 2.51, 2.25, 2.02, 1.66, 1.3, 1.05, 0.75, 0.53];

    const LARGE_PITCH_COUNTS = [4, 5, 7, 9, 10, 12, 15];
    const LARGE_SLOT_DEPTHS = [4.1, 3.45, 2.58, 2.05, 2.01, 1.55, 1.24];

    const DUAL_PITCH_COUNTS = [5, 7, 10, 12, 15, 18, 24];
    const DUAL_SLOT_DEPTHS = [4.04, 2.9, 2.02, 1.66, 1.3, 1.05, 0.75];


    //Create an array containing item dimensions.
    const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];

    // Vertical storage means the item can't be rotated longitudinally to fit .
    if (item.store_vertically) {
        //Set height to first dimension
        Dimensions[0] = item.height_inch;
        Dimensions[1] = Math.max(item.width_inch, item.length_inch);
        Dimensions[2] = Math.min(item.width_inch, item.length_inch);
    } else {
        /*If vertical storage isn't necessary, Sort item dimensions from largest to smallest. This 
        * effectively allows the item to be 'rotated' on any axis.*/
        Dimensions.sort((a, b) => {return b-a}); 
    }

    //Check if the item will fit in a prolock with seven-shelf configuration
    if(Dimensions[0] < SEVEN_SHELF_MAX_HEIGHT) {
        //Item Fits in either six or seven-shelf configuration
        coil_vendibility.seven_shelf_compatable = true;
    } else if (Dimensions[0] < SIX_SHELF_MAX_HEIGHT) {
        //Item Only fits in six-shelf configuration
        coil_vendibility.seven_shelf_compatable = false;
    } else {
        coil_vendibility.coil_vendable = false; 
        return coil_vendibility; //ITEM IS NOT VENDABLE
    }

 
    //Calculation of coil type. 
    if (Dimensions[1] >= DUAL_HELIX_DIAMETER) {
        coil_vendibility.coil_vendable = false; 
        return coil_vendibility; //ITEM IS NOT VENDABLE
    } else if (Dimensions[1] >= 4.1) {
        coil_vendibility.coil_type = "dual";
        console.log("1");
    } else if (Dimensions[1] >= 4.04) {
        coil_vendibility.coil_type = "large";
        coil_vendibility.coil_pitch = 4;
    } else if (Dimensions[1] >= LARGE_HELIX_DIAMETER) {
        if (Dimensions[2] >= LARGE_HELIX_DIAMETER) {
            coil_vendibility.coil_type = "dual";
            coil_vendibility.coil_pitch = 5; 
            console.log("2");
        } else if(Dimensions[2] >= SINGLE_HELIX_DIAMETER) {
                coil_vendibility.coil_type = "large";
                coil_vendibility.coil_pitch = 4; 
        } else {
            coil_vendibility.coil_type = "single";
            coil_vendibility.coil_pitch = 5; 
        }
    } else if (Dimensions[1] >= SINGLE_HELIX_DIAMETER) {
        coil_vendibility.coil_type = "large";
    } else {
        coil_vendibility.coil_type = "single";
    }

    function calculatePitch(pitch_counts, slot_depths) {
        let temp_count = pitch_counts[0];
        let count = 0;
        for(i = 0; i < pitch_counts.length - 1; i++) {
            if(Dimensions[2] > slot_depths[i]) {
                count = temp_count;
            } else temp_count = pitch_counts[i];
        }

        if (Dimensions[2] < pitch_counts[pitch_counts.length-1]) {
            return pitch_counts[pitch_counts.length-1];
        } else return count;//Return the final pitch count
    }

    //Calculation of pitch size, (if not already calculated)
    if(coil_vendibility.coil_pitch == null) {
        switch (coil_vendibility.coil_type) {
            case "dual":
                coil_vendibility.coil_pitch = calculatePitch(DUAL_PITCH_COUNTS, DUAL_SLOT_DEPTHS);
            break;
            case "large":
                coil_vendibility.coil_pitch = calculatePitch(LARGE_PITCH_COUNTS, LARGE_SLOT_DEPTHS);
            break;
            case "single":
                coil_vendibility.coil_pitch = calculatePitch(SINGLE_PITCH_COUNTS, SINGLE_SLOT_DEPTHS);
            break;
        }
    }

    let capacity = coil_vendibility.coil_pitch; 
    
    if (coil_vendibility.coil_type == "dual") {
        coil_vendibility.coil_capacity = (capacity * item.weight_lbs) < (2 * HELIX_MAX_WEIGHT)? capacity : Math.floor( (2*HELIX_MAX_WEIGHT)/item.weight_lbs)
    } else {
        coil_vendibility.coil_capacity = (capacity * item.weight_lbs) < HELIX_MAX_WEIGHT? capacity: Math.floor((HELIX_MAX_WEIGHT)/item.weight_lbs)
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