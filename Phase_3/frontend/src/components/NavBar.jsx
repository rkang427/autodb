import { Link } from "react-router-dom"; 

/* eslint-disable react/prop-types */
const NavBar = ({ loggedInUser, handleLogout }) => {
  if (!loggedInUser) return null;

  return (
    <>
      <p>
        Hello, {loggedInUser.first_name}!{" "}
        {["owner", "inventory_clerk"].includes(loggedInUser.user_type) && (
        <Link to="/add_vehicle"><button>Add Vehicle</button></Link> 
        )}
        <button onClick={handleLogout}>Logout</button>
      </p>
    </>
  );
};

export default NavBar;