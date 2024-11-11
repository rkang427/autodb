import axios from "axios";

const getVehicleDetails = async (vin) => {
  return await axios.get(`http://localhost:3000/vehicle?vin=${vin}`, {
    withCredentials: true,
  });
};

export default { getVehicleDetails };
