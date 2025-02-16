import axios from "axios";

const stagesIntence = axios.create({
  baseURL: "https://lifesync-backend.onrender.com/api/project/stages",
  withCredentials: true,
});

export { stagesIntence };
