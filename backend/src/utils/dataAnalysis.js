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
        locker_vendable: true, //Item is vendable until proven otherwise
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
                    if(item.height_inch < (LOCKER_HEIGHT_SINGLE + (11 * LOCKER_HEIGHT_ADDITIONAL))) {
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
               console.log(Dimensions)
                if(Dimensions[0] < LOCKER_DEPTH_INCH) {
                    //Check if second largest dimension is smaller than the locker width
                    if(Dimensions[1] < LOCKER_WIDTH_INCH) {
                        //Calculate necessary locker height based on the smallest dimension
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions[2] - LOCKER_HEIGHT_SINGLE)/LOCKER_HEIGHT_ADDITIONAL) + 1);
                        console.log(`num compartments = ${locker_vendibility.num_compartments_per_locker_door}`);
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
                } else if (Dimensions [0] < (LOCKER_HEIGHT_SINGLE + (11 * LOCKER_HEIGHT_ADDITIONAL)) && Dimensions [1] < LOCKER_DEPTH_INCH && Dimensions [2] < LOCKER_WIDTH_INCH) {
                     //Calculate minimum number of compartments necessary to store item
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
    locker_vendibility.locker_vendable = locker_vendibility.capacity_for_prolock_locker > 0? true : false;

    return locker_vendibility;
}

const getCoilVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    const coil_vendibility =  {
        coil_vendable: true,
        needs_repack_for_coil: null, 
        coil_pitch: null, //SEPARATED coil_pitch_num_items_per_row because the two values may not be equal due to weight
        coil_capacity: null,
        coil_type: null, 
        preferred_shelves: null, //Array of Shelves that can accomodate the item 
        preferred_row: null, 
        riser_required: null, 
        flip_bar_required: null, 
        coil_end_clock_position: null, 
    }

    //Constants Containing Coil Information
    const SHELF_HEIGHT_INCH = [8, 6, 7, 7, 7, 7]; 
    const DUAL_HELIX_DIAMETER = 5;
    const LARGE_HELIX_DIAMETER = 3.75;
    const SINGLE_HELIX_DIAMETER = 2.5;
    const HELIX_MAX_WEIGHT = 10;
    const RISER_PLATFORM_HEIGHT = 1.5; 
    const HEAVY_ITEM_WEIGHT = 3; //Items exceeding this weight will be placed on bottom shelf.
    
    const SINGLE_PITCH_COUNTS = [5, 7, 8, 9, 10, 12, 15, 18, 24, 32];
    const SINGLE_SLOT_DEPTHS = [4.04, 2.9, 2.51, 2.25, 2.02, 1.66, 1.3, 1.05, 0.75, 0.53];

    const LARGE_PITCH_COUNTS = [4, 5, 7, 9, 10, 12, 15];
    const LARGE_SLOT_DEPTHS = [4.1, 3.45, 2.58, 2.05, 2.01, 1.55, 1.24];

    const DUAL_PITCH_COUNTS = [5, 7, 10, 12, 15, 18, 24];
    const DUAL_SLOT_DEPTHS = [4.04, 2.9, 2.02, 1.66, 1.3, 1.05, 0.75];


    //Create an array containing item dimensions. This array will be used to determine
    //Which axes should be considered "depth", "height" or "width". 
    const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];

    // Vertically stored Items aren't vendable. 
    if (item.store_vertically) {
        coil_vendable = false;
        return coil_vendibility;
    } else {
        /*If vertical storage isn't necessary, Sort item dimensions from largest to smallest. This 
        * effectively allows the item to be 'rotated' on any axis.*/
        Dimensions.sort((a, b) => {return b-a}); 
    }

    //Check which shelves can accommodate the item.
    if(Dimensions[0] > 8) {
        coil_vendibility.coil_vendable = false; 
        return coil_vendibility; //ITEM IS NOT VENDABLE
    } else if (Dimensions [0] > 7 ) { 
        coil_vendibility.preferred_shelves = [1]; //Only Top Shelf
    } else if (Dimensions [0] > 6) {
        coil_vendibility.preferred_shelves = [1, 3, 4, 5, 6]; //All but #2
    } else {
        coil_vendibility.preferred_shelves = [1, 2, 3, 4, 5, 6]; //All Shelves
    }
 
    //Calculation of coil type. 
    if (Dimensions[1] >= DUAL_HELIX_DIAMETER) {
        coil_vendibility.coil_vendable = false; 
        return coil_vendibility; //ITEM IS NOT VENDABLE
    } else if (Dimensions[1] >= SINGLE_HELIX_DIAMETER) {
        // Temporarily Set Coil type to large. This will be changed later if item is too heavy
        coil_vendibility.coil_type = "large"; 
    } else {
        coil_vendibility.coil_type = "single";
    }

    function calculatePitch(pitch_counts, slot_depths) {
        let temp_count = pitch_counts[0];
        let count = 0;

        //Check if item is too big:
        if (Dimensions[2] >= slot_depths[0]) {
            coil_vendibility.coil_vendable = false; 
            return -1; //ITEM IS NOT VENDABLE
        }

        //Check each of the coil pitch slot depths  to calculate best fit. 
        for(i = 0; i < pitch_counts.length - 1; i++) {
            if(Dimensions[2] > slot_depths[i]) {
                count = temp_count;
                return count;
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
    
    if ((capacity * item.weight_lbs) > HELIX_MAX_WEIGHT) {
        if (coil_vendibility.coil_type == 'large') {
            coil_vendibility.coil_type = 'dual';
            calculatePitch(DUAL_PITCH_COUNTS, DUAL_SLOT_DEPTHS);
            capacity = coil_vendibility.coil_pitch;
            coil_vendibility.coil_capacity = (capacity * item.weight_lbs) < (2 * HELIX_MAX_WEIGHT)? capacity : Math.floor( (2*HELIX_MAX_WEIGHT)/item.weight_lbs);
        } else {
            coil_vendibility.coil_capacity = Math.floor( (2*HELIX_MAX_WEIGHT)/item.weight_lbs);
        }
    } else {
       coil_vendibility.coil_capacity = capacity;
    }

    //Calculate whether the item needs a riser
    if (Dimensions[0] <= item.SINGLE_HELIX_DIAMETER) {
        if (Dimensions [0] + RISER_PLATFORM_HEIGHT <= item.SINGLE_HELIX_DIAMETER) {
            coil_vendibility.coil_vendable = false;//If item is STILL to short, it's not vendable. 
        } else {
            coil_vendibility.riser_required = true; 
        }
    } else coil_vendibility.riser_required = false;

    //Calculate if item is heavy
    if (item.weight_lbs >= HEAVY_ITEM_WEIGHT) {
        coil_vendibility.preferred_shelves = [6];
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