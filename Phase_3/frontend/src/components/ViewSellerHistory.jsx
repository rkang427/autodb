import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ViewSellerHistory = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchSellerHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/view_seller_history', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving seller history');
      }
    };

    fetchSellerHistory();
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div>
      <h2>View Seller History</h2>

      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <table>
        <thead>
          <tr>
            <th>Name Business</th>
            <th>Vehicle Count</th>
            <th>Average Purchase Price</th>
            <th>Total Parts Count</th>
            <th>Average Part Cost per Vehicle</th>
            <th>Highlight</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.namebusiness}</td>
              <td>{item.vehiclecount}</td>
              <td>{item.averagepurchaseprice}</td>
              <td>{item.totalpartscount}</td>
              <td>{item.averagepartscostpervehiclepurchased}</td>
              <td>{item.highlight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewSellerHistory;
