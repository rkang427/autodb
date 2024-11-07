import { useParams } from "react-router-dom";
import auth from "../services/auth";
import { useState, useEffect } from "react";

const SellVehicle = () => {
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
  return (<>
    { loggedInUser && (loggedInUser.user_type === "sales_person" || loggedInUser.user_type === "owner") && (
    <div>
      <h2>Sell Vehicle</h2>
      <h3>Vin: {vin}</h3>
      {/* TODO: Check if logged in as owner or inventory clerk */}
    </div>
  ) || <h2>Forbidden</h2>}
  </>);
};

export default SellVehicle;