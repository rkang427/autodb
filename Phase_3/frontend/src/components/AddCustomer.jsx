import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AddCustomer = () => {
  const navigate = useNavigate(); // Get navigate function
  const [formData, setFormData] = useState({
    tax_id: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    business_name: '',
    title: '',
    customer_type: 'i',
    email: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3000/customers', formData);
      setSuccessMessage(response.data.msg);
      setFormData({
        tax_id: '',
        phone_number: '',
        first_name: '',
        last_name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        business_name: '',
        title: '',
        customer_type: 'i',
        email: '',
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError('Error connecting to the server.');
      }
    }
  };

  return (
    <div>
      <h2>Add Customer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tax ID:</label>
          <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Street:</label>
          <input type="text" name="street" value={formData.street} onChange={handleChange} />
        </div>
        <div>
          <label>City:</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} />
        </div>
        <div>
          <label>State:</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} />
        </div>
        <div>
          <label>Postal Code:</label>
          <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} />
        </div>
        <div>
          <label>Business Name:</label>
          <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} />
        </div>
        <div>
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} />
        </div>
        <div>
          <label>Customer Type:</label>
          <select name="customer_type" value={formData.customer_type} onChange={handleChange}>
            <option value="i">Individual</option>
            <option value="b">Business</option>
          </select>
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <button type="submit">Add Customer</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
    </div>
  );
};

export default AddCustomer;

