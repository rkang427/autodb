import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MonthlySales = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch monthly sales data (only for the "origin" view)
  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const endpoint = 'http://localhost:3000/reports/monthly_sales';

        console.log('Requesting data from:', endpoint); // Log the endpoint being requested

        const response = await axios.get(endpoint, { withCredentials: true });

        console.log('API Response:', response.data);  // Log the response data

        if (Array.isArray(response.data)) {
          setData(response.data);  // Set the data accordingly
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching monthly sales data:', error);
        setError(error.message || 'Failed to fetch data');
      }
    };

    fetchMonthlySales();
  }, []); // Only fetch data once when the component is mounted

  // Fetch drilldown data from the backend
  const handleViewDrilldown = async (year, month) => {
    try {
      // Redirect to the drilldown page with the year and month query parameters
      navigate(`/monthly_sales/drilldown/${year}/${month}`);
    } catch (error) {
      console.error('Error navigating to drilldown:', error);
      setError(error.message || 'Failed to navigate to drilldown');
    }
  };

  return (
    <div>
      <h2>Monthly Sales</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}  {/* Display error if any */}

      <table>
        <thead>
          <tr>
            <th>Year Sold</th>
            <th>Month Sold</th>
            <th>Number of Vehicles</th>
            <th>Gross Income</th>
            <th>Net Income</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.year_sold}</td>
                <td>{item.month_sold}</td>
                <td>{item.numbervehicles}</td>
                <td>${Number((item.grossincome || 0.0)).toFixed(2)}</td>
                <td>${Number((item.netincome || 0.0)).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleViewDrilldown(item.year_sold, item.month_sold)}>
                    View Drilldown
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySales;
