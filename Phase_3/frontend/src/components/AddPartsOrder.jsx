import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Dropdown from "./Dropdown";

const AddPartsOrder = () => {
  const { vin } = useParams();  // Extract VIN from the URL
  const [vendorList, setVendorList] = useState([]);
  const [vendor_name, setVendorName] = useState("");
  const [parts, setParts] = useState([{ part_number: "", description: "", quantity: 1, unit_price: 0.01 }]);
  const [showAddVendorForm, setShowAddVendorForm] = useState(false); // Toggle for showing inline vendor form
  const [newVendor, setNewVendor] = useState({ name: "", phone_number: "", street: "", city: "", state: "", postal_code: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch existing vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:3000/vendor/", { withCredentials: true });
        setVendorList(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setErrorMessage("Could not load vendors.");
      }
    };
    fetchVendors();
  }, []);

  const partsReady = () => {
    for (let index = 0; index < parts.length; index++) {
      const element = parts[index]
      if (!element.description || element.description === ""){
        return false;
      }
      if (!element.part_number || element.part_number === ""){
        return false;
      }
    }
    return true;
  }

  const popLastPart = () => {
    if (parts.length > 1) {
      const newParts = parts.slice(0, parts.length - 1);
      setParts(newParts);
    }
  }; 

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...parts];
    console.log(`${index}, ${field}, ${value}`);
    if (field === 'quantity'){
      if (!value || value <= 0){
        value = 1;
      }
    }
    if (field === 'unit_price'){
      if (!value || value <= 0){
        value = 0.01;
      }
    }
    updatedParts[index][field] = value;
    setParts(updatedParts);
  };

  const addPartField = () => {
    setParts([...parts, { part_number: "", description: "", quantity: 1, unit_price: 0.01 }]);
  };

  const handleNewVendorChange = (field, value) => {
    setNewVendor({ ...newVendor, [field]: value });
  };

  const handleAddVendor = async () => {
    try {
      const response = await axios.post("http://localhost:3000/vendor", newVendor, { withCredentials: true });
      setVendorList([...vendorList, response.data]); // Update vendor list with new vendor
      setVendorName(newVendor.name); // Set the new vendor as the selected vendor
      setShowAddVendorForm(false); // Hide add vendor form
      setSuccessMessage("Vendor added successfully!");
    } catch (error) {
      if (error.status == 409){
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        setErrorMessage("Vendor already exists!.");
      } else {
        console.error("Error adding vendor:", error);
        setErrorMessage("Failed to add vendor. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page refresh
    setErrorMessage(""); // Clear any previous error message
    setSuccessMessage(""); // Clear any previous success message

    try {
      // Logging the data before sending the request for debugging
      console.log("Submitting Parts Order:", { vin, vendor_name, parts });

      // Send the parts order data, including VIN
      const response = await axios.post(
        "http://localhost:3000/partsorder",
        { vin, vendor_name, parts },
        { withCredentials: true }
      );

      // Log the response to ensure the backend returned something
      console.log("Parts Order Submitted Successfully:", response);

      setSuccessMessage("Parts order created successfully!");
      navigate(`/vehicle_detail/${vin}`);  // Redirect upon successful submission
    } catch (error) {
      console.error("Error creating parts order:", error);
      
      // Set an error message based on whether the backend returned an error
      setErrorMessage(
        error.response?.data?.message || "Failed to create parts order. Please try again."
      );
    }
  };

  const handleGoBack = () => {
    navigate(-1);  
  };
  // Validation function to check if all required fields are filled and valid
  const isVendorFormValid = () => {
    const { name, phone_number, street, city, state, postal_code } = newVendor;

    // Check for required fields and valid formats
    const phoneValid = /^\d{10}$/.test(phone_number);
    const postalCodeValid = /^\d{5}$/.test(postal_code);

    return (
      name &&
      phone_number &&
      phoneValid &&
      street &&
      city &&
      state &&
      postal_code &&
      postalCodeValid
    );
  };

  return (
    <div>
      <div>
        <h2 style={{ marginBottom: 0 }}>Add Parts Order</h2>
        <button style={{ marginTop: 0, marginBottom: "1rem", border: "1px solid black" }} onClick={handleGoBack}>Go Back</button>
      </div>
      
      {/* Vendor Selection */}
      <Dropdown
        label="Select Vendor"
        name="vendor"
        options={vendorList.map((vendor) => vendor.name)}
        value={vendor_name}
        onChange={(e) => setVendorName(e.target.value)}
        placeholder="Select a vendor"
      />
      <button type="button" onClick={() => setShowAddVendorForm(!showAddVendorForm)}>
        {showAddVendorForm ? "Cancel adding vendor" : "Add New Vendor"}
      </button>

      {/* Inline Add Vendor Form */}
      {showAddVendorForm && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h3>Add New Vendor</h3>
          <input 
            type="text"
            placeholder="Vendor Name"
            value={newVendor.name}
            maxLength={120}
            minLength={1}
            required onChange={(e) => handleNewVendorChange("name", e.target.value)}
            />
          <input 
            type="text"
            placeholder="Phone Number"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
            }}
            value={newVendor.phone_number} required pattern="\d{10}" maxLength={10} minLength={10} onChange={(e) => handleNewVendorChange("phone_number", e.target.value)} />
          <input type="text" placeholder="Street" value={newVendor.street} maxLength={120} required minLength={1} onChange={(e) => handleNewVendorChange("street", e.target.value)} />
          <input type="text" placeholder="City" value={newVendor.city} maxLength={120} required minLength={1} onChange={(e) => handleNewVendorChange("city", e.target.value)} />
          <input type="text" placeholder="State" value={newVendor.state} maxLength={120} required minLength={1} onChange={(e) => handleNewVendorChange("state", e.target.value)} />
          <input
            type="text"
            placeholder="Postal Code"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
            }}
            value={newVendor.postal_code}
            required pattern="\d{5}"
            maxLength={5} minLength={5}
            onChange={(e) => handleNewVendorChange("postal_code", e.target.value)}
          />
          {isVendorFormValid() && <button type="button" onClick={handleAddVendor}>Save Vendor</button>}
        </div>
      )}

      {/* Parts Order Fields */}
      <h3>Parts</h3>
      {parts.map((part, index) => (
        <div key={index}>
          <input type="text" placeholder="Part Number" value={part.part_number} onChange={(e) => handlePartChange(index, "part_number", e.target.value)} />
          <input type="text" placeholder="Description" value={part.description} onChange={(e) => handlePartChange(index, "description", e.target.value)} />
          <input type="number" min={1} placeholder="Quantity" value={part.quantity} onChange={(e) => handlePartChange(index, "quantity", parseInt(e.target.value))} />
          <input type="number" min={0.01} placeholder="Unit Price" value={part.unit_price} onChange={(e) => handlePartChange(index, "unit_price", parseFloat(e.target.value))} />
        </div>
      ))}
      <button type="button" onClick={addPartField}>Add Another Part</button>
      {parts.length > 1 &&
      <button type="button" onClick={popLastPart}>Remove Last Part</button>
      }

      {/* Submit Order */}
      {vendor_name !== "" && partsReady() &&
      <button type="submit" onClick={handleSubmit}>Submit Parts Order</button>
      }
      {/* Success/Error Messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default AddPartsOrder;