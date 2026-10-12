
import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://ownshoe-backend.vercel.app"
).replace(/\/+$/, "");

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
