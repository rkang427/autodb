import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AverageTimeInInventory = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAverageTime = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/avg_time_in_inventory', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving average time in inventory');
      }
    };

    fetchAverageTime();
  }, []);

  if (error) {

    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Average Time in Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle Type</th>
            <th>Average Time in Inventory (days)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.vehicle_type}</td>
              <td>{item.average_time_in_inventory}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AverageTimeInInventory;
