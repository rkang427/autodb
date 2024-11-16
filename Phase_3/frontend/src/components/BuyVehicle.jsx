import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import buyService from "../services/buy";
import axios from "axios";
import AddCustomerModal from "./AddCustomerModal";
import useAddCustomerModal from "./useAddCustomerModal";
import auth from "../services/auth";
import Select from 'react-select';

const vehicleTypes = ["Sedan", "Coupe", "Convertible", "CUV", "Truck", "Van", "Minivan", "SUV", "Other"];
const manufacturers = ["Acura", "FIAT", "Lamborghini", "Nio", "Alfa Romeo", "Ford", "Land Rover", "Porsche", "Aston Martin", "Geeley", "Lexus", "Ram", "Audi", "Genesis", "Lincoln", "Rivian", "Bentley", "GMC", "Lotus", "Rolls-Royce", "BMW", "Honda", "Maserati", "smart", "Buick", "Hyundai", "MAZDA", "Subaru", "Cadillac", "INFINITI", "McLaren", "Tesla", "Chevrolet", "Jaguar", "Mercedes-Benz", "Toyota", "Chrysler", "Jeep", "MINI", "Volkswagen", "Dodge", "Karma", "Mitsubishi", "Volvo", "Ferrari", "Kia", "Nissan", "XPeng"];
const fuelTypes = ["Gas", "Diesel", "Natural Gas", "Hybrid", "Plugin Hybrid", "Battery", "Fuel Cell"];
const conditions = ["Excellent", "Very Good", "Good", "Fair"];
const colorsList = [
  'Aluminum', 'Beige', 'Black', 'Blue', 'Brown', 'Bronze', 'Claret', 'Copper',
  'Cream', 'Gold', 'Gray', 'Green', 'Maroon', 'Metallic', 'Navy', 'Orange',
  'Pink', 'Purple', 'Red', 'Rose', 'Rust', 'Silver', 'Tan', 'Turquoise', 'White', 'Yellow'
];

const Dropdown = ({ label, name, options, value, onChange, placeholder = "Select...", isMulti = false }) => {
  const selectOptions = options.map((option) => ({ value: option, label: option }));

  const selectedOption = isMulti
    ? selectOptions.filter((option) => value.includes(option.value))
    : selectOptions.find((option) => option.value === value);

  return (
    <div style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>
      <label 
        htmlFor={name} 
        style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
      >
        {label}
      </label>
      <Select
        inputId={name}
        name={name}
        value={selectedOption}
        options={selectOptions}
        onChange={(selected) => onChange({ 
          target: { 
            name, 
            value: isMulti ? selected.map(opt => opt.value) : selected ? selected.value : "" 
          } 
        })}
        placeholder={placeholder}
        isClearable
        isSearchable
        isMulti={isMulti}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: '#ccc',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'border-color 0.3s ease',
          }),
        }}
      />
    </div>
  );
};

const BuyVehicle = () => {
  const { vin } = useParams();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customerTaxId, setCustomerTaxId] = useState(null);
  const [lookupCustomerTaxId, setLookupCustomerTaxId] = useState("");
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        if (response.data.user) {
          setLoggedInUser(response.data.user);
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
  const handleBuyVehicle = async (e) => {
    e.preventDefault();

    // Ensure VIN is valid
    const validateVIN = (vin) => vin.length === 17 && !vin.includes(" ");
    if (!validateVIN(vehicleDetails.vin)) {
      return alert("VIN must be 17 characters long and cannot contain spaces.");
    }

    const currentYear = new Date().getFullYear();
    if (vehicleDetails.model_year > currentYear + 1) {
      alert("Model year must be within the current year or the next year.");
      return;
    }
    if (vehicleDetails.model_year < 1000 || vehicleDetails.model_year > 9999) {
      alert("Model year must include the full century digits (e.g., 2020).");
      return;
    }

      // Ensure all required fields are filled
    if (!vehicleDetails.vehicle_type || !vehicleDetails.manufacturer || !vehicleDetails.condition) {
      return alert("Please fill in all the required fields.");
    }
      
    if (!customerTaxId) return alert("Please add a customer before buying.");
  
    const updatedVehicleDetails = {
      ...vehicleDetails,
      customer_seller: customerTaxId,
      inventory_clerk: loggedInUser?.username
    };
  
    try {
      await buyService.addVehicleToInventory(updatedVehicleDetails);
      setPurchaseStatus("Vehicle successfully added to inventory.");
      setVehicleBought(true);
    } catch (error) {
      console.log("Error purchasing vehicle:", error);
      setPurchaseStatus("Failed to add vehicle to inventory.");
      if (error.response && error.response.data.errors) {
        // Display errors returned from the backend
        alert(error.response.data.errors.map((err) => err.msg).join(", "));
      }
    }
  };

  return (
    <>
      {loggedInUser && (loggedInUser.user_type === "inventory_clerk" || loggedInUser.user_type === "owner") ? (
        <div>
          <h2>Buy Vehicle</h2>
          <Link to="/">Go back to main page</Link>

          <div>
            {customerTaxId ? <p>Customer Tax ID: {customerTaxId}</p> : <p>No customer selected.</p>}
            <form onSubmit={handleLookupCustomerClick}>
              <div>
                <label>Look up existing customer by SSN/TIN:</label>
                <input
                  type="text"
                  value={lookupCustomerTaxId}
                  onChange={(e) => setLookupCustomerTaxId(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Search Existing Customers</button>
            </form>
          </div>

          <div>
            <button onClick={handleAddCustomerClick}>Add Customer</button>

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
          <input
              type="text"
              name="vin"
              placeholder="VIN"
              onChange={handleInputChange}
              value={vehicleDetails.vin}
              maxLength={17} // Restrict input to 17 characters
            />

            {/* Vehicle Type Dropdown */}
            <Dropdown
              label="Vehicle Type"
              name="vehicle_type"
              options={vehicleTypes}
              value={vehicleDetails.vehicle_type}
              onChange={handleInputChange}
            />

            {/* Manufacturer Dropdown */}
            <Dropdown
              label="Manufacturer"
              name="manufacturer"
              options={manufacturers}
              value={vehicleDetails.manufacturer}
              onChange={handleInputChange}
            />

            {/* Fuel Type Dropdown */}
            <Dropdown
              label="Fuel Type"
              name="fuel_type"
              options={fuelTypes}
              value={vehicleDetails.fuel_type}
              onChange={handleInputChange}
            />

            {/* Condition Dropdown */}
            <Dropdown
              label="Condition"
              name="condition"
              options={conditions}
              value={vehicleDetails.condition}
              onChange={handleInputChange}
            />

            {/* Color Dropdown */}
            <Dropdown
              label="Color"
              name="color"
              options={colorsList}
              value={vehicleDetails.colors}
              onChange={handleColorChange}
              isMulti={true}
            />

            {/* Other Inputs */}
            <input type="text" name="model" placeholder="Model" onChange={handleInputChange} value={vehicleDetails.model} />
            <input type="number" name="horsepower" placeholder="Horsepower" onChange={handleInputChange} value={vehicleDetails.horsepower} />
            <input type="number" name="purchase_price" placeholder="Purchase Price" onChange={handleInputChange} value={vehicleDetails.purchase_price} />
            <input type="text" name="description" placeholder="Description" onChange={handleInputChange} value={vehicleDetails.description} />
            <input type="number" name="model_year" placeholder="Model Year" onChange={handleInputChange} value={vehicleDetails.model_year} />
            
          </form>

          {/* Buy Vehicle Button */}
          <button type="submit" onClick={handleBuyVehicle} disabled={vehicleBought}>Add Vehicle to Inventory</button>

          {/* Purchase Status Message */}
          {purchaseStatus && <p>{purchaseStatus}</p>}
        </div>
      ) : (
        <h2>Forbidden</h2>
      )}
    </>
  );
};

export default BuyVehicle;
