import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import auth from "../services/auth";
import { useState, useEffect } from "react";
import detail from "../services/detail";
import formatter from "../util/formatter";
import partsOrder from "../services/partsOrder";

const VehicleDetail = () => {
  const { vin } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);

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
      } finally {
        // loggedIn or Not, retrieve the vehicle detail info. After checking the loggedIn
        try {
          const detailResponse = await detail.getVehicleDetails(vin);
          console.log(detailResponse.data);
          setVehicleDetails(detailResponse.data);
        } catch (e) {
          console.log(e);
        }
      }
    };

    checkSession();
  }, []);

  const isAddPartAvailable = () => {
    return (
      loggedInUser &&
      (loggedInUser.user_type === "inventory_clerk" ||
        loggedInUser.user_type === "owner") &&
      vehicleDetails &&
      !vehicleDetails.vehicle.customer_buyer
    );
  };

  const isSellVehicleAvailable = () => {
    return (
      loggedInUser &&
      (loggedInUser.user_type === "sales_person" ||
        loggedInUser.user_type === "owner") &&
      vehicleDetails &&
      !vehicleDetails.vehicle.customer_buyer &&
      vehicleDetails.parts.every((part) => part.status === "installed")
    );
  };

  const isOwnerOrManager = () => {
    return (
      loggedInUser &&
      (loggedInUser.user_type === "manager" ||
        loggedInUser.user_type === "owner")
    );
  };

  const showPartsOrder = () => {
    return (
      loggedInUser &&
      (loggedInUser.user_type === "inventory_clerk" ||
        loggedInUser.user_type === "owner")
    );
  };

  const statusUpdate = async (part, newStatus) => {
    console.log(part, newStatus);
    try {
      const result = await partsOrder.updatePartStatus({
        part_number: part.part_number,
        parts_order_number: part.parts_order_number,
        status: newStatus,
      });
      setVehicleDetails({
        ...vehicleDetails,
        parts: vehicleDetails.parts.map((p) =>
          p.parts_order_number === part.parts_order_number &&
          p.part_number === part.part_number
            ? { ...part, status: newStatus }
            : p
        ),
      });
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial" }}>
      <Link to={"/"}>Go back to main page</Link>
      {vehicleDetails && (
        <div>
          <h2>
            {vehicleDetails.vehicle.manufacturer},{" "}
            {vehicleDetails.vehicle.model_year}
          </h2>
          <table>
            <tbody>
              <tr>
                <td>VIN:</td>
                <td>{vehicleDetails.vehicle.vin}</td>
              </tr>
              <tr>
                <td>Vehicle Type:</td>
                <td>{vehicleDetails.vehicle.vehicle_type}</td>
              </tr>
              <tr>
                <td>Manufacturer:</td>
                <td>{vehicleDetails.vehicle.manufacturer}</td>
              </tr>
              <tr>
                <td>Model:</td>
                <td>{vehicleDetails.vehicle.model}</td>
              </tr>
              <tr>
                <td>Fuel Type:</td>
                <td>{vehicleDetails.vehicle.fuel_type}</td>
              </tr>
              <tr>
                <td>Color(s):</td>
                <td>{vehicleDetails.vehicle.colors}</td>
              </tr>
              <tr>
                <td>Horsepower:</td>
                <td>{vehicleDetails.vehicle.horsepower}</td>
              </tr>
              {vehicleDetails.vehicle.purchase_price && (
                <tr>
                  <td>Purchase Price:</td>
                  <td>
                    {formatter.formatUSD(vehicleDetails.vehicle.purchase_price)}
                  </td>
                </tr>
              )}
              {loggedInUser &&
                ["inventory_clerk", "owner", "manager"].includes(
                  loggedInUser.user_type
                ) && (
                  <tr>
                    <td>Total Parts Price:</td>
                    <td>
                      {formatter.formatUSD(
                        vehicleDetails.vehicle.total_parts_price
                      )}
                    </td>
                  </tr>
                )}
              <tr>
                <td>Sale Price:</td>
                <td>
                  {formatter.formatUSD(vehicleDetails.vehicle.sale_price)}
                </td>
              </tr>
              <tr>
                <td>Description:</td>
                <td>{vehicleDetails.vehicle.description}</td>
              </tr>
              {loggedInUser &&
                ["owner", "manager"].includes(
                  loggedInUser.user_type
                ) && vehicleDetails.vehicle.purchase_date && (
                  <tr>
                    <td>Purchase Date:</td>
                    <td>
                      {formatter.formatDate(
                        vehicleDetails.vehicle.purchase_date
                      )}
                    </td>
                  </tr>
                )}
              {loggedInUser &&
                ["owner", "manager"].includes(
                  loggedInUser.user_type
                ) && vehicleDetails.vehicle.sale_date && (
                  <tr>
                    <td>Sale Date:</td>
                    <td>
                      {formatter.formatDate(
                        vehicleDetails.vehicle.sale_date
                      )}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
          {isOwnerOrManager() && (
            <div>
              <h2>Vehicle Transaction Details</h2>
              <p>
                <strong>Inventory Clerk: </strong>
                {vehicleDetails.inventory_clerk.name}
              </p>
              <p>
                <strong>Customer Seller Contact Info</strong>
              </p>
              <ul>
                {vehicleDetails.customer_seller.business_name ? (
                  <>
                    <li>
                      <strong>Business Name: </strong>
                      {vehicleDetails.customer_seller.business_name}
                    </li>
                    <li>
                      <strong>Title & Name: </strong>
                      {vehicleDetails.customer_seller.contact}
                    </li>
                  </>
                ) : (
                  <li>
                    <strong>Name: </strong>
                    {vehicleDetails.customer_seller.contact}
                  </li>
                )}
                <li>
                  <strong>Address: </strong>
                  {vehicleDetails.customer_seller.address}
                </li>
                <li>
                  <strong>Phone: </strong>
                  {vehicleDetails.customer_seller.phone_number}
                </li>
                {vehicleDetails.customer_seller.email && (
                  <li>
                    <strong>Email: </strong>
                    {vehicleDetails.customer_seller.email}
                  </li>
                )}
              </ul>
            </div>
          )}
          {isOwnerOrManager() && vehicleDetails.salesperson && (
            <div>
              <p>
                <strong>Salesperson: </strong>
                {vehicleDetails.salesperson.name}
              </p>
              <p>
                <strong>Customer Buyer Contact Info</strong>
              </p>
              <ul>
                {vehicleDetails.customer_buyer.business_name ? (
                  <>
                    <li>
                      <strong>Business Name: </strong>
                      {vehicleDetails.customer_buyer.business_name}
                    </li>
                    <li>
                      <strong>Title & Name: </strong>
                      {vehicleDetails.customer_buyer.contact}
                    </li>
                  </>
                ) : (
                  <li>
                    <strong>Name: </strong>
                    {vehicleDetails.customer_buyer.contact}
                  </li>
                )}
                <li>
                  <strong>Address: </strong>
                  {vehicleDetails.customer_buyer.address}
                </li>
                <li>
                  <strong>Phone: </strong>
                  {vehicleDetails.customer_buyer.phone_number}
                </li>
                {vehicleDetails.customer_buyer.email && (
                  <li>
                    <strong>Email: </strong>
                    {vehicleDetails.customer_buyer.email}
                  </li>
                )}
              </ul>
            </div>
          )}
          {isAddPartAvailable() && (
            <Link to={`/parts_order/${vin}`}>
              <button>Add parts order</button>
            </Link>
          )}
          {isSellVehicleAvailable() &&
            vehicleDetails.parts.every(
              (part) => part.status === "installed"
            ) && (
              <Link to={`/sell_vehicle/${vin}`}>
                <button>Sell Vehicle</button>
              </Link>
            )}
          {showPartsOrder() && (
            <div>
              <h3>Parts Order</h3>
              {vehicleDetails.parts.length === 0 ? (
                <p>There are no ordered parts</p>
              ) : (
                <div>
                  <p>
                    There are {vehicleDetails.parts.length} ordered part(s){" "}
                  </p>
                  {vehicleDetails.parts.map((part) => {
                    return (
                      <div key={part.parts_order_number + part.part_number}>
                        <h4>{part.description}</h4>
                        <table>
                          <tbody>
                            <tr>
                              <td>Vendor: </td>
                              <td>{part.vendor_name}</td>
                            </tr>
                            <tr>
                              <td>Parts Order #: </td>
                              <td>{part.parts_order_number}</td>
                            </tr>
                            <tr>
                              <td>Part #: </td>
                              <td>{part.part_number}</td>
                            </tr>
                            <tr>
                              <td>Quantity: </td>
                              <td>{part.quantity}</td>
                            </tr>
                            <tr>
                              <td>Unit Price: </td>
                              <td>{formatter.formatUSD(part.unit_price)}</td>
                            </tr>
                        <tr><td colSpan="2">
                          <strong>Part Status: </strong>
                          {part.status}
                        </td></tr>
                        {part.status !== "installed" && (
                                <>{part.status == "ordered" ? (
                                  <tr>
                                    <td>
                                      <button
                                        onClick={() =>
                                          statusUpdate(part, "received")
                                        }
                                      >
                                        Update Status to Received
                                      </button>
                                    </td>
                                    <td>
                                      <button
                                        onClick={() =>
                                          statusUpdate(part, "installed")
                                        }
                                      >
                                        Update Status to Installed
                                      </button>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr>
                                    <td>
                                      <button
                                        onClick={() =>
                                          statusUpdate(part, "installed")
                                        }
                                      >
                                        Update Status to Installed
                                      </button>
                                    </td>
                                  </tr>
                                )}
                                </>
                        )}
                          </tbody>
                        </table>
                        <hr />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
