import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import formatter from '../util/formatter';

const MonthlySales = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const endpoint = 'http://localhost:3000/reports/monthly_sales';
        const response = await axios.get(endpoint, { withCredentials: true });

        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch data');
      }
    };

    fetchMonthlySales();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewDrilldown = (year, month) => {
    navigate(`/monthly_sales/drilldown/${year}/${month}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Monthly Sales</h2>
      <button style={styles.goBackButton} onClick={handleGoBack}>Go Back</button>

      {error && <div style={styles.error}>{error}</div>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Year Sold</th>
            <th>Month Sold</th>
            <th>Number of Vehicles</th>
            <th>Gross Income</th>
            <th>Net Income</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={styles.noData}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.year_sold}</td>
                <td>{item.month_sold}</td>
                <td>{item.numbervehicles}</td>
                <td>{formatter.formatUSD(Number((item.grossincome || 0.0)).toFixed(2))}</td>
                <td>{formatter.formatUSD(Number((item.netincome || 0.0)).toFixed(2))}</td>
                <td>
                  <button style={styles.viewButton} onClick={() => handleViewDrilldown(item.year_sold, item.month_sold)}>
                    View Drilldown
                  </button>
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
  goBackButtonHover: {
    backgroundColor: '#2980b9',
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
  viewButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  viewButtonHover: {
    backgroundColor: '#218838',
  },
};

export default MonthlySales;
