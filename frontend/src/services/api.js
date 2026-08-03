import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  const publicUrls = [
    "/auth/login",
    "/auth/register",
  ];

  if (
    token &&
    !publicUrls.some((url) => config.url.includes(url))
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;