import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store logout function reference
let logoutFunction: (() => void) | null = null;

// Function to set logout function from auth context
  export const setLogoutFunction = (logout: () => void) => {
    logoutFunction = logout;
  };

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (logoutFunction) {
        logoutFunction();
      } else {
        localStorage.removeItem("token");
      }
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
