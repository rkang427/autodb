import { Link } from "react-router-dom";
import formatter from "../util/formatter";

const SearchResults = ({ searchResults }) => {
  if (searchResults.length === 0) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Search Results</h2>
      <p style={styles.resultCount}>
        There are {searchResults.length} results for the given search criteria.
      </p>
      {searchResults.map((car) => {
        return (
          <div key={car.vin} style={styles.resultCard}>
            <h4 style={styles.resultTitle}>
              {car.manufacturer} {car.model}, {car.model_year}
              <Link to={`/vehicle_detail/${car.vin}`}>
                <button style={styles.detailsButton}>Vehicle Details</button>
              </Link>
            </h4>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>VIN:</td>
                  <td>{car.vin}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Vehicle Type:</td>
                  <td>{car.vehicle_type}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Manufacturer:</td>
                  <td>{car.manufacturer}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Model:</td>
                  <td>{car.model}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Year:</td>
                  <td>{car.model_year}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Fuel Type:</td>
                  <td>{car.fuel_type}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Color(s):</td>
                  <td>{car.colors}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Horsepower:</td>
                  <td>{car.horsepower}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Sale Price:</td>
                  <td>{formatter.formatUSD(car.sale_price)}</td>
                </tr>
              </tbody>
            </table>
            <hr style={styles.divider} />
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
    color: "#333",
  },
  header: {
    fontSize: "2em",
    fontWeight: "700",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: "15px",
  },
  resultCount: {
    fontSize: "1.2em",
    textAlign: "center",
    color: "#34495E",
    marginBottom: "25px",
  },
  resultCard: {
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  resultTitle: {
    fontSize: "1.5em",
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: "15px",
  },
  detailsButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "15px",
    transition: "background-color 0.3s",
  },
  detailsButtonHover: {
    backgroundColor: "#218838",
  },
  table: {
    width: "100%",
    marginTop: "15px",
    borderCollapse: "collapse",
  },
  tableLabel: {
    fontWeight: "600",
    color: "#34495E",
    padding: "8px",
  },
  divider: {
    border: "0",
    borderTop: "2px solid #ddd",
    margin: "20px 0",
  },
};

export default SearchResults;
