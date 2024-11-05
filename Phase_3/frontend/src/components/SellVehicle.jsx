import { useParams } from "react-router-dom";
import auth from "../services/auth";
import { useState, useEffect } from "react";
import AddCustomerModal from './AddCustomerModal'; 
import useAddCustomerModal from './useAddCustomerModal';

const SellVehicle = () => {
  const { vin } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customerTaxId, setCustomerTaxId] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        console.log(response.data.user);
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
      } catch (error) {
        console.error("Error checking session", error);
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

  const handleButtonClick = () => {
    console.log("Add Customer Button Clicked");
    openAddCustomerModal(); // Open modal on button click
  };

  const handleCustomerTaxIdReceived = (taxId) => {
    console.log("Received tax_id from modal:", taxId);
    setCustomerTaxId(taxId); // Set customer tax ID when received from modal
  };
  {/* End Add Customer */}

  return (
    <>
      {loggedInUser && (loggedInUser.user_type === "sales_person" || loggedInUser.user_type === "owner") ? (
        <div>
          <h2>Sell Vehicle</h2>
          <h3>Vin: {vin}</h3>
          <div>
            {/* Add Customer */}
            {customerTaxId && <p>Customer: {customerTaxId}</p>}
            <button onClick={handleButtonClick}>Add Customer</button>
            
            {/* Conditionally render the modal based on isAddCustomerModalOpen */}
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
          {/* End Add Customer */}
        </div>
      ) : (
        <h2>Forbidden</h2>
      )}
    </>
  );
};

export default SellVehicle;
