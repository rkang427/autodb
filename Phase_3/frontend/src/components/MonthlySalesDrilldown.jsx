import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import formatter from '../util/formatter';

const MonthlySalesDrilldown = () => {
  const location = useLocation();  // Access query string from the URL
  const navigate = useNavigate();  // Get the navigate function for programmatic navigation
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const { year, month } = useParams();  

  useEffect(() => {
    if (!year || !month) {
      setError('Missing year or month parameter');
      return;
    }

    const fetchDrilldownData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/reports/monthly_sales/drilldown`,
          { 
            params: { month, year },
            withCredentials: true 
          }
        );
        console.log(response.data);

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

    
    fetchDrilldownData();
  }, [location.search]);  
  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div>
      <h2>Drilldown for {month}/{year}</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button onClick={handleGoBack}>Go Back</button> 

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
                <td>{formatter.formatUSD(Number(item.totalsales || 0).toFixed(2))}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySalesDrilldown;
