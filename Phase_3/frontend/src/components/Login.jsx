import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import auth from "../services/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
      } catch (error) {
        console.error("Error checking session", error);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.logout();
      setLoggedInUser(null);
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await auth.login(username, password);
      const response = await auth.checkSession();
      setLoggedInUser(response.data.user);
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials.");
      console.error(
        "Login error",
        error.response ? error.response.data : error
      );
      setUsername("");
      setPassword("");
    }
  };

  if (loggedInUser) {
    return (
      <div>
        <h1>Hello, {loggedInUser.first_name}!</h1>
        {/* Link to Average Time in Inventory page */}
        <div>
          <Link to="/average_time_in_inventory">
            View Average Time in Inventory
          </Link>
        </div>
        <div>
          <Link to="/view_seller_history">View Seller History</Link>
        </div>
        <div>
          <Link to="/price_per_condition">Price Per Condition</Link>
        </div>
        <div>
          <Link to="/part_statistics">Part Statistics</Link>
        </div>
        <div>
          <Link to="/monthly_sales/origin">Monthly Sales Origin</Link>
        </div>
        <div>
          <Link to="/monthly_sales/drilldown">Monthly Sales Drilldown</Link>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
