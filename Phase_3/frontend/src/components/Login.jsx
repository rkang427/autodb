import { useState, useEffect } from "react";
import auth from "../services/auth";
import Landing from "./Landing";
import NavBar from "./NavBar";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
      <>
        <NavBar loggedInUser={loggedInUser} handleLogout={handleLogout} />
        <Landing loggedInUser={loggedInUser} />
      </>
    );
  }

  return (
    <div style={styles.container}>
      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}

      <h2 style={styles.heading}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.submitButton}>Login</button>
      </form>
      <hr style={styles.divider} />
      <Landing loggedInUser={loggedInUser} />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "20px",
    height: "100%",
    padding: "30px",
    backgroundColor: "#f0f2f5",
  },
  heading: {
    fontSize: "2em",
    color: "#333",
    marginBottom: "20px",
  },
  form: {
    width: "100%",
    height: "70%",
    maxWidth: "400px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    width: "92%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  submitButton: {
    cursor: "pointer",
    width: "92%",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    width: "100%",
    transition: "background-color 0.3s",
  },
  errorMessage: {
    color: "red",
    marginBottom: "20px",
    fontWeight: "500",
  },
  divider: {
    width: "80%",
    border: "0",
    borderTop: "2px solid #28a745",
    margin: "20px 0",
  },
};

export default Login;
