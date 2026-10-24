
import axios from "axios";

const api = axios.create({
  baseURL: "https://route-posts.routemisr.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("social_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
