import axios from "axios";

const eventIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/calendar/events",
  withCredentials: true,
});

const calendarIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/calendar",
  withCredentials: true,
});

export { eventIntence, calendarIntence };
