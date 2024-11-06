import axios from "axios";

const searchOptions = async () => {
  return await axios.get("http://localhost:3000/", {
    withCredentials: true,
  });
};

export default { searchOptions };
