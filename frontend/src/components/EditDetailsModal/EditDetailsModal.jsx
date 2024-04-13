import { useState } from "react";
import './EditDetailsModal.css';
import axios from 'axios';

// Modal component for editing details
const EditDetailsModal = ({ rowData, columnHeaders, onClose, fetchTableFromSessionID }) => {
    const [selectedFields, setSelectedFields] = useState([]); // State to store the selected field
    const [fieldChanges, setFieldChanges] = useState({});
    const [updatedFieldChanges, setUpdatedFieldChanges] = useState({});
    const [loading, setLoading] = useState(false); // State for loading indicator

    // Array to map each columnHeader to the way its field name is stored in MongoDB.
    // This allows for the API call "updateItem" to be formatted correctly.
    const fieldMappings = {
        "SKU(Item Number)*": "sku",
        "Item Description*": "item_description",
        "Manufacturer Part #": "manufacturer_part_num",
        "Item Manufacturer": "item_manufacturer",
        "Alt Item ID (SKU)": "alt_item_id",
        "Org. Local Part Number": "org_local_part_num",
        "All in one Point-Of-Use (POU), or Area": "point_of_use",
        "Demand Quantity *": "demand_quantity",
        "Demand Time-Window*": "demand_time_window",
        "Security Level": "security_level",
        "Overall vendability Y/N": "overall_vendability",
        "Vendability Notes": "vendability_notes",
        "$ Item Cost": "$_item_cost",
        "% Expected Gross Profit Margin": "%_expected_gross_profit_margin",
        "Height* inch": "height_inch",
        "Width* inch": "width_inch",
        "Length* inch": "length_inch",
        "Weight* lbl": "weight_lbs",
        "Heavy": "heavy",
        "Fragile": "fragile",
        "Default Issue Type (Unit)*": "default_issue_type",
        "Default Issue Qty (inside pk, bx, or cs)*": "default_issue_qty",
        "Stackable": "stackable",
        "Loose": "loose",
        "Store vertically": "store_vertically",
        "Preferred Machine Type": "preferred_machine_type",
        "Locker vendable   Y/N": "locker_vendability.locker_vendable",
        "# of Compartments per Locker Door (6 MAX)": "locker_vendability.num_compartments_per_locker_door",
        "Capacity for Express Locker": "locker_vendability.capacity_for_express_locker",
        "Capacity for ProStock Locker": "locker_vendability.capacity_for_prostock_locker",
        "Capacity for ProLock Locker": "locker_vendability.capacity_for_prolock_locker",
        "Carousel vendable Y/N": "carousel_vendability.carousel_vendable",
        "Needs repack for carousel  Y/N": "carousel_vendability.needs_repack_for_carousel",
        "# of Slots per Item (Max 10, Flex 14)": "carousel_vendability.num_slots_per_item",
        "Coil vendable Y/N": "coil_vendability.coil_vendable",
        "Needs repack for coil Y/N": "coil_vendability.needs_repack_for_coil",
        "Coil Pitch / Number of Items per Coil Row": "coil_vendability.coil_pitch",
        "Coil Type (SINGLE, V-CHANNEL, DUAL, LARGE)": "coil_vendability.coil_type",
        "Preferred Shelf (Any/Bottom)": "coil_vendability.preferred_shelf",
        "Preferred Row (Side/Middle/Any)": "coil_vendability.preferred_row",
        "Riser Required": "coil_vendability.riser_required",
        "Flip Bar Required": "coil_vendability.flip_bar_required",
        "Coil end “clock” position – 3, 6, 9, or 12 (Default is 6)": "coil_vendability.coil_end_clock_position",
        "Repacking Instructions PDF file url": "repacking_instructions_pdf_file_url",
        "Item Image URL": "item_image_url",
        "Repacked Image Url": "repacked_image_url"
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        const itemId = rowData[4];
        const sessionID = localStorage.getItem("solutionId");
        try {
            const response = await axios.post('http://localhost:5001/updateItem', {
                sessionId: parseInt(sessionID),
                itemId: itemId,
                updatedItem: updatedFieldChanges
            });
            onClose();
            console.log(response.data);
        } catch (error) {
            console.error('Error updating item:', error);
        } finally {
            setLoading(false); // Set loading state to false when API call ends
            fetchTableFromSessionID(sessionID);
        }
    }

    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedFields.includes(selectedValue)) {
            setSelectedFields(selectedFields.filter(field => field !== selectedValue)); // Deselect field if already selected
        } else {
            setSelectedFields([...selectedFields, selectedValue]); // Select field if not already selected
        }
    }

    const handleFieldChange = (e, field) => {
        const value = e.target.value;
        const fieldName = fieldMappings[field];

        setFieldChanges({
            ...fieldChanges,
            [field]: value
        });

        if (fieldName) {
            setUpdatedFieldChanges({
                ...updatedFieldChanges,
                [fieldName]: value
            });
        }
    }

    return (

        <div id="editModal" className="modal-container">
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div className="modal-content">
                    <h2 className='poppins-regular'
                        style={{
                            color: 'rgb(68, 167, 110)',
                            fontSize: '24px',
                            margin: '5%'

                        }}>
                        Edit Item Details
                    </h2>
                    <hr className='modal-line'></hr>
                    <div className="modal-form">
                        <h3 className='figtree-regular'
                            style={{
                                fontSize: '18px',
                                display: 'flex',
                                marginLeft: '15%',
                                padding: '2%',
                                color: 'rgb(20, 90, 50)'
                            }}
                        >
                            Chose field(s) to edit
                        </h3>
                        <div
                            style={{
                                maxHeight: "250px", maxWidth: "80%", marginLeft: "19.16%", marginRight: "19.16%", overflowY: "auto", display: "flex",
                                flexDirection: "column", alignItems: "center", backgroundColor: "white", border: "solid", borderColor: "rgb(20, 90, 50)", borderWidth: "1px"
                            }}
                        >
                            {columnHeaders.map((header, index) => (
                                <label key={index}
                                    style={{
                                        display: 'flex', flexDirection: "row", alignItems: "center", margin: '1px', cursor: 'pointer',
                                        backgroundColor: selectedFields.includes(header) ? 'rgb(68, 167, 110)' : 'lightgray',
                                        color: selectedFields.includes(header) ? 'white' : 'black', padding: '5px', borderRadius: '5px',
                                        width: "90%", textAlign: "left"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        value={header}
                                        checked={selectedFields.includes(header)}
                                        onChange={handleSelectChange}
                                        style={{
                                            display: "flex", flexShrink: "0", marginRight: '5px', cursor: 'pointer'
                                        }}
                                    />
                                    {header}
                                </label>
                            ))}
                        </div>
                        {selectedFields.length > 0 &&
                            <div
                                style={{
                                    maxHeight: "250px", maxWidth: "100%", overflowY: "auto", display: "flex",
                                    flexDirection: "column", alignItems: "center", backgroundColor: "white", border: "solid",
                                    borderColor: "rgb(20, 90, 50)", borderWidth: "1px", margin: "5%"
                                }}
                            >
                                {selectedFields.map((field, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '5px', width: "75%" }}>
                                        <label style={{ textAlign: "left", marginRight: '2%' }}>{field}:</label>
                                        <input
                                            style={{
                                                border: "solid", borderWidth: "1px", borderColor: "rgb(20, 90, 50)"
                                            }}
                                            type="text"
                                            value={fieldChanges[field] || ""}
                                            onChange={(e) => handleFieldChange(e, field)}
                                        />
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", padding: "3%" }}>
                        <button type='button'
                            style={{
                                backgroundColor: "rgb(68, 167, 110)",
                                justifyContent: "center", width: "24.7%", marginRight: "10%"
                            }}
                            onClick={handleSubmit}
                        >
                            Update
                        </button>
                        <button type='button' onClick={() => { onClose() }}
                            style={{ width: "24.7%", color: '#213547' }}
                        >
                            Cancel
                        </button>
                    </div>
                    {loading && <div>Updating...</div>}
                </div>
            </form>
        </div>
    );
};

export default EditDetailsModal;