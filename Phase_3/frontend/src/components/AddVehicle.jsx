import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const [purchaseStatus, setPurchaseStatus] = useState(null);  // Track purchase status
  const [vehicleBought, setVehicleBought] = useState(false);  // Track if vehicle is bought
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        console.log(response.data.user);
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
        try {
          const response2 = await axios.get("http://localhost:3000/customer/list/", { withCredentials: true });
          console.log(response2.data)
          setCustomerList(response2.data);
          console.log(customerList)
        } catch (customerError) {
          console.error("Error fetching customers:", customerError);
          setErrorMessage("Could not load customers.");
        }
      } catch (error) {
        console.log("Error checking session", error);
      }
    };
    checkSession();
  }, []);

  const {
    isAddCustomerModalOpen,
    openAddCustomerModal,
    closeAddCustomerModal,
    form,
    handleChange,
    handleRadioChange,
    handleSubmit,
    error,
  } = useAddCustomerModal();

  const handleAddCustomerClick = () => {
    openAddCustomerModal(); // Open add customer modal
  };

  const handleLookupCustomerClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:3000/customer", {
        params: { tax_id: lookupCustomerTaxId },
        withCredentials: true
      });
      if (response.data && response.data.tax_id) {
        setCustomerTaxId(response.data.tax_id); // Set customer tax ID received from the lookup
      } else {
        alert("Customer not found. Please add a new customer.");
      }
    } catch (error) {
      console.log("Error looking up customer:", error);
      alert("Customer wasn't found. Please try again.");
    }
  };

  // Receive the customer tax ID from the modal
  const handleCustomerTaxIdReceived = (taxId) => {
    console.log("Customer Tax ID received from modal:", taxId);
    setCustomerTaxId(taxId);
  };

  // Handle vehicle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate model year to allow only up to 4 digits
    if (name === "model_year") {
      const yearValue = value.replace(/\D/g, ""); // Remove non-digit characters
      if (yearValue.length > 4) {
        return; // Prevent further input if more than 4 digits
      }
      setVehicleDetails((prev) => ({
        ...prev,
        [name]: yearValue, // Update with the valid year
      }));
      return;
    }

    // Convert to numbers where required
    setVehicleDetails((prev) => ({
      ...prev,
      [name]: name === "horsepower" || name === "purchase_price" ? parseFloat(value) : value
    }));
  };

  const handleColorChange = (e) => {
    setVehicleDetails((prev) => ({
      ...prev,
      colors: e.target.value,
    }));
  };

  // Handle the buy vehicle operation
  const handleAddVehicle = async (e) => {
    e.preventDefault();

    // VIN validation
    if (!vehicleDetails.vin) {
      return alert("Please type a VIN.");
    }
    if (vehicleDetails.vin.length !== 17 || vehicleDetails.vin.includes(" ")) {
      return alert("VIN must be exactly 17 characters long and cannot contain spaces.");
    }

    // Vehicle type validation
    if (!vehicleTypes.includes(vehicleDetails.vehicle_type)) {
      return alert("Please select a vehicle type.");
    }

    // Manufacturer validation
    if (!manufacturers.includes(vehicleDetails.manufacturer)) {
      return alert("Please select a manufacturer.");
    }

    // Fuel type validation
    if (!fuelTypes.includes(vehicleDetails.fuel_type)) {
      return alert("Please select a fuel type.");
    }

    // Condition validation
    if (!vehicleDetails.condition) {
      return alert("Please select a vehicle condition.");
    }

    // Colors validation
    if (!vehicleDetails.colors || vehicleDetails.colors.length === 0) {
      return alert("Please select at least one color for the vehicle.");
    }

    // Model validation
    if (!vehicleDetails.model) {
      return alert("Please type a model.");
    } 
    if (vehicleDetails.model.length > 120) {
      return alert("Model must be between 1 and 120 characters long.");
    }

    // Horsepower validation
    if (vehicleDetails.horsepower === undefined || vehicleDetails.horsepower === null || vehicleDetails.horsepower === "") {
      return alert("Please type a horsepower.");
    }
    if (vehicleDetails.horsepower <= 0 || vehicleDetails.horsepower > 32767 || !Number.isInteger(vehicleDetails.horsepower)) {
      return alert("Horsepower must be an integer between 1 and 32,767, inclusive of both limits.");
    }

    // Purchase price validation
    if (vehicleDetails.purchase_price === undefined || vehicleDetails.purchase_price === null || vehicleDetails.purchase_price === "") {
      return alert("Please type a purchase price.");
    }
    if (isNaN(vehicleDetails.purchase_price) || parseFloat(vehicleDetails.purchase_price) <= 0) {
      return alert("Purchase price must be a positive number.");
    }

    // Description validation
    if (vehicleDetails.description && vehicleDetails.description.length > 280) {
      return alert("Description must not exceed 280 characters.");
    }
  
    // Model year validation
    const currentYear = new Date().getFullYear();
    if (!vehicleDetails.model_year) {
      return alert("Please type a model year.");
    }
    if (vehicleDetails.model_year > currentYear + 1) {
      alert(`Model year must be less than or equal to ${currentYear + 1}`);
      return;
    }
    if (vehicleDetails.model_year < 1000 || vehicleDetails.model_year > 9999) {
      alert("Model year must include the full century digits (e.g., 2020).");
      return;
    }
    
    // Customer Seller Tax ID validation
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
      // NAVIGATE TO DETAIL PAGE ON SUCCESS
      navigate(`/vehicle_detail/${vehicleDetails.vin}`);  // Redirect upon successful submission
    } catch (error) {
      console.log("back in Add Vehicle page", error);
      console.log(Object.values(error)[0]);
      if (error.response && error.response.data.errors) {
        // Display errors returned from the backend
        setTimeout(() => {
          setPurchaseStatus(null)
        }, 3000);
        setPurchaseStatus(error.response.data.errors.map((err) => err.msg).join(", "));
        alert(error.response.data.errors.map((err) => err.msg).join(", "));
      } else {
        setPurchaseStatus(Object.values(error)[0]);
      }
    }
  };

  return (
    <>
      {loggedInUser && (loggedInUser.user_type === "inventory_clerk" || loggedInUser.user_type === "owner") ? (
        <div>
          <h2>Add Vehicle</h2>
          <Link to="/">Go back to main page</Link>

          <div>
            {customerTaxId ? <p>Customer Tax ID: {customerTaxId}</p> : <p>No customer selected.</p>}
            <Dropdown
              label="Existing Customers"
              name="customer"
              options={customerList.map((customer) => (`${customer.tax_id} -- ${customer.name}`))}
              value={customerTaxId}
              onChange={(e) => setCustomerTaxId(e.target.value.split(' ')[0])}
            />
          </div>

          <div>
            <button style={{border: "1px solid black"}} onClick={handleAddCustomerClick}>Add New Customer</button>

            {/* Conditionally render the Add Customer modal */}
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

          {/* Vehicle Details Form */}
          <form>
            <div style={{ marginTop: "10px", marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="vin" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                VIN <span style={{ color: "red" }}>*</span>
              </label>
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
            label={
              <>
                Vehicle Type <span style={{ color: "red" }}>*</span>
              </>
            }
              name="vehicle_type"
              options={vehicleTypes}
              value={vehicleDetails.vehicle_type}
              onChange={handleInputChange}
            />

            <div style={{ marginBottom: "10px" }}>
              <Dropdown
                label={
                  <>
                    Manufacturer <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="manufacturer"
                options={manufacturers}
                value={vehicleDetails.manufacturer}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <Dropdown
                label={
                  <>
                    Fuel Type <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="fuel_type"
                options={fuelTypes}
                value={vehicleDetails.fuel_type}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <Dropdown
                label={
                  <>
                    Condition <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="condition"
                options={conditions}
                value={vehicleDetails.condition}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <Dropdown
                label={
                  <>
                    Color <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="color"
                options={colorsList}
                value={vehicleDetails.colors}
                onChange={handleColorChange}
                isMulti={true}
              />
            </div>

            <div style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="model" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                Model <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="model"
                name="model"
                placeholder="Enter Model"
                onChange={handleInputChange}
                value={vehicleDetails.model}
              />
            </div>

            <div style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="horsepower" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                Horsepower <span style={{ color: "red" }}>*</span>
              </label>
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

            <div style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="purchase_price" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                Purchase Price <span style={{ color: "red" }}>*</span>
              </label>
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

            <div style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="description" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="Enter Description"
                onChange={handleInputChange}
                value={vehicleDetails.description}
              />
            </div>

            <div style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
              <label 
                htmlFor="model_year" 
                style={{ display: "block", fontWeight: "bold" }}
              >
                Model Year <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                id="model_year"
                name="model_year"
                min="1000"
                max={new Date().getFullYear()}
                placeholder="Enter Model Year"
                onChange={handleInputChange}
                value={vehicleDetails.model_year}
              />
            </div>
          </form>
          {/* Buy Vehicle Button */}
          <button style={{border: "1px solid black"}} type="submit" onClick={handleAddVehicle}>Add Vehicle to Inventory</button>

          {/* Purchase Status Message */}
          {purchaseStatus && <p>{purchaseStatus}</p>}
        </div>
      ) : (
        <h2>Forbidden</h2>
      )}
    </>
  );
};

export default AddVehicle;
