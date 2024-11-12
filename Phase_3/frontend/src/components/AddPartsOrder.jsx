import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AddPartsOrder = () => {
  const { vin } = useParams();  // Extract VIN from the URL
  const [vendorList, setVendorList] = useState([]);
  const [vendor_name, setVendorName] = useState("");
  const [parts, setParts] = useState([{ part_number: "", description: "", quantity: 0, unit_price: 0 }]);
  const [showAddVendorForm, setShowAddVendorForm] = useState(false); // Toggle for showing inline vendor form
  const [newVendor, setNewVendor] = useState({ name: "", phone_number: "", street: "", city: "", state: "", postal_code: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch existing vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:3000/vendor", { withCredentials: true });
        setVendorList(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setErrorMessage("Could not load vendors.");
      }
    };
    fetchVendors();
  }, []);

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...parts];
    updatedParts[index][field] = value;
    setParts(updatedParts);
  };

  const addPartField = () => {
    setParts([...parts, { part_number: "", description: "", quantity: 0, unit_price: 0 }]);
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
      console.error("Error adding vendor:", error);
      setErrorMessage("Failed to add vendor. Please try again.");
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
      navigate("/success");  // Redirect upon successful submission
    } catch (error) {
      console.error("Error creating parts order:", error);
      
      // Set an error message based on whether the backend returned an error
      setErrorMessage(
        error.response?.data?.message || "Failed to create parts order. Please try again."
      );
    }
  };

  return (
    <div>
      <h2>Add Parts Order</h2>
      
      {/* Vendor Selection */}
      <label>Select Vendor:</label>
      <select value={vendor_name} onChange={(e) => setVendorName(e.target.value)}>
        <option value="">Select a vendor</option>
        {vendorList.map((vendor) => (
          <option key={vendor.id} value={vendor.name}>
            {vendor.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => setShowAddVendorForm(!showAddVendorForm)}>
        {showAddVendorForm ? "Cancel" : "Add New Vendor"}
      </button>

      {/* Inline Add Vendor Form */}
      {showAddVendorForm && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h3>Add New Vendor</h3>
          <input type="text" placeholder="Vendor Name" value={newVendor.name} onChange={(e) => handleNewVendorChange("name", e.target.value)} />
          <input type="text" placeholder="Phone Number" value={newVendor.phone_number} onChange={(e) => handleNewVendorChange("phone_number", e.target.value)} />
          <input type="text" placeholder="Street" value={newVendor.street} onChange={(e) => handleNewVendorChange("street", e.target.value)} />
          <input type="text" placeholder="City" value={newVendor.city} onChange={(e) => handleNewVendorChange("city", e.target.value)} />
          <input type="text" placeholder="State" value={newVendor.state} onChange={(e) => handleNewVendorChange("state", e.target.value)} />
          <input type="text" placeholder="Postal Code" value={newVendor.postal_code} onChange={(e) => handleNewVendorChange("postal_code", e.target.value)} />
          <button type="button" onClick={handleAddVendor}>Save Vendor</button>
        </div>
      )}

      {/* Parts Order Fields */}
      <h3>Parts</h3>
      {parts.map((part, index) => (
        <div key={index}>
          <input type="text" placeholder="Part Number" value={part.part_number} onChange={(e) => handlePartChange(index, "part_number", e.target.value)} />
          <input type="text" placeholder="Description" value={part.description} onChange={(e) => handlePartChange(index, "description", e.target.value)} />
          <input type="number" placeholder="Quantity" value={part.quantity} onChange={(e) => handlePartChange(index, "quantity", parseInt(e.target.value))} />
          <input type="number" placeholder="Unit Price" value={part.unit_price} onChange={(e) => handlePartChange(index, "unit_price", parseFloat(e.target.value))} />
        </div>
      ))}
      <button type="button" onClick={addPartField}>Add Another Part</button>

      {/* Submit Order */}
      <button onClick={handleSubmit}>Submit Parts Order</button>

      {/* Success/Error Messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default AddPartsOrder;