import { Link } from "react-router-dom";

const NavBar = ({ loggedInUser, handleLogout }) => {
  if (!loggedInUser) return null;

  return (
    <div style={styles.navContainer}>
      <p style={styles.greeting}>
        Hello, {loggedInUser.first_name}!{" "}
        {["owner", "inventory_clerk"].includes(loggedInUser.user_type) && (
          <Link to="/add_vehicle" style={styles.buttonLink}>
            <button style={styles.button}>Add Vehicle</button>
          </Link>
        )}
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </p>
    </div>
  );
};

const styles = {
  navContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "10px 20px",
    color: "black",
  },
  greeting: {
    fontSize: "25px",
    margin: 0,
  },
  buttonLink: {
    marginLeft: "15px",
  },
  button: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#218838",
  },
};

export default NavBar;
