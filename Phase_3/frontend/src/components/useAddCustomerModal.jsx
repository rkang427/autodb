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

    const {
      customer_type,
      tax_id,
      email,
      first_name,
      last_name,
      phone_number,
      street,
      city,
      state,
      postal_code,
      title,
      business_name,
    } = form;

    // Validation for Business Fields
    if (customer_type === 'b') {
      if (!business_name.trim() || business_name.length > 120) {
        return setError("Business Name is required for a Business customer and must be between 1 and 120 characters.");
      }
      if (!title.trim() || title.length > 120) {
        return setError("Primary Contact Title is required for a Business customer and must be between 1 and 120 characters.");
      }
    }

    // Validation for common fields
    if (!first_name.trim() || first_name.length > 120) {
      return setError("First Name is invalid. It must be between 1 and 120 characters.");
    }
    if (!last_name.trim() || last_name.length > 120) {
      return setError("Last Name is invalid. It must be between 1 and 120 characters.");
    }
    if (!/^\d{10}$/.test(phone_number)) {
      return setError("Invalid Phone Number. It must be exactly 10 digits.");
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return setError("Invalid Email. Please enter a valid email address.");
    }
    if (!street.trim() || street.length < 2 || street.length > 120) {
      return setError("Street Address is invalid. It must be between 2 and 120 characters.");
    }
    if (!city.trim() || city.length < 2 || city.length > 120) {
      return setError("City is invalid. It must be between 2 and 120 characters.");
    }
    if (!state.trim() || state.length < 2 || state.length > 120) {
      return setError("State is invalid. It must be between 2 and 120 characters.");
    }
    if (!/^\d{5}$/.test(postal_code)) {
      return setError("Postal Code is invalid. It must be exactly 5 digits.");
    }
  
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
