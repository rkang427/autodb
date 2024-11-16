/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import search from "../services/search";
import { useEffect, useState } from "react";
import ReportLinks from "./ReportLinks";
import SearchResults from "./SearchResults";
import Notification from "./Notification";
import { Link } from "react-router-dom";

const Landing = ({ loggedInUser }) => {
  const [searchOptions, setSearchOptions] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchParams, setSearchParams] = useState({
    vin: "",
    vehicle_type: "",
    manufacturer: "",
    model_year: "",
    fuel_type: "",
    color: "",
    keyword: "",
    filter_type: "unsold",
  });

  useEffect(() => {
    const getSearchOptions = async () => {
      const response = await search.searchOptions();
      console.log(response.data);
      setSearchOptions(response.data);
    };

    getSearchOptions();
  }, []);

  const notify = (message, type) => {
    setNotification({ message: message, type: type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(searchParams).filter(([key, value]) => value !== "")
    );
    try {
      const result = await search.runSearch(params);
      console.log(result.data);
      setSearchResults(result.data);
    } catch (e) {
      notify(e.response.data.errors[0].msg, "error");
      setSearchResults([]);
    }
  };

  return (
    <div>
      {searchOptions && (
        <>
          <p>
            Available Cars: {searchOptions.ready}
            {searchOptions.not_ready != null && (
              <p>Car with Pending Parts: {searchOptions.not_ready}</p>
            )}
          </p>
          {loggedInUser &&
            ["owner", "manager"].includes(loggedInUser.user_type) && (
              <ReportLinks />
            )}
          <h2>Search Vehicles</h2>

          <form onSubmit={handleSubmit}>
            <div>
              {loggedInUser && (
                <>
                  <label>Vin: </label>
                  <input
                    type="text"
                    value={searchParams.vin}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, vin: e.target.value })
                    }
                  />
                </>
              )}
            </div>
            {loggedInUser &&
              ["owner", "manager"].includes(loggedInUser.user_type) && (
                <div>
                  <label>Filter Type: </label>
                  <select
                    id="dropdown"
                    value={searchParams.filter_type}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        filter_type: e.target.value,
                      })
                    }
                  >
                    <option value="unsold">Unsold</option>
                    <option value="sold">Sold</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              )}
            <div>
              <label>Vehicle Type: </label>
              <select
                id="dropdown"
                value={searchParams.vehicle_type}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    vehicle_type: e.target.value,
                  })
                }
              >
                <option value=""></option>
                {searchOptions.vehicle_types.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Manufacturer: </label>
              <select
                id="dropdown"
                value={searchParams.manufacturer}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    manufacturer: e.target.value,
                  })
                }
              >
                <option value=""></option>
                {searchOptions.manufacturers.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Year: </label>
              <select
                id="dropdown"
                value={searchParams.model_year}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    model_year: e.target.value,
                  })
                }
              >
                <option value=""></option>
                {searchOptions.model_years.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Fuel Type: </label>
              <select
                id="dropdown"
                value={searchParams.fuel_type}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    fuel_type: e.target.value,
                  })
                }
              >
                <option value=""></option>
                {searchOptions.fuel_types.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Color: </label>
              <select
                id="dropdown"
                value={searchParams.color}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    color: e.target.value,
                  })
                }
              >
                <option value=""></option>
                {searchOptions.colors.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Keyword: </label>
              <input
                type="text"
                value={searchParams.keyword}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    keyword: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <input type="submit" value="Search" />
            </div>
          </form>
        </>
      )}
      <Notification notification={notification} />
      <SearchResults searchResults={searchResults} />
    </div>
  );
};

export default Landing;
