import axios from "axios";

const chatIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/chat",
  withCredentials: true,
});

export { chatIntence };
