import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AverageTimeInInventory = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

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

  const handleGoBack = () => {
    navigate(-1);  
  };

  return (
    <div>
      <h2>Average Time in Inventory</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error if exists */}
      <button onClick={handleGoBack}>Go Back</button> {/* Go Back button */}
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
              <td>
                {
                  // Check if the value is a number
                  item.average_time_in_inventory === 'N/A' 
                    ?item.average_time_in_inventory // Round to 2 decimal places if it's a number
                    : Number(item.average_time_in_inventory).toFixed(2)// Leave it as is if it's not a number (string)
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AverageTimeInInventory;
