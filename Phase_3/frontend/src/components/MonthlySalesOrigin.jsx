import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MonthlySalesDrilldown = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlySalesDrilldown = async () => {
      try {
        const response = await axios.get('/reports/monthly_sales/drilldown', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving monthly sales drilldown report');
      }
    };

    fetchMonthlySalesDrilldown();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Monthly Sales Drilldown Report</h2>
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
              <td>{item.totalsales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySalesDrilldown;
