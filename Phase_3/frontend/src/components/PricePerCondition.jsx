import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import formatter from '../util/formatter';

const PricePerCondition = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPricePerCondition = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports/price_per_condition', {
          withCredentials: true,
        });
        setData(response.data);
      } catch (err) {
        setError('Error retrieving price per condition');
      }
    };

    fetchPricePerCondition();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Price Per Condition</h2>
      <em style={styles.subHeading}>The average purchase price per condition and vehicle type.</em>
      <br />
      {error && <div style={styles.error}>{error}</div>}

      <button style={styles.goBackButton} onClick={handleGoBack}>Go Back</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Vehicle Type</th>
            <th style={styles.tableHeader}>Fair</th>
            <th style={styles.tableHeader}>Good</th>
            <th style={styles.tableHeader}>Very Good</th>
            <th style={styles.tableHeader}>Excellent</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={styles.noData}>No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableCell}><strong>{item.vehicle_type}</strong></td>
                <td style={styles.tableCell}>{formatter.formatUSD(item.fairavgprice)}</td>
                <td style={styles.tableCell}>{formatter.formatUSD(item.goodavgprice)}</td>
                <td style={styles.tableCell}>{formatter.formatUSD(item.verygoodavgprice)}</td>
                <td style={styles.tableCell}>{formatter.formatUSD(item.excellentavgprice)}</td>
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
  subHeading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '20px',
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

export default PricePerCondition;
