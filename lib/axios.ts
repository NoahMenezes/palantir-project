import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          "http://127.0.0.1:8000/auth/refresh",
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (err) {
        // Handle refresh token failure (e.g., redirect to login)
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
