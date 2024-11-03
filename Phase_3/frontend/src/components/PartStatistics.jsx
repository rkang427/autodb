import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PartStatistics = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartStatistics = async () => {
      try {
        const response = await axios.get('/reports/part_statistics', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving part statistics');
      }
    };

    fetchPartStatistics();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Part Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Total Parts Quantity</th>
            <th>Total Expense</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.totalpartsquantity}</td>
              <td>{item.vendortotalexpense}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartStatistics;
