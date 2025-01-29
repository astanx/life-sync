import axios from "axios";

const intence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/user",
});

export { intence };
