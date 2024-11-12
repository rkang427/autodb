import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const MonthlySalesDrilldown = () => {
  const location = useLocation();  // Access query string from the URL
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const getQueryParams = () => {
    const params = new URLSearchParams(location.search); 
    return {
      year: params.get('year'),
      month: params.get('month')
    };
  };

  const { year, month } = getQueryParams();  
  useEffect(() => {
    if (!year || !month) {
      setError('Missing year or month parameter');
      return;
    }

    const fetchDrilldownData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/reports/monthly_sales/drilldown?year=${year}&month=${month}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Set the drilldown data on successful response
          setData(response.data);
        } else {
          throw new Error('Failed to fetch drilldown data');
        }
      } catch (error) {
        console.error('Error fetching drilldown data:', error);
        setError(error.message || 'Failed to fetch drilldown data');
      }
    };

    // Fetch data for the selected year and month
    fetchDrilldownData();
  }, [location.search]);  // Only refetch when query parameters change

  return (
    <div>
      <h2>Drilldown for {month}/{year}</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}  {/* Display error if any */}

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
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.vehiclesold}</td>
                <td>${(item.totalsales || 0).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySalesDrilldown;
