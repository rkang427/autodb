import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AverageTimeInInventory = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div style={styles.container}>
      <h2 style={styles.heading}>Average Time in Inventory</h2>
      {error && <div style={styles.error}>{error}</div>}

      <button style={styles.goBackButton} onClick={handleGoBack}>Go Back</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Vehicle Type</th>
            <th style={styles.tableHeader}>Average Time in Inventory (days)</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="2" style={styles.noData}>No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{item.vehicle_type}</td>
                <td style={styles.tableCell}>
                  {item.average_time_in_inventory === 'N/A' 
                    ? item.average_time_in_inventory 
                    : Number(item.average_time_in_inventory).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f4f4f9',
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#34495e',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '20px',
  },
  goBackButton: {
    display: 'block',
    margin: '0 auto 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  table: {
    width: '80%',
    margin: '0 auto',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#2C3E50',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '10px',
  },
  tableCell: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '20px',
    fontSize: '18px',
  },
};

export default AverageTimeInInventory;
