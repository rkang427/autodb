import axios from "axios";

const updatePartStatus = async (part) => {
  return await axios.patch(
    "http://localhost:3000/partsorder/updateStatus",
    part,
    {
      withCredentials: true,
    }
  );
};

export default { updatePartStatus };
