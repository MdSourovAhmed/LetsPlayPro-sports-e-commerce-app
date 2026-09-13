import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // || "http://localhost:5000/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧩 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: debug log only in dev
    if (import.meta.env.DEV) {
      console.log("🔹 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🧩 Handle responses and log errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", {
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Avoid crashing when error.config is undefined (network fail)
    const safeUrl = error.config?.url || "Unknown URL";

    if (import.meta.env.DEV) {
      console.error("❌ API Error:", {
        url: safeUrl,
        error: error.response?.data || error.message,
      });
    }

    // Optional: handle 401s globally (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirect user
    }

    return Promise.reject(error);
  }
);

export default api;
