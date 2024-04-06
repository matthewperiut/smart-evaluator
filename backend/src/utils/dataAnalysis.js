/* 
* Name: dataAnalysis()
* Description: Helper script that performs vendibility calculations used
* on the data collected during the data collection phase of vendibility analysis. Called by external
* functions using the dataAnalysis() function below. 
*/

exports.dataAnalysis = function (item) {

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
    const locker_vendibility = {
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
        Dimensions.sort((a, b) => { return b - a });

        /* calculates the approximate number of items that can fit in a locker.*/
        const capacityCalculation = (height, width, depth) => {
            let cap = 0; //Capacity count
            if (item.stackable && locker_vendibility.num_compartments_per_locker_door == 1) {
                //If stackable, calculate in 3 Dimensions
                cap = Math.trunc(LOCKER_WIDTH_INCH / width) * Math.trunc(LOCKER_DEPTH_INCH / depth) * Math.trunc(LOCKER_HEIGHT_SINGLE / height);
            } else {
                //If not stackable, calculate number to fill bottom shelf with one layer
                cap = Math.trunc(LOCKER_WIDTH_INCH / width) * Math.trunc(LOCKER_DEPTH_INCH / depth);
            }
            //Returned capacity must not exceed shelf weight cap. 
            return (item.weight_lbs * cap) > LOCKER_WEIGHT_CAP ? Math.floor(LOCKER_WEIGHT_CAP / item.weight_lbs) : cap
        }

        //Check Weight
        if (item.weight_lbs > LOCKER_WEIGHT_CAP) {
            return 0;
        } else {
            //Check if item must be stored vertically  
            if (item.store_vertically) {
                //Check Item's height, width, and length
                if (Math.max(item.width_inch, item.length_inch) < LOCKER_DEPTH_INCH && Math.min(item.width_inch, item.length_inch) < LOCKER_WIDTH_INCH) {
                    if (item.height_inch < (LOCKER_HEIGHT_SINGLE + (5 * LOCKER_HEIGHT_ADDITIONAL))) {
                        //Calculate minimum number of compartments necessary to store item
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((item.height_inch - LOCKER_HEIGHT_SINGLE) / LOCKER_HEIGHT_ADDITIONAL) + 1);
                        //ITEM IS VENDABLE
                        return capacityCalculation(item.height_inch, Math.min(item.width_inch, item.length_inch), Math.max(item.width_inch, item.length_inch));
                    } else return 0;
                } else return 0;
            } else {
                /*If vertical storage isn't necessary, Sort item dimensions from largest to smallest. This 
                * effectively allows the item to be 'rotated' on any axis. If the item can be rotated, 
                * Check if the largest dimension is smaller than the locker depth. */
                if (Dimensions[0] < LOCKER_DEPTH_INCH) {
                    //Check if second largest dimension is smaller than the locker width
                    if (Dimensions[1] < LOCKER_WIDTH_INCH) {
                        //Calculate necessary locker height based on the smallest dimension
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions[2] - LOCKER_HEIGHT_SINGLE) / LOCKER_HEIGHT_ADDITIONAL) + 1);
                        //ITEM IS VENDABLE
                        return capacityCalculation(Dimensions[2], Dimensions[1], Dimensions[0]);
                    } else {
                        //Calculate necessary locker height based on the median dimension
                        locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions[1] - LOCKER_HEIGHT_SINGLE) / LOCKER_HEIGHT_ADDITIONAL) + 1);
                        if (Dimensions[2] < LOCKER_WIDTH_INCH) {
                            //ITEM is VENDABLE
                            return capacityCalculation(Dimensions[1], Dimensions[2], Dimensions[0]);
                        } else return 0;
                    }
                    //Check Height, depth and width if item exceeds the locker depth
                } else if (Dimensions[0] < (LOCKER_HEIGHT_SINGLE + (5 * LOCKER_HEIGHT_ADDITIONAL)) && Dimensions[1] < LOCKER_DEPTH_INCH && Dimensions[2] < LOCKER_WIDTH_INCH) {
                    //Calculate necessary locker height based on the largest dimension
                    locker_vendibility.num_compartments_per_locker_door = Math.floor(Math.ceil((Dimensions[0] - LOCKER_HEIGHT_SINGLE) / LOCKER_HEIGHT_ADDITIONAL) + 1);
                    //ITEM IS VENDABLE, Perform Area Calculation
                    return capacityCalculation(Dimensions[0], Dimensions[2], Dimensions[1]);
                } else return 0;
            }
        }
    }
}

//Manual Calculation of ProStock Capacity
const getProStockCapacity = () => {

    // Height, Depth, and Weight Limits
    const PS_LOCKER_HEIGHT_INCH = 4;
    const PS_LOCKER_DEPTH_INCH = 28;
    const PS_LOCKER_MAX_WEIGHT_LBS = 100;

    // Various Locker Widths
    const LOCKER_WIDTHS =
        [23.5, 11, 7.5, 3.5];

    // Keeps Track of Current Capacity
    let CURRENT_CAPACITY = 0;

    // Sorts Dimensions from largest to smallest
    const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];
    Dimensions.sort((a, b) => { return b - a });

    const calculateCapacity = (height, width, depth, lockerNum) => {
        if (item.stackable) {
            switch (lockerNum) {
                case 0:
                    CURRENT_CAPACITY = Math.trunc(PS_LOCKER_HEIGHT_INCH / height) * Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth);
                    break;

                case 1:
                    CURRENT_CAPACITY = 2 * (Math.trunc(PS_LOCKER_HEIGHT_INCH / height) * Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;

                case 2:
                    CURRENT_CAPACITY = 3 * (Math.trunc(PS_LOCKER_HEIGHT_INCH / height) * Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;

                case 3:
                    CURRENT_CAPACITY = 6 * (Math.trunc(PS_LOCKER_HEIGHT_INCH / height) * Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;
            }
        } else {
            switch (lockerNum) {
                case 0:
                    CURRENT_CAPACITY = Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth);
                    break;

                case 1:
                    CURRENT_CAPACITY = 2 * (Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;

                case 2:
                    CURRENT_CAPACITY = 3 * (Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;

                case 3:
                    CURRENT_CAPACITY = 6 * (Math.trunc(LOCKER_WIDTHS[lockerNum] / width) * Math.trunc(PS_LOCKER_DEPTH_INCH / depth));
                    break;
            }

        }

        return (item.weight_lbs * CURRENT_CAPACITY) > PS_LOCKER_MAX_WEIGHT_LBS ? Math.floor(PS_LOCKER_MAX_WEIGHT_LBS / item.weight_lbs) : CURRENT_CAPACITY;


    }

    if (item.weight_lbs < PS_LOCKER_MAX_WEIGHT_LBS) {
        if (item.store_vertically) {
            // Height Check
            if (item.height_inch < PS_LOCKER_HEIGHT_INCH) {
                // Alternate Length/Width Check
                if (Math.max(item.width_inch, item.length_inch) < PS_LOCKER_DEPTH_INCH && Math.min(item.width_inch, item.length_inch) < LOCKER_WIDTHS[0]) {
                    for (let i = 0; i < 3; i++) {
                        if (Math.min(item.width_inch, item.length_inch) >= LOCKER_WIDTHS[i + 1]) {
                            return calculateCapacity(item.height_inch, Math.min(item.width_inch, item.length_inch), Math.max(item.width_inch, item.length_inch), i);
                        }
                    }
                    return calculateCapacity(item.height_inch, Math.min(item.width_inch, item.length_inch), Math.max(item.width_inch, item.length_inch), 3)
                } else return 0;

            } else return 0;

        } else {
            // 
            if (Dimensions[0] < PS_LOCKER_DEPTH_INCH) {
                if (Dimension[1] < LOCKER_WIDTHS[0]) {
                    if (Dimensions[1] >= PS_LOCKER_HEIGHT_INCH) {
                        for (let i = 0; i < 3; i++) {
                            if (Dimensions[1] >= LOCKER_WIDTHS[i + 1]) {
                                if (Dimensions[2] <= PS_LOCKER_HEIGHT_INCH) {
                                    return calculateCapacity(Dimensions[2], Dimensions[1], Dimensions[0], i);
                                }
                            }
                        }
                    }
                    else {
                        if (Dimensions[2] < LOCKER_WIDTHS[3]) {
                            return calculateCapacity(Dimensions[1], Dimensions[2], Dimensions[0], 3);
                        } else return 0;
                    }
                }
            } else return 0;
        }
    } else return 0;

    //Use Method Calls
    locker_vendibility.capacity_for_prolock_locker = getProLockCapacity();
    locker_vendability.capacity_for_prostock_locker = getProStockCapacity();

    return locker_vendibility;
}

const getCoilVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    const coil_vendibility = {
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
    const SIX_SHELF_MAX_HEIGHT = 8;
    const SEVEN_SHELF_MAX_HEIGHT = 6;
    const DUAL_HELIX_DIAMETER = 5;
    const LARGE_HELIX_DIAMETER = 3.75;
    const SINGLE_HELIX_DIAMETER = 2.5;
    const HELIX_MAX_WEIGHT = 10;
    const RISER_PLATFORM_HEIGHT = 1.5;

    const SINGLE_PITCH_COUNTS = [5, 7, 8, 9, 10, 12, 15, 18, 24, 32];
    const SINGLE_SLOT_DEPTHS = [4.04, 2.9, 2.51, 2.25, 2.02, 1.66, 1.3, 1.05, 0.75, 0.53];

    const LARGE_PITCH_COUNTS = [4, 5, 7, 9, 10, 12, 15];
    const LARGE_SLOT_DEPTHS = [4.1, 3.45, 2.58, 2.05, 2.01, 1.55, 1.24];

    const DUAL_PITCH_COUNTS = [5, 7, 10, 12, 15, 18, 24];
    const DUAL_SLOT_DEPTHS = [4.04, 2.9, 2.02, 1.66, 1.3, 1.05, 0.75];


    //Create an array containing item dimensions. This array will be used to determine
    //Which axes should be considered "depth", "height" or "width". 
    const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];

    // Vertical storage means the item can't be rotated longitudinally to fit.
    if (item.store_vertically) {
        //Set height to first dimension
        Dimensions[0] = item.height_inch;
        Dimensions[1] = Math.max(item.width_inch, item.length_inch);
        Dimensions[2] = Math.min(item.width_inch, item.length_inch);
    } else {
        /*If vertical storage isn't necessary, Sort item dimensions from largest to smallest. This 
        * effectively allows the item to be 'rotated' on any axis.*/
        Dimensions.sort((a, b) => { return b - a });
    }

    //Check if the item will fit in a prolock with seven-shelf configuration
    if (Dimensions[0] < SEVEN_SHELF_MAX_HEIGHT) {
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
        } else if (Dimensions[2] >= SINGLE_HELIX_DIAMETER) {
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
        for (i = 0; i < pitch_counts.length - 1; i++) {
            if (Dimensions[2] > slot_depths[i]) {
                count = temp_count;
            } else temp_count = pitch_counts[i];
        }

        if (Dimensions[2] < pitch_counts[pitch_counts.length - 1]) {
            return pitch_counts[pitch_counts.length - 1];
        } else return count;//Return the final pitch count
    }

    //Calculation of pitch size, (if not already calculated)
    if (coil_vendibility.coil_pitch == null) {
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
        coil_vendibility.coil_capacity = (capacity * item.weight_lbs) < (2 * HELIX_MAX_WEIGHT) ? capacity : Math.floor((2 * HELIX_MAX_WEIGHT) / item.weight_lbs)
    } else {
        coil_vendibility.coil_capacity = (capacity * item.weight_lbs) < HELIX_MAX_WEIGHT ? capacity : Math.floor((HELIX_MAX_WEIGHT) / item.weight_lbs)
    }

    //Calculate whether the item needs a riser
    if (Dimensions[0] <= item.SINGLE_HELIX_DIAMETER) {
        if (Dimensions[0] + RISER_PLATFORM_HEIGHT <= item.SINGLE_HELIX_DIAMETER) {
            coil_vendibility.coil_vendable = false;//If item is STILL to short, it's not vendable. 
        } else {
            coil_vendibility.riser_required = true;
        }
    } else coil_vendibility.riser_required = false;

    return coil_vendibility;
}

const getCarouselVendibility = (item) => {

    // Replace null values with any necessary calculations, function calls, etc. 
    let carousel_vendibility = {};

    carousel_vendibility = {
        carousel_vendable: carousel_vendibility.carousel_vendable || null,
        needs_repack_for_carousel: carousel_vendibility.needs_repack_for_carousel || null,
        num_slots_per_item: carousel_vendibility.num_slots_per_item || null,
        carousel_capacity: carousel_vendibility.carousel_capacity || null,
    };

    // Height, Depth, and Weight Limits
    const MAX_HEIGHT_INCH = 4.75;
    const RADIUS = 9.6;
    const MAX_WEIGHT_LBS = 35;

    let unusablePercentage;
    let sectionMaximumWidth;
    let currentCapacity = 0;

    // Array of widths for each section => [SECTION_NUMBER, FRONT_WIDTH_INCH, BACK_WIDTH_INCH]
    const sectionWidths = [
        [1, 1.2, 0],
        [2, 2.4, 0.19],
        [3, 3.6, 0.38],
        [4, 4.8, 0.56],
        [5, 6.0, 0.75],
        [6, 7.2, 0.94],
        [7, 8.4, 1.13],
        [8, 9.6, 1.32],
        [9, 10.8, 1.51],
        [10, 12, 1.70]
    ];

    // Sorts Dimensions from largest to smallest
    const Dimensions = [Number(item.width_inch), Number(item.length_inch), Number(item.height_inch)];
    Dimensions.sort((a, b) => { return b - a });

    const carouselCalculation = (height, width, depth, minimumSection) => {
        let temp = minimumSection;
        let sectionsUsed = 0;

        do {
            let totalDepth = Math.trunc(RADIUS / depth);
            let unusable = (RADIUS - totalDepth) / RADIUS;
            let maxWidth = sectionWidths[temp, 2] + (unusable * (sectionWidths[temp, 1] - sectionWidths[temp, 2]));
            let totalWidth = Math.trunc(maxWidth / width);

            if (item.stackable) {
                currentCapacity += Math.trunc(MAX_HEIGHT_INCH / height) * totalDepth * totalWidth;
            }

            else {
                currentCapacity += totalDepth * totalWidth;
            }

            sectionsUsed++;
            temp++;

        } while (temp < 10)

        carousel_vendibility.num_slots_per_item = sectionsUsed;
        return (item.weight_lbs * currentCapacity) > MAX_WEIGHT_LBS ? Math.floor(MAX_WEIGHT_LBS / item.weight_lbs) : currentCapacity;


    }

    // Determines whether item is vendable w/ carousel. Returns true or false.
    const isCarouselVendable = () => {
        if (item.weight_lbs < MAX_WEIGHT_LBS) {
            if (item.store_vertically) {
                // Determines if height is acceptable.
                if (item.height_inch < MAX_HEIGHT_INCH) {
                    // Makes sure all values are smaller than the largest width size.
                    if (Math.max(item.width_inch, item.length_inch) < sectionWidths[9, 1]) {

                        // Determines that max will be length and min will be width.
                        if (Math.max(item.width_inch, item.length_inch) < RADIUS) {
                            for (let i = 0; i < 7; i++) {
                                if (Math.min(item.width_inch) < sectionWidths[i, 1]) {
                                    unusablePercentage = (RADIUS - Math.max(item.width_inch, item.length_inch)) / RADIUS;
                                    sectionMaximumWidth = sectionWidths[i, 2] + (unusablePercentage * (sectionWidths[i, 1] - sectionWidths[i, 2]))
                                    if (Math.min(item.width_inch, item.length_inch) < sectionMaximumWidth) {
                                        carousel_capacity = carouselCalculation(item.height_inch, Math.min(item.width_inch, item.length_inch), Math.max(item.width_inch, item.length_inch), i);
                                        return true;
                                    } else return false;
                                }
                            }
                        }

                        // Min will be length and max will be width.
                        else {
                            // Makes sure length can fit.
                            if (Math.min(item.width_inch, item.length_inch) < RADIUS) {
                                for (let i = 7; i < 10; i++) {
                                    if (Math.max(item.width_inch, item.length_inch) < sectionWidths[i, 1]) {
                                        unusablePercentage = (RADIUS - Math.min(item.width_inch, item.length_inch)) / RADIUS;
                                        sectionMaximumWidth = sectionWidths[i, 2] + (unusablePercentage * (sectionWidths[i, 1] - sectionWidths[i, 2]));
                                        if (Math.max(item.width_inch, item.length_inch) < sectionMaximumWidth) {
                                            carousel_capacity = carouselCalculation(item.height_inch, Math.max(item.width_inch, item.length_inch), Math.min(item.width_inch, item.length_inch), i);
                                            return true;
                                        } else return false;
                                    }
                                }
                            } else return false;
                        }
                    } else return false;
                } else return false;
            }
            else {
                if (Dimensions[0] < sectionWidths[9, 1]) {

                    if (Dimensions[0] < RADIUS) {
                        if (Dimensions[1] < MAX_HEIGHT_INCH) {
                            // Checks Sections 1 - 4. D[0] will be depth, D[1] will be height, D[2] will be width.
                            for (let i = 0; i < 4; i++) {
                                if (Dimensions[2] < sectionWidths[i, 1]) {
                                    unusablePercentage = (RADIUS - Dimensions[0]) / RADIUS;
                                    sectionMaximumWidth = sectionWidths[i, 2] + (unusablePercentage * (sectionWidths[i, 1] - sectionWidths[i, 2]));
                                    if (Dimensions[2] < sectionMaximumWidth) {
                                        carousel_capacity = carouselCalculation(Dimensions[1], Dimensions[2], Dimensions[0], i);
                                        return true;
                                    } else return false;
                                }
                            }
                        }
                        else {
                            // Checks Sections 5- 7. D[0] will be depth, D[1] will be width.
                            // Making sure D[2] can be used as height.
                            if (Dimensions[2] < MAX_HEIGHT_INCH) {
                                for (let i = 4; i < 7; i++) {
                                    if (Dimensions[1] < sectionWidths[i, 1]) {
                                        unusablePercentage = (RADIUS - Dimensions[0]) / RADIUS;
                                        sectionMaximumWidth = sectionWidths[i, 2] + (unusablePercentage * (sectionWidths[i, 1] - sectionWidths[i, 2]));
                                        if (Dimensions[1] < sectionMaximumWidth) {
                                            carousel_capacity = carouselCalculation(Dimensions[2], Dimensions[1], Dimensions[0], i);
                                            return true;
                                        } else return false;
                                    }

                                }

                            } else return false;
                        }

                    }
                    else {
                        // Making sure the next two dimensions are the acceptable length/height;
                        if (Dimensions[1] < RADIUS) {
                            if (Dimensions[2] < MAX_HEIGHT_INCH) {
                                // Checks Sections 8 - 10. D[0] is width, D[1] is depth, D[2] is height.
                                for (let i = 7; i < 10; i++) {
                                    if (Dimensions[0] < sectionWidths[i, 1]) {
                                        unusablePercentage = (RADIUS - Dimensions[1]) / RADIUS;
                                        sectionMaximumWidth = sectionWidths[i, 2] + (unusablePercentage * (sectionWidths[i, 1] - sectionWidths[i, 2]));
                                        if (Dimensions[0] < sectionMaximumWidth) {
                                            carousel_capacity = carouselCalculation(Dimensions[2], Dimensions[0], Dimensions[1], i);
                                            return true;
                                        } else return false;
                                    }
                                }
                            } else return false;
                        } else return false;
                    }
                } else return false;
            }
        } else return false;
    }


    carousel_vendibility.carousel_vendable = isCarouselVendable();

    return carousel_vendibility;
}