import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PricePerCondition = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricePerCondition = async () => {
      try {
        const response = await axios.get('/reports/price_per_condition', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving price per condition');
      }
    };

    fetchPricePerCondition();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Price Per Condition</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle Type</th>
            <th>Total Price (Excellent Condition)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.vehicle_type}</td>
              <td>{item.excellenttotalprice || item.verygoodtotalprice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricePerCondition;
