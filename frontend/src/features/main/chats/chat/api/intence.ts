import axios from "axios";

const messagesIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/chat",
  withCredentials: true,
});

export { messagesIntence };
