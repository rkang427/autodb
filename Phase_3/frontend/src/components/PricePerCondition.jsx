import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PricePerCondition = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchPricePerCondition = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/price_per_condition', {
          withCredentials: true,
        });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving price per condition');
      }
    };

    fetchPricePerCondition();
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div>
      <h2>Price Per Condition</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
      <table>
        <thead>
          <tr>
            <th>Vehicle Type</th>
            <th>Total Price</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.vehicle_type}</td>
              <td>{item.excellenttotalprice || item.verygoodtotalprice}</td> {/* Adjust this if necessary */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricePerCondition;
