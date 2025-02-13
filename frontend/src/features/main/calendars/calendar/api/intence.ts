import axios from "axios";

const eventIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/calendar/events",
  withCredentials: true,
});

export { eventIntence };
