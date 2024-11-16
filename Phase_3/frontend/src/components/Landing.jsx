/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import search from "../services/search";
import { useEffect, useState } from "react";
import ReportLinks from "./ReportLinks";
import SearchResults from "./SearchResults";
import Notification from "./Notification";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";

const Field = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
    <label style={{ marginRight: "10px", minWidth: "120px", flexShrink: 0 }}>
      {label}
    </label>
    <div style={{ flexGrow: 1 }}>{children}</div>
  </div>
);

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
                <Field label="Vin:">
                  <input
                    type="text"
                    placeholder="Enter VIN"
                    value={searchParams.vin}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, vin: e.target.value })
                    }
                  />
                </Field>
              )}
            </div>
            {loggedInUser &&
              ["owner", "manager"].includes(loggedInUser.user_type) && (
                <Field label="Filter Type:">
                  <Dropdown
                    name="filter_type"
                    options={["unsold", "sold", "both"]}
                    value={searchParams.filter_type}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        filter_type: e.target.value,
                      })
                    }
                  />
                </Field>
              )}
              
            <Field label="Vehicle Type:">
              <Dropdown
                name="vehicle_type"
                options={searchOptions.vehicle_types}
                value={searchParams.vehicle_type}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    vehicle_type: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Manufacturer:">
              <Dropdown
                name="manufacturer"
                options={searchOptions.manufacturers}
                value={searchParams.manufacturer}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    manufacturer: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Year:">
              <Dropdown
                name="model_year"
                options={searchOptions.model_years}
                value={searchParams.model_year}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    model_year: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Fuel Type:">
              <Dropdown
                name="fuel_type"
                options={searchOptions.fuel_types}
                value={searchParams.fuel_type}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    fuel_type: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Color:">
              <Dropdown
                name="color"
                options={searchOptions.colors}
                value={searchParams.color}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    color: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Keyword:">
              <input
                type="text"
                placeholder="Enter Keyword"
                value={searchParams.keyword}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    keyword: e.target.value,
                  })
                }
              />
            </Field>

            <div>
              <input type="submit" value="Search" style={{cursor: "pointer"}} />
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
