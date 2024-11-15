import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewSellerHistory = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    navigate(-1);
  };

  return (
    <div>
      <h2>View Seller History</h2>

      <button onClick={handleGoBack}>Go Back</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Vehicle Count</th>
            <th>Average Purchase Price</th>
            <th>Total Parts Count</th>
            <th>Average Part Cost per Vehicle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              //you just change 'no' to 'highlight' for the classes to run properly
              style={{ backgroundColor: item.highlight === 'highlight' ? 'red' : 'transparent', color: item.highlight === 'highlight' ? 'white' : 'black' }}
            >
              <td>{item.namebusiness}</td>
              <td>{item.vehiclecount}</td>
              <td>{item.averagepurchaseprice}</td>
              <td>{item.totalpartscount}</td>
              <td>{item.averagepartscostpervehiclepurchased}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewSellerHistory;
