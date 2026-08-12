const API_URL =
  import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
};

const request = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

/* 🚚 TRUCK APIs */
export const getTrucks = () => request("/trucks");

export const addTruck = (truckData) =>
  request("/trucks", {
    method: "POST",
    body: JSON.stringify(truckData),
  });

export const deleteTruck = (truckId) =>
  request(`/trucks/${truckId}`, {
    method: "DELETE",
  });

/* 👨‍✈️ DRIVER APIs */
export const getDrivers = () => request("/drivers");

export const addDriver = (driverData) =>
  request("/drivers", {
    method: "POST",
    body: JSON.stringify(driverData),
  });

export const deleteDriver = (driverId) =>
  request(`/drivers/${driverId}`, {
    method: "DELETE",
  });

/* 📦 BOOKING APIs */
export const getBookings = () => request("/bookings");

export const createBooking = (bookingData) =>
  request("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });

export const cancelBooking = (bookingId) =>
  request(`/bookings/${bookingId}`, {
    method: "DELETE",
  });

/* 🧪 Health check */
export const checkBackend = () => request("");