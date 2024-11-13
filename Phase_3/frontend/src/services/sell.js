import axios from "axios";

// Updates vehicle status to 'sold' and links to customer
const sellVehicle = async (vin, customerTaxId) => {
  try {
    console.log(`Sending PATCH request to sell vehicle with VIN: ${vin} and Customer Tax ID: ${customerTaxId}`);
    const response = await axios.patch(
      `http://localhost:3000/vehicle/`,
      { customer_buyer: customerTaxId, vin: vin },
      { withCredentials: true }
    );
    console.log('Vehicle sold successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error selling vehicle:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    throw new Error(error.response?.data?.message || "Failed to sell vehicle. Please try again.");
  }
};

const sellService = { sellVehicle };
export default sellService;
