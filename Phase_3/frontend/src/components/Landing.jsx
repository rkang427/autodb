/* eslint-disable react/prop-types */
import search from "../services/search";
import { useEffect, useState } from "react";

const Landing = ({ loggedInUser }) => {
  const [searchOptions, setSearchOptions] = useState(null);

  useEffect(() => {
    const getSearchOptions = async () => {
      const response = await search.searchOptions();
      console.log(response.data);
      setSearchOptions(response.data);
    };

    getSearchOptions();
  }, []);

  if (!loggedInUser) return null;
  return (
    <div>
      <h2>Search Vehicles</h2>
    </div>
  );
};

export default Landing;
