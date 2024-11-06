import axios from "axios";

const searchOptions = async () => {
  return await axios.get("http://localhost:3000/", {
    withCredentials: true,
  });
};

const runSearch = async (searchParams) => {
  return await axios.get("http://localhost:3000/vehicle/search", {
    params: searchParams,
    withCredentials: true,
  });
};

export default { searchOptions, runSearch };
