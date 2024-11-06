import axios from "axios";

const checkSession = async () => {
  return await axios.get("http://localhost:3000/auth/session", {
    withCredentials: true,
  });
};

const login = async (username, password) => {
  await axios.post(
    "http://localhost:3000/auth/login",
    { username, password },
    { withCredentials: true }
  );
};

const logout = async () => {
  await axios.post(
    "http://localhost:3000/auth/logout",
    {},
    { withCredentials: true }
  );
};

export default { checkSession, login, logout };
