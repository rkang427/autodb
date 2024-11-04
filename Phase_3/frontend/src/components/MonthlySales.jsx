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
      const endpoint = type === 'drilldown' 
        ? 'http://localhost:3000/reports/monthly_sales/drilldown'
        : 'http://localhost:3000/reports/monthly_sales/origin';
      
      try {
        const response = await axios.get(endpoint, { withCredentials: true });
        setData(response.data);
      } catch (error) {
        setError(type === 'drilldown' 
          ? 'Error fetching monthly sales drilldown' 
          : 'Error fetching monthly sales origin');
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
          {data.map((item, index) => (
            <tr key={index}>
              {type === 'drilldown' ? (
                <>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>{item.vehiclesold}</td>
                  <td>${item.totalsales.toFixed(2)}</td>
                </>
              ) : (
                <>
                  <td>{item.year_sold}</td>
                  <td>{item.month_sold}</td>
                  <td>{item.numbervehicles}</td>
                  <td>${item.grossincome.toFixed(2)}</td>
                  <td>${item.netincome.toFixed(2)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySales;
