import React, { useEffect, useState } from 'react';
import ReportTable from './components/highlight';

function App() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/reports/view_seller_history');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Seller's History Report</h1>
      <ReportTable results={results} />
    </div>
  );
}

export default App;
