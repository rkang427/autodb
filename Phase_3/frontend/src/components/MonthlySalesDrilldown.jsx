import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const MonthlySalesDrilldown = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchMonthlySalesDrilldown = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/monthly_sales/drilldown', 
          { withCredentials: true });
        setData(response.data);
      } catch (error) {
        setError('Error fetching monthly sales drilldown');
      }
    };

    fetchMonthlySalesDrilldown();
  }, []);

  // Handle the back navigation
  const handleGoBack = () => {
    navigate('/'); // Replace with the path to your welcome page
  };

  return (
    <div>
      <h2>Monthly Sales Drilldown</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Vehicles Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.first_name}</td>
              <td>{item.last_name}</td>
              <td>{item.vehiclesold}</td>
              <td>${item.totalsales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySalesDrilldown;
