import axios from "axios";

// Adds a vehicle to inventory and links it to the customer who sold it
const addVehicleToInventory = async (vehicleDetails) => {
  try {
    console.log(`Sending POST request to add vehicle to inventory with details:`, vehicleDetails);
    console.log("Request Payload:", JSON.stringify(vehicleDetails, null, 2));
    const response = await axios.post(
      `http://localhost:3000/vehicle/`,
      { ...vehicleDetails }, // Including all vehicle details and status
      { withCredentials: true }
    );
    console.log('Vehicle successfully added to inventory:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error adding vehicle to inventory:", error.response.data.errors[0].msg);
    throw error;
  }
};

const buyService = { addVehicleToInventory };
export default buyService;
