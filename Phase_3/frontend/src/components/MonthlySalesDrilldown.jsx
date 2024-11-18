import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import formatter from '../util/formatter';

const MonthlySalesDrilldown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const { year, month } = useParams();

  useEffect(() => {
    if (!year || !month) {
      setError('Missing year or month parameter');
      return;
    }

    const fetchDrilldownData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/reports/monthly_sales/drilldown`,
          { 
            params: { month, year },
            withCredentials: true 
          }
        );
        if (response.status === 200) {
          setData(response.data);
        } else {
          throw new Error('Failed to fetch drilldown data');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch drilldown data');
      }
    };

    fetchDrilldownData();
  }, [location.search]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Drilldown for {month}/{year}</h2>

      {error && <div style={styles.error}>{error}</div>}

      <button style={styles.goBackButton} onClick={handleGoBack}>Go Back</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Vehicles Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" style={styles.noData}>No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.vehiclesold}</td>
                <td>{formatter.formatUSD(Number(item.totalsales || 0).toFixed(2))}</td>
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '20px',
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

export default MonthlySalesDrilldown;
