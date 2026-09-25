import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("udharo_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");

      localStorage.removeItem("udharo_token");
      localStorage.removeItem("udharo_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
