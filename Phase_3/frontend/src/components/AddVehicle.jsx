import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import buyService from "../services/buy";
import axios from "axios";
import AddCustomerModal from "./AddCustomerModal";
import useAddCustomerModal from "./useAddCustomerModal";
import auth from "../services/auth";
import Dropdown from "./Dropdown";

const vehicleTypes = ["Sedan", "Coupe", "Convertible", "CUV", "Truck", "Van", "Minivan", "SUV", "Other"];
const manufacturers = ["Acura", "FIAT", "Lamborghini", "Nio", "Alfa Romeo", "Ford", "Land Rover", "Porsche", "Aston Martin", "Geeley", "Lexus", "Ram", "Audi", "Genesis", "Lincoln", "Rivian", "Bentley", "GMC", "Lotus", "Rolls-Royce", "BMW", "Honda", "Maserati", "smart", "Buick", "Hyundai", "MAZDA", "Subaru", "Cadillac", "INFINITI", "McLaren", "Tesla", "Chevrolet", "Jaguar", "Mercedes-Benz", "Toyota", "Chrysler", "Jeep", "MINI", "Volkswagen", "Dodge", "Karma", "Mitsubishi", "Volvo", "Ferrari", "Kia", "Nissan", "XPeng"];
const fuelTypes = ["Gas", "Diesel", "Natural Gas", "Hybrid", "Plugin Hybrid", "Battery", "Fuel Cell"];
const conditions = ["Excellent", "Very Good", "Good", "Fair"];
const colorsList = [
  'Aluminum', 'Beige', 'Black', 'Blue', 'Brown', 'Bronze', 'Claret', 'Copper',
  'Cream', 'Gold', 'Gray', 'Green', 'Maroon', 'Metallic', 'Navy', 'Orange',
  'Pink', 'Purple', 'Red', 'Rose', 'Rust', 'Silver', 'Tan', 'Turquoise', 'White', 'Yellow'
];

const AddVehicle = () => {
  const { vin } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customerTaxId, setCustomerTaxId] = useState(null);
  const [lookupCustomerTaxId, setLookupCustomerTaxId] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({
    vin: vin || "",
    vehicle_type: "",
    manufacturer: "",
    model: "",
    fuel_type: "",
    colors: [],
    horsepower: "",
    purchase_price: "",
    description: "",
    model_year: "",
    condition: "",
  });
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [vehicleBought, setVehicleBought] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
        const customerResponse = await axios.get("http://localhost:3000/customer/list/", { withCredentials: true });
        setCustomerList(customerResponse.data);
      } catch (error) {
        console.log("Error checking session or fetching customers", error);
      }
    };
    checkSession();
  }, []);

  const { isAddCustomerModalOpen, openAddCustomerModal, closeAddCustomerModal, form, handleChange, handleRadioChange, handleSubmit, error } = useAddCustomerModal();

  const handleAddCustomerClick = () => openAddCustomerModal();
  const handleLookupCustomerClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:3000/customer", { params: { tax_id: lookupCustomerTaxId }, withCredentials: true });
      if (response.data && response.data.tax_id) {
        setCustomerTaxId(response.data.tax_id);
      } else {
        alert("Customer not found. Please add a new customer.");
      }
    } catch (error) {
      console.log("Error looking up customer:", error);
      alert("Customer wasn't found. Please try again.");
    }
  };

  const handleCustomerTaxIdReceived = (taxId) => {
    console.log(taxId)
    setCustomerTaxId(taxId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "model_year") {
      const yearValue = value.replace(/\D/g, "");
      if (yearValue.length > 4) return;
      setVehicleDetails((prev) => ({ ...prev, [name]: yearValue }));
      return;
    }
    setVehicleDetails((prev) => ({
      ...prev,
      [name]: name === "horsepower" || name === "purchase_price" ? parseFloat(value) : value
    }));
  };

  const handleGoBack = () => navigate(-1);

  const handleColorChange = (e) => {
    setVehicleDetails((prev) => ({ ...prev, colors: e.target.value }));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleDetails.vin) return alert("Please type a VIN.");
    if (vehicleDetails.vin.length !== 17 || vehicleDetails.vin.includes(" ")) return alert("VIN must be exactly 17 characters long and cannot contain spaces.");
    if (!vehicleTypes.includes(vehicleDetails.vehicle_type)) return alert("Please select a vehicle type.");
    if (!manufacturers.includes(vehicleDetails.manufacturer)) return alert("Please select a manufacturer.");
    if (!fuelTypes.includes(vehicleDetails.fuel_type)) return alert("Please select a fuel type.");
    if (!vehicleDetails.condition) return alert("Please select a vehicle condition.");
    if (!vehicleDetails.colors || vehicleDetails.colors.length === 0) return alert("Please select at least one color for the vehicle.");
    if (!vehicleDetails.model) return alert("Please type a model.");
    if (vehicleDetails.model.length > 120) return alert("Model must be between 1 and 120 characters long.");
    if (vehicleDetails.horsepower <= 0 || vehicleDetails.horsepower > 32767 || !Number.isInteger(vehicleDetails.horsepower)) return alert("Horsepower must be an integer between 1 and 32,767.");
    if (vehicleDetails.purchase_price <= 0 || isNaN(vehicleDetails.purchase_price)) return alert("Purchase price must be a positive number.");
    if (vehicleDetails.description && vehicleDetails.description.length > 280) return alert("Description must not exceed 280 characters.");
    
    const currentYear = new Date().getFullYear();
    if (!vehicleDetails.model_year) return alert("Please type a model year.");
    if (vehicleDetails.model_year > currentYear + 1) return alert(`Model year must be less than or equal to ${currentYear + 1}`);
    if (vehicleDetails.model_year < 1000 || vehicleDetails.model_year > 9999) return alert("Model year must include the full century digits (e.g., 2020).");
    if (!customerTaxId) return alert("Please add a customer before buying.");

    const updatedVehicleDetails = {
      ...vehicleDetails,
      customer_seller: customerTaxId,
      inventory_clerk: loggedInUser?.username
    };

    try {
      const response = await buyService.addVehicleToInventory(updatedVehicleDetails);
      setPurchaseStatus("Vehicle successfully added to inventory.");
      setVehicleBought(true);
      navigate(`/vehicle_detail/${vehicleDetails.vin}`);
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data.errors?.map((err) => err.msg).join(", ") || error.message;
      setPurchaseStatus(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <>
      {loggedInUser && (loggedInUser.user_type === "inventory_clerk" || loggedInUser.user_type === "owner") ? (
        <div>
          <h2>Add Vehicle</h2>
          <button onClick={handleGoBack} className="back-button">Go Back</button>

          <div>
            {customerTaxId ? <p>Customer Tax ID: {customerTaxId}</p> : <p>No customer selected.</p>}
            <Dropdown
              label="Existing Customers"
              name="customer"
              options={customerList.map((customer) => (`${customer.tax_id} -- ${customer.name}`))}
              value={customerTaxId}
              onChange={(e) => e.target.value.split(' ')[0] && setCustomerTaxId(e.target.value.split(' ')[0])}
            />
          </div>

          <div>
            <button onClick={handleAddCustomerClick}>Add New Customer</button>
            {isAddCustomerModalOpen && (
              <AddCustomerModal
                closeAddCustomerModal={closeAddCustomerModal}
                form={form}
                handleChange={handleChange}
                handleRadioChange={handleRadioChange}
                handleSubmit={handleSubmit}
                isAddCustomerModalOpen={isAddCustomerModalOpen}
                onCustomerTaxIdReceived={handleCustomerTaxIdReceived}
                error={error}
              />
            )}
          </div>

          <form>
            <div>
              <label htmlFor="vin">VIN <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                id="vin"
                name="vin"
                placeholder="Enter VIN"
                maxLength={17}
                onChange={handleInputChange}
                value={vehicleDetails.vin}
              />
            </div>

            <Dropdown
              label="Vehicle Type *"
              name="vehicle_type"
              options={vehicleTypes}
              value={vehicleDetails.vehicle_type}
              onChange={handleInputChange}
            />
            <Dropdown
              label="Manufacturer *"
              name="manufacturer"
              options={manufacturers}
              value={vehicleDetails.manufacturer}
              onChange={handleInputChange}
            />
            <Dropdown
              label="Fuel Type *"
              name="fuel_type"
              options={fuelTypes}
              value={vehicleDetails.fuel_type}
              onChange={handleInputChange}
            />
            <Dropdown
              label="Condition *"
              name="condition"
              options={conditions}
              value={vehicleDetails.condition}
              onChange={handleInputChange}
            />
            <Dropdown
              label="Color *"
              name="color"
              options={colorsList}
              value={vehicleDetails.colors}
              onChange={handleColorChange}
              isMulti={true}
            />

            <div>
              <label htmlFor="model">Model <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                id="model"
                name="model"
                placeholder="Enter Model"
                onChange={handleInputChange}
                value={vehicleDetails.model}
              />
            </div>

            <div>
              <label htmlFor="horsepower">Horsepower <span style={{ color: "red" }}>*</span></label>
              <input
                type="number"
                id="horsepower"
                name="horsepower"
                min={1}
                placeholder="Enter Horsepower"
                onChange={handleInputChange}
                value={vehicleDetails.horsepower}
              />
            </div>

            <div>
              <label htmlFor="purchase_price">Purchase Price <span style={{ color: "red" }}>*</span></label>
              <input
                type="number"
                id="purchase_price"
                min={1}
                name="purchase_price"
                placeholder="Enter Purchase Price"
                onChange={handleInputChange}
                value={vehicleDetails.purchase_price}
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="Enter Description"
                onChange={handleInputChange}
                value={vehicleDetails.description}
              />
            </div>

            <div>
              <label htmlFor="model_year">Model Year <span style={{ color: "red" }}>*</span></label>
              <input
                type="number"
                id="model_year"
                name="model_year"
                min={1000}
                max={Number(new Date().getFullYear() + 1)}
                placeholder="Enter Model Year"
                onChange={handleInputChange}
                value={vehicleDetails.model_year}
              />
            </div>
          </form>

          <button type="submit" onClick={handleAddVehicle}>Add Vehicle to Inventory</button>

          {purchaseStatus && <p>{purchaseStatus}</p>}
        </div>
      ) : (
        <></>
      )}

      <style jsx>{`
        button {
          background-color: #45a049;
          border: none;
          color: white;
          padding: 10px 22px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 5px;
        }

        button:hover {
          background-color: #3498db;
        }

        .back-button {
          background-color: #45a049;
        }

        .back-button:hover {
          background-color: #3498db;
        }
      `}</style>
    </>
  );
};

export default AddVehicle;
