import axios from "axios";

const projectsIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/project",
  withCredentials: true,
});
export { projectsIntence };
