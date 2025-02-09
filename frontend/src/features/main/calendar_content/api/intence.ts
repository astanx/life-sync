import axios from "axios";

const calendarIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/calendar",
  withCredentials: true,
});
export { calendarIntence };
