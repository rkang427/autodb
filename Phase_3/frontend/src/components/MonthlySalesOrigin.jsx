import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const MonthlySalesOrigin = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null); // Declare error state
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/monthly_sales/origin', { withCredentials: true });
        setData(response.data);
      } catch (error) {
        setError('Error fetching monthly sales origin');
      }
    };

    fetchMonthlySales();
  }, []);

  const handleGoBack = () => {
    navigate(-1);  
  };

  return (
    <div>
      <h2>Monthly Sales Origin</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
      <table>
        <thead>
          <tr>
            <th>Year Sold</th>
            <th>Month Sold</th>
            <th>Number of Vehicles</th>
            <th>Gross Income</th>
            <th>Net Income</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.year_sold}</td>
              <td>{item.month_sold}</td>
              <td>{item.numbervehicles}</td>
              <td>${item.grossincome.toFixed(2)}</td>
              <td>${item.netincome.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySalesOrigin;
