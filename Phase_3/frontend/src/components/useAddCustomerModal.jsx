import { useState } from 'react';
import axios from 'axios';

const useAddCustomerModal = () => {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    customer_type: 'i',
    tax_id: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    title: '',
    business_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle radio button change for Individual or Business
  const handleRadioChange = (e) => {
    setError(null); // Clear previous errors
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      customer_type: value, // Update type to individual or business
    }));
  };

  const handleSubmit = async (e, onCustomerTaxIdReceived) => {
    e.preventDefault();
    setError(null); // Clear previous errors
  
    try {
      const response = await axios.post("http://localhost:3000/customer", form, { withCredentials: true });
      console.log('Form submitted:', response.data);
  
      if (typeof onCustomerTaxIdReceived === 'function') {
        onCustomerTaxIdReceived(response.data.tax_id);
      }
  
      closeAddCustomerModal(); // Close modal after submission
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.log('Response error:', error.response);
        if (error.response.data && error.response.data.error) {
          setError(error.response.data.error); 
        } else {
          setError('An error occurred while processing your request.');
        }
      } else {
        setError('Backend unreachable.');
      }
    }
  };
  
  // Open and close the modal
  const openAddCustomerModal = () => {
    console.log("Opening add customer modal...");
    setIsAddCustomerModalOpen(true);
  };

  const closeAddCustomerModal = () => {
    setError(null); // Clear previous errors
    console.log("Closing add customer modal...");
    setIsAddCustomerModalOpen(false);
    setForm({ // Reset the form on close
      customer_type: 'i',
      tax_id: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      title: '',
      business_name: '',
    });
  };

  return {
    isAddCustomerModalOpen,
    openAddCustomerModal,
    closeAddCustomerModal,
    form,
    handleChange,
    handleRadioChange,
    handleSubmit,
    error,
  };
};

export default useAddCustomerModal;
