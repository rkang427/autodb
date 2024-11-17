import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import formatter from '../util/formatter';

const PartStatistics = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchPartStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/part_statistics', { withCredentials: true });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving part statistics');
      }
    };

    fetchPartStatistics();
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div>
      <h2>Part Statistics</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <button style={{ marginTop: 0, marginBottom: "1rem", border: "1px solid black" }} onClick={handleGoBack}>Go Back</button>
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
              <td>{formatter.formatUSD(item.vendortotalexpense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartStatistics;
