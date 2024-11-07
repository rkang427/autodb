import { useParams } from "react-router-dom";
import { Link } from "react-router-dom"; 
import auth from "../services/auth";
import { useState, useEffect } from "react";

const VehicleDetail = () => {
  const { vin } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await auth.checkSession();
        console.log(response.data.user);
        if (response.data.user) {
          setLoggedInUser(response.data.user);
        }
      } catch (error) {
        console.error("Error checking session", error);
      }
    };

    checkSession();
  }, []);
  console.log(loggedInUser)
  return (
    <div>
      <h2>Vehicle Detail</h2>
      <h3>Vin: {vin}</h3>
      {/* TODO: Check if logged in as owner or inventory clerk */}
      { loggedInUser && (
        loggedInUser.user_type === "inventory_clerk" || loggedInUser.user_type === "owner") &&
        <Link to={`/parts_order/${vin}`}><button>Add parts order</button></Link>
      }
    </div>
  );
};

export default VehicleDetail;