import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createBooking = async (data) => {
  const response = await api.post("/bookings", data);
  return response.data;
};

export const getRecentBookings = async () => {
  const response = await api.get("/bookings");
  const data = response.data;
  return Array.isArray(data) ? data.slice(0, 5) : [];
};
