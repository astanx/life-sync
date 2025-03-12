import axios from "axios";

const tasksIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/project/stages",
  withCredentials: true,
});

export { tasksIntence };
