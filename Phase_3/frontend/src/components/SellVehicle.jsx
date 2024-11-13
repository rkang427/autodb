import { useParams, Link } from "react-router-dom";
import auth from "../services/auth";
import axios from "axios";
import sellService from "../services/sell";
import { useState, useEffect } from "react";
import AddCustomerModal from './AddCustomerModal'; 
import useAddCustomerModal from './useAddCustomerModal';

const SellVehicle = () => {
  const { vin } = useParams();
  console.log("VIN: ", vin);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customerTaxId, setCustomerTaxId] = useState(null);
  const [lookupCustomerTaxId, setLookupCustomerTaxId] = useState("");
  const [saleStatus, setSaleStatus] = useState(null);  // Track sale status
  const [isSellModalOpen, setIsSellModalOpen] = useState(false); // Controls modal visibility
  const [vehicleSold, setVehicleSold] = useState(false); // To track if vehicle is sold
  const [saleDate, setSaleDate] = useState(null); // To store the sale date

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        console.log(response.data.user);
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
      } catch (error) {
        console.log("Error checking session", error);
      }
    };

    checkSession();
  }, []);

  {/* Add Customer */}
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
    console.log(`in handleLookupCustomerClick`)
    try {
      const response = await axios.get("http://localhost:3000/customer", { params: {tax_id: lookupCustomerTaxId}, withCredentials: true });
      console.log(response.data)
      setCustomerTaxId(response.data.tax_id); // Set customer tax ID received from the modal
    } catch (error) {
      console.log(error);
    }
  };

  const handleCustomerTaxIdReceived = (taxId) => {
    console.log("Received tax_id from modal:", taxId);
    setCustomerTaxId(taxId); // Set customer tax ID received from the modal
  };

  // Handle the sell operation
  const handleSellVehicle = async (event) => {
    event.preventDefault();

    try {
      const data = await sellService.sellVehicle(vin, customerTaxId);
      setSaleStatus("Vehicle sold successfully!"); // Success message
      console.log("Sell vehicle response:", data);
      setIsSellModalOpen(false); // Close the modal upon successful sale
      setVehicleSold(true); // Mark the vehicle as sold
      setSaleDate(new Date().toLocaleDateString()); // Set the sale date to today's date
    } catch (error) {
      console.error("Error selling vehicle:", error);
      setSaleStatus("Error: " + error.message); // Display the error message if sale fails
    }
  };

  return (
    <>
      {loggedInUser && (loggedInUser.user_type === "sales_person" || loggedInUser.user_type === "owner") ? (
        <div>
          <h2>Sell Vehicle</h2>
          <Link to={"/"}>Go back to main page</Link>
          <h3>VIN: {vin}</h3>

          {/* Customer Tax ID */}
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
            <button onClick={handleAddCustomerClick} disabled={vehicleSold}>Add Customer</button>

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

          {/* Conditionally disable the Sell Vehicle Button if the vehicle is already sold */}
          <button 
            onClick={() => {
              if (!customerTaxId) {
                alert("Please add a customer before selling the vehicle.");
                return;
              }

              if (vehicleSold) {
                alert("This vehicle has already been sold.");
                return;
              }

              setIsSellModalOpen(true);
            }} 
            disabled={vehicleSold || saleDate}
          >
            Sell Vehicle
          </button>

          {/* Success or Error Message Display */}
          {saleStatus && <p>{saleStatus}</p>}

          {/* Sell Vehicle Modal */}
          {isSellModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3>Confirm Vehicle Sale</h3>
                <form onSubmit={handleSellVehicle}>
                  <button type="submit" disabled={!customerTaxId || vehicleSold}>Confirm Sale</button>
                  <button type="button" onClick={() => setIsSellModalOpen(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <h2>Forbidden</h2>
      )}
    </>
  );
};

export default SellVehicle;
