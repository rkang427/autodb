import { Link } from "react-router-dom";

const ReportLinks = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reports</h2>
      <div style={styles.linkContainer}>
        <Link to="/view_seller_history" style={styles.link}>Seller History</Link>
      </div>
      <div style={styles.linkContainer}>
        <Link to="/average_time_in_inventory" style={styles.link}>Average Time in Inventory</Link>
      </div>
      <div style={styles.linkContainer}>
        <Link to="/price_per_condition" style={styles.link}>Price Per Condition</Link>
      </div>
      <div style={styles.linkContainer}>
        <Link to="/part_statistics" style={styles.link}>Part Statistics</Link>
      </div>
      <div style={styles.linkContainer}>
        <Link to="/monthly_sales" style={styles.link}>Monthly Sales</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "15px",
    textAlign: "center",
  },
  linkContainer: {
    marginBottom: "12px",
  },
  link: {
    fontSize: "18px",
    color: "#28a745",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  linkHover: {
    color: "#2c3e50",
  }
};

export default ReportLinks;
