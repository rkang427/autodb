import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MonthlySales = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [type, setType] = useState('origin'); // Default type
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonthlySales = async () => {
      const endpoint = 'http://localhost:3000/reports/monthly_sales';

      try {
        const response = await axios.get(endpoint, { withCredentials: true });
        
        console.log('API response:', response);  // Log the entire response

        // Check the structure of the response
        if (Array.isArray(response.data)) {
          if (type === 'origin') {
            setData(response.data); // Use origin data directly
          } else {
            // Flatten drilldown data based on response structure
            setData(response.data.flatMap(item => item.drilldown || []));
          }
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        const errorMessage = type === 'drilldown'
          ? 'Error fetching monthly sales drilldown'
          : 'Error fetching monthly sales origin';
        setError(errorMessage);
        console.error('Error fetching monthly sales data:', error.message || error);
      }
    };

    fetchMonthlySales();
  }, [type]);

  const handleGoBack = () => {
    navigate(-1);  
  };

  return (
    <div>
      <h2>{type === 'drilldown' ? 'Monthly Sales Drilldown' : 'Monthly Sales Origin'}</h2>
      <button onClick={() => setType('origin')}>View Monthly Sales Origin</button>
      <button onClick={() => setType('drilldown')}>View Monthly Sales Drilldown</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button onClick={handleGoBack}>Go Back</button>
      <table>
        <thead>
          {type === 'drilldown' ? (
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Vehicles Sold</th>
              <th>Total Sales</th>
            </tr>
          ) : (
            <tr>
              <th>Year Sold</th>
              <th>Month Sold</th>
              <th>Number of Vehicles</th>
              <th>Gross Income</th>
              <th>Net Income</th>
            </tr>
          )}
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={type === 'drilldown' ? 4 : 5} style={{ textAlign: 'center' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              console.log('Rendering item:', item); // Log each item to check its data
              return (
                <tr key={index}>
                  {type === 'drilldown' ? (
                    <>
                      <td>{item.first_name}</td>
                      <td>{item.last_name}</td>
                      <td>{item.vehiclesold}</td>
                      <td>${(item.totalsales || 0).toFixed(2)}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.year_sold}</td>
                      <td>{item.month_sold}</td>
                      <td>{item.numbervehicles}</td>
                      <td>${(item.grossincome || 0).toFixed(2)}</td>
                      <td>${(item.netincome || 0).toFixed(2)}</td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySales;
