import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SellerHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/view_seller_history');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching seller history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Seller History</h1>
      <table>
        <thead>
          <tr>
            <th>Name/Business</th>
            <th>Vehicle Count</th>
            <th>Average Purchase Price</th>
            <th>Total Parts Count</th>
            <th>Average Parts Cost per Vehicle Purchased</th>
            <th>Highlight</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={row.highlight}>
              <td>{row.namebusiness}</td>
              <td>{row.vehiclecount}</td>
              <td>{row.averagepurchaseprice}</td>
              <td>{row.totalpartscount}</td>
              <td>{row.averagepartscostpervehiclepurchased}</td>
              <td>{row.highlight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerHistory;
