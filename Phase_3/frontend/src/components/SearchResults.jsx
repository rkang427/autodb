import { Link } from "react-router-dom";
import formatter from "../util/formatter";

/* eslint-disable react/prop-types */
const SearchResults = ({ searchResults }) => {
  if (searchResults.length == 0) return null;

  return (
    <div>
      <h2>Search Results</h2>
      <p>
        There are {searchResults.length} results for the given search criteria.
      </p>
      {searchResults.map((car) => {
        return (
          <div key={car.vin}>
            <h4>
               {car.manufacturer} {car.model} , {car.model_year}
              <Link to={`/vehicle_detail/${car.vin}`}>
                <button style={{border: "1px solid black"}}>Vehicle Details</button>
              </Link>
            </h4>
            <table>
              <tbody>
                <tr>
                  <td>VIN:</td>
                  <td>{car.vin}</td>
                </tr>
                <tr>
                  <td>Vehicle Type:</td>
                  <td>{car.vehicle_type}</td>
                </tr>
                <tr>
                  <td>Manufacturer:</td>
                  <td>{car.manufacturer}</td>
                </tr>
                <tr>
                  <td>Model:</td>
                  <td>{car.model}</td>
                </tr>
                <tr>
                  <td>Year:</td>
                  <td>{car.model_year}</td>
                </tr>
                <tr>
                  <td>Fuel Type:</td>
                  <td>{car.fuel_type}</td>
                </tr>
                <tr>
                  <td>Color(s):</td>
                  <td>{car.colors}</td>
                </tr>
                <tr>
                  <td>Horsepower:</td>
                  <td>{car.horsepower}</td>
                </tr>
                <tr>
                  <td>Sale Price:</td>
                  <td>{formatter.formatUSD(car.sale_price)}</td>
                </tr>
              </tbody>
            </table>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
