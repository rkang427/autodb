import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import formatter from '../util/formatter';

const PartStatistics = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Part Statistics</h2>

      {error && <div style={styles.error}>{error}</div>}

      <button style={styles.goBackButton} onClick={handleGoBack}>Go Back</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Vendor Name</th>
            <th style={styles.tableHeader}>Total Parts Quantity</th>
            <th style={styles.tableHeader}>Total Expense</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="3" style={styles.noData}>No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{item.name}</td>
                <td style={styles.tableCell}>{item.totalpartsquantity}</td>
                <td style={styles.tableCell}>{formatter.formatUSD(item.vendortotalexpense)}</td>
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
    backgroundColor: '#f9f9f9',
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2C3E50',
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
    width: '100%',
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

export default PartStatistics;
