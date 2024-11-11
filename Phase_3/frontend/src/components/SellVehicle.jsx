import { useParams, Link } from "react-router-dom";
import auth from "../services/auth";
import sellService from "../services/sell";
import { useState, useEffect } from "react";
import AddCustomerModal from './AddCustomerModal'; 
import useAddCustomerModal from './useAddCustomerModal';

const SellVehicle = () => {
  const { vin } = useParams();
  console.log("VIN: ", vin);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customerTaxId, setCustomerTaxId] = useState(null); // Hardcoded customer ID for testing
  const [saleStatus, setSaleStatus] = useState(null);  // Track sale status
  const [isSellModalOpen, setIsSellModalOpen] = useState(false); // Controls modal visibility

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

  const handleCustomerTaxIdReceived = (taxId) => {
    console.log("Received tax_id from modal:", taxId);
    setCustomerTaxId(taxId); // Set customer tax ID received from the modal
  };

  // Handle the sell operation
  const handleSellVehicle = async (event) => {
    event.preventDefault();

    if (!customerTaxId) {
      alert("Please add a customer before selling the vehicle.");
      return;
    }

    try {
      const data = await sellService.sellVehicle(vin, customerTaxId);
      setSaleStatus("Vehicle sold successfully");
      console.log("Sell vehicle response:", data);
      setIsSellModalOpen(false); // Close the modal upon successful sale
    } catch (error) {
      console.error("Error selling vehicle:", error);
      setSaleStatus(error.message); // Display the error message if sale fails
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
                onCustomerTaxIdReceived={setCustomerTaxId} 
                error={error} 
              />
            )}
          </div>

          {/* Sell Vehicle Button */}
          <button onClick={() => setIsSellModalOpen(true)}>Sell Vehicle</button>

          {/* Sell Vehicle Modal */}
          {isSellModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3>Confirm Vehicle Sale</h3>
                <form onSubmit={handleSellVehicle}>
                  <button type="submit" disabled={!customerTaxId}>Confirm Sale</button>
                  <button type="button" onClick={() => setIsSellModalOpen(false)}>Cancel</button>
                </form>
                {saleStatus && <p>{saleStatus}</p>}
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
