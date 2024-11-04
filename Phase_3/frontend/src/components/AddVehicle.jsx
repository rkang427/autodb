import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddVehicle = () => {
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [condition, setCondition] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [inventoryClerk, setInventoryClerk] = useState('');
  const [customerSeller, setCustomerSeller] = useState('');
  const [colors, setColors] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const handleGoBack = () => { 
    if (window.history.length > 1) {
      navigate(-1);  
    } else {
      navigate('/');  
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const vehicleData = {
      vin,
      description,
      horsepower,
      model_year: modelYear,
      model,
      manufacturer,
      vehicle_type: vehicleType,
      purchase_price: purchasePrice,
      condition,
      fuel_type: fuelType,
      inventory_clerk: inventoryClerk,
      customer_seller: customerSeller,
      colors: colors.split(',').map(color => color.trim()),
    };

    try {
      await axios.post('http://localhost:3000/vehicles', vehicleData, { withCredentials: true });
      navigate('/'); // Redirect to another page after successful addition
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.errors[0].msg : 'An error occurred');
      console.error('Add Vehicle error:', error);
    }
  };

  return (
    <div>
      <h2>Add Vehicle</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>VIN:</label>
          <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Horsepower:</label>
          <input type="number" value={horsepower} onChange={(e) => setHorsepower(e.target.value)} required />
        </div>
        <div>
          <label>Model Year:</label>
          <input type="text" value={modelYear} onChange={(e) => setModelYear(e.target.value)} required />
        </div>
        <div>
          <label>Model:</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>
        <div>
          <label>Manufacturer:</label>
          <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
        </div>
        <div>
          <label>Vehicle Type:</label>
          <input type="text" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />
        </div>
        <div>
          <label>Purchase Price:</label>
          <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
        </div>
        <div>
          <label>Condition:</label>
          <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} required />
        </div>
        <div>
          <label>Fuel Type:</label>
          <input type="text" value={fuelType} onChange={(e) => setFuelType(e.target.value)} required />
        </div>
        <div>
          <label>Inventory Clerk:</label>
          <input type="text" value={inventoryClerk} onChange={(e) => setInventoryClerk(e.target.value)} required />
        </div>
        <div>
          <label>Customer Seller:</label>
          <input type="text" value={customerSeller} onChange={(e) => setCustomerSeller(e.target.value)} required />
        </div>
        <div>
          <label>Colors (comma separated):</label>
          <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} required />
        </div>
        <button type="submit">Add Vehicle</button>
      </form>
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
    </div>
  );
};

export default AddVehicle;
