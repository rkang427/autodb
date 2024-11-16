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
      <div style={{ marginBottom: '10px', fontStyle: 'italic' }}>
    <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: 'lightcoral', marginRight: '5px' }}></span>
    Rows highlighted in red indicate sellers who have sold vehicles and average 5 or more parts OR average cost of parts is $500 or more.
  </div>
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
              style={{ backgroundColor: item.highlight === 'highlight' ? 'lightcoral' : 'transparent', color: item.highlight === 'highlight' ? 'black' : 'black',fontWeight: item.highlight === 'highlight' ? 450 : 400,}}
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
