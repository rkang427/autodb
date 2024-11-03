import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MonthlySalesDrilldown = () => {
  const [data, setData] = useState([]);

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

  return (
    <div>
      <h2>Monthly Sales Drilldown</h2>
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
