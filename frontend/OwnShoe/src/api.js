
import axios from "axios";

const LOCAL_API = "http://localhost:8000";
const DEPLOYED_API = "https://ownshoe-backend.vercel.app";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? LOCAL_API : DEPLOYED_API);

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ownshoe-token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);