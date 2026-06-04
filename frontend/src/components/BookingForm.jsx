import React, { useState } from 'react';
import { calculateEstimate } from '../api/bookingApi';
import { calculateDistance } from "../utils/distanceCalculator";
import { createBooking } from "../api/api";
import {
  fetchWithAuth,
} from "../utils/fetchWithAuth";
import {
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import {
  Truck,
  MapPin,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const BookingForm = () => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
    libraries: ["places"],
  });

  const truckRates = {
    "Mini Truck (TATA Ace)": 24,
    "Pickup Truck": 32,

    "20ft / 22ft / 24ft Container": 42,

    "19 ft Open Truck": 46,

    "32 ft Container Truck (SXL)": 52,
    "32 ft Container Truck (MXL)": 60,

    "10 Tyre Truck": 58,
    "12 Tyre Truck": 68,
    "14 Tyre Truck": 82,
    "16 Tyre Truck": 96,

    "40 ft Trailer": 48,
    "45 ft Trailer": 58,
    "48 ft Trailer": 68,
    "53 ft Trailer": 82,
  };

  const minimumCharges = {
    "Mini Truck (TATA Ace)": 2500,
    "Pickup Truck": 3500,

    "20ft / 22ft / 24ft Container": 7000,

    "19 ft Open Truck": 8000,

    "32 ft Container Truck (SXL)": 12000,
    "32 ft Container Truck (MXL)": 14000,

    "10 Tyre Truck": 16000,
    "12 Tyre Truck": 19000,
    "14 Tyre Truck": 22000,
    "16 Tyre Truck": 26000,

    "40 ft Trailer": 25000,
    "45 ft Trailer": 32000,
    "48 ft Trailer": 40000,
    "53 ft Trailer": 50000,
  };

  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    pickup_location: '',
    drop_location: '',
    trip_level: 'District',
    truck_type: 'Mini Truck (TATA Ace)',
    goods_type: '',
    load_weight: '',
  });

  const [estimate, setEstimate] = useState(null);
  const [estimateDetails, setEstimateDetails] = useState(null);

  const [pickupAutoComplete, setPickupAutoComplete] =
    useState(null);

  const [dropAutoComplete, setDropAutoComplete] =
    useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);

  const [distanceKm, setDistanceKm] = useState(0);

  const searchPlace = async (query, type) => {
    if (!query || query.length < 2) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&addressdetails=1&limit=8`
      );

      const data = await response.json();

      if (type === "pickup") {
        setPickupSuggestions(data);
        setShowPickupSuggestions(true);
      } else {
        setDropSuggestions(data);
        setShowDropSuggestions(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDistance = async (pickup, drop) => {
    try {
      const geoPickup = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`
      );

      const pickupData = await geoPickup.json();

      const geoDrop = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${drop}`
      );

      const dropData = await geoDrop.json();

      if (pickupData.length && dropData.length) {
        const lat1 = parseFloat(pickupData[0].lat);
        const lon1 = parseFloat(pickupData[0].lon);

        const lat2 = parseFloat(dropData[0].lat);
        const lon2 = parseFloat(dropData[0].lon);

        const R = 6371;

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = Math.round(R * c);

        setDistanceKm(distance);

        return distance;
      }
    } catch (err) {
      console.log(err);
    }

    return 0;
  };

  const handleCheckFare = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.pickup_location ||
        !formData.drop_location
      ) {
        alert("Enter pickup & drop");
        return;
      }

      const ratePerKm =
        truckRates[formData.truck_type];

      if (!ratePerKm) {
        alert("Truck rate missing ❌");
        return;
      }

      // GOOGLE DISTANCE
      const distanceKm =
        await calculateDistance(
          formData.pickup_location,
          formData.drop_location
        );

      // FARE
      const calculatedAmount =
        distanceKm * ratePerKm;

      // MINIMUM
      const minimumCharge =
        minimumCharges[
        formData.truck_type
        ] || 0;

      // FINAL
      const totalAmount = Math.max(
        calculatedAmount,
        minimumCharge
      );

      setEstimate(totalAmount);

      setEstimateDetails({
        distance: distanceKm,
        rate: ratePerKm,
        minimumCharge,
      });

    } catch (error) {
      console.error(error);

      alert(
        "Distance calculate panna mudila ❌"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      customerName: formData.customer_name,
      phone: formData.mobile,
      pickup: formData.pickup_location,
      drop: formData.drop_location,
      goods: formData.goods_type || formData.truck_type,
      amount: estimate || 0,
      bookingType: "public",
      priority: "normal",
      status: "Booked",
      notes: `Trip Level: ${formData.trip_level}, Truck Type: ${formData.truck_type}`,
    };

    try {
      const saved = await createBooking(bookingData);

      if (saved.whatsappLink) {
        window.open(saved.whatsappLink, "_blank");
      }

      const savedBooking = saved.booking || saved;
      const bookingId = savedBooking?.bookingId || "Generated";
      const otp = savedBooking?.otp || "0000";

      alert(
        `Booking Submitted Successfully ✅\nBooking ID: ${bookingId}\nTracking OTP: ${otp}`
      );

      const phoneNumber = formData.mobile.replace(/\D/g, "");

      const message = `🚚 Eagle Transport Booking Confirmed ✅

Hello ${formData.customer_name},

🆔 Booking ID: ${bookingId}
🔐 Tracking OTP: ${otp}

📍 Pickup: ${formData.pickup_location}
📍 Drop: ${formData.drop_location}

🚛 Truck Type: ${formData.truck_type}
💰 Estimated Fare: ₹${estimate ? estimate.toLocaleString() : 0}

Track:
${window.location.origin}/tracking`;

      window.open(
        `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      setFormData({
        customer_name: '',
        mobile: '',
        pickup_location: '',
        drop_location: '',
        trip_level: 'District',
        truck_type: 'Mini Truck (TATA Ace)',
        goods_type: '',
        load_weight: '',
      });

      setEstimate(null);
    } catch (error) {
      console.error(error);
      alert("Booking submit panna error vandhudhu ❌");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div className="glass-card" style={styles.formCard}>
        <div style={styles.topRow}>
          <div style={styles.badge}>
            <Truck size={15} />
            Instant Booking
          </div>

          <div style={styles.liveTag}>
            ● Live Tracking
          </div>
        </div>

        <h3 style={styles.title}>
          Book a Truck <span style={styles.highlight}>Instantly</span>
        </h3>

        <p style={styles.subtitle}>
          Fast booking with secure tracking & instant confirmation.
        </p>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div className="form-group">
            <label style={styles.label}>
              <User size={15} />
              Full Name
            </label>

            <div style={styles.inputWrap}>
              <input
                type="text"
                name="customer_name"
                className="form-control"
                placeholder="Rajesh Kumar"
                value={formData.customer_name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={styles.label}>
              <Phone size={15} />
              Mobile Number
            </label>

            <div style={styles.inputWrap}>
              <input
                type="tel"
                name="mobile"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={styles.label}>
              <MapPin size={15} />
              Pickup Location
            </label>

            <div style={styles.inputWrap}>
              <Autocomplete
                options={{
                  componentRestrictions: {
                    country: "in",
                  },
                }}
                onLoad={(auto) =>
                  setPickupAutoComplete(auto)
                }
                onPlaceChanged={() => {
                  if (!pickupAutoComplete) return;

                  const place =
                    pickupAutoComplete.getPlace();

                  if (place?.formatted_address) {
                    setFormData((prev) => ({
                      ...prev,
                      pickup_location:
                        place.formatted_address,
                    }));
                  }
                }}
              >
                <input
                  type="text"
                  name="pickup_location"
                  placeholder="Pickup Location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </Autocomplete>
            </div>
          </div>

          <div className="form-group">
            <label style={styles.label}>
              <MapPin size={15} />
              Drop Location
            </label>

            <div style={styles.inputWrap}>
              <Autocomplete
                options={{
                  componentRestrictions: {
                    country: "in",
                  },
                }}
                onLoad={(auto) =>
                  setDropAutoComplete(auto)
                }
                onPlaceChanged={() => {
                  if (!dropAutoComplete) return;

                  const place =
                    dropAutoComplete.getPlace();

                  if (place?.formatted_address) {
                    setFormData((prev) => ({
                      ...prev,
                      drop_location:
                        place.formatted_address,
                    }));
                  }
                }}
              >
                <input
                  type="text"
                  name="drop_location"
                  placeholder="Drop Location"
                  value={formData.drop_location}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </Autocomplete>
            </div>
          </div>

          <div
            className="form-group"
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              gap: '14px'
            }}
          >

            <div style={{ flex: 1 }}>
              <label style={styles.label}>
                <Truck size={15} />
                Truck Type
              </label>

              <select
                name="truck_type"
                className="form-control"
                value={formData.truck_type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Truck</option>

                <option value="Mini Truck (TATA Ace)">
                  Mini Truck (TATA Ace)
                </option>

                <option value="Pickup Truck">
                  Pickup Truck
                </option>

                <option value="32 ft Container Truck (MXL)">
                  32 ft Container Truck (MXL)
                </option>

                <option value="32 ft Container Truck (SXL)">
                  32 ft Container Truck (SXL)
                </option>

                <option value="20ft / 22ft / 24ft Container">
                  20ft / 22ft / 24ft Container
                </option>

                <option value="19 ft Open Truck">
                  19 ft Open Truck
                </option>

                <option value="10 Tyre Truck">
                  10 Tyre Truck
                </option>

                <option value="12 Tyre Truck">
                  12 Tyre Truck
                </option>

                <option value="14 Tyre Truck">
                  14 Tyre Truck
                </option>

                <option value="16 Tyre Truck">
                  16 Tyre Truck
                </option>

                <option value="Trailer Truck">
                  Trailer Truck
                </option>
              </select>

              

              {/* TRAILER SIZE SELECT */}
              {formData.truck_type === "Trailer Truck" && (
                <div style={{ marginTop: "14px" }}>
                  <select
                    name="trailer_size"
                    value={formData.trailer_size || ""}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">
                      Select Trailer Size
                    </option>

                    <option value="40 ft">
                      40 ft Trailer
                    </option>

                    <option value="45 ft">
                      45 ft Trailer
                    </option>

                    <option value="48 ft">
                      48 ft Trailer
                    </option>

                    <option value="53 ft">
                      53 ft Trailer
                    </option>
                  </select>
                </div>
              )}
            </div>
            
           

            <div style={{ flex: 1 }}>
              <label style={styles.label}>
                <ShieldCheck size={15} />
                Trip Level
              </label>

              <select
                name="trip_level"
                className="form-control"
                value={formData.trip_level}
                onChange={handleChange}
                style={styles.select}
              >
                <option>District</option>
                <option>State</option>
                <option>National</option>
              </select>
            </div>
          </div>

          {distanceKm > 0 && (
            <div style={styles.distanceBox}>
              <h3 style={{ margin: 0 }}>
                Total Distance: {distanceKm} KM
              </h3>
            </div>
          )}

          {estimate && (
            <div style={styles.estimateBox}>
              <span style={styles.estimateText}>
                Estimated Fare
              </span>

              <h2 style={styles.estimateAmount}>
                ₹{estimate.toLocaleString()}
              </h2>
              
            </div>
          )}

          <div style={styles.actions}>
            {!estimate ? (
              <button
                type="button"
                style={styles.fareBtn}
                onClick={handleCheckFare}
              >
                Check Truck Fare
              </button>
            ) : (
              <button
                type="submit"
                style={styles.confirmBtn}
              >
                Confirm Booking
              </button>
            )}
          </div>

          <div style={styles.note}>
            ℹ️ After booking, you will receive Booking ID & Tracking OTP.
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
  },

  formCard: {
    padding: '30px',
    borderRadius: '28px',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.96) 100%)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },

  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    color: '#2563eb',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '0.82rem',
  },

  liveTag: {
    background: 'rgba(34,197,94,0.12)',
    color: '#16a34a',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '0.82rem',
  },

  title: {
    fontSize: '2rem',
    marginBottom: '8px',
    fontWeight: '900',
    color: '#0f172a',
  },

  highlight: {
    background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  subtitle: {
    color: '#64748b',
    marginBottom: '24px',
    fontSize: '0.95rem',
    fontWeight: '500',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 16px',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '0.92rem',
  },

  inputWrap: {
    position: 'relative',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid #dbe4ef',
    background: '#ffffff',
    outline: 'none',
    fontSize: '1rem',
    transition: '0.3s',
    boxSizing: 'border-box',
  },

  select: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid #dbe4ef',
    background: '#ffffff',
    outline: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  estimateBox: {
    gridColumn: '1 / -1',
    background:
      'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    borderRadius: '20px',
    padding: '18px',
    marginBottom: '16px',
    marginTop: '12px',
    textAlign: 'center',
    boxShadow: '0 14px 30px rgba(37,99,235,0.25)',
  },

  estimateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },

  estimateAmount: {
    color: '#fff',
    margin: '8px 0 0',
    fontSize: '2rem',
    fontWeight: '900',
  },

  actions: {
    gridColumn: '1 / -1',
    marginBottom: '16px',
  },

  fareBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '16px',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #0f172a 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 16px 30px rgba(37,99,235,0.22)',
  },

  confirmBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '16px',
    background:
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 16px 30px rgba(22,163,74,0.22)',
  },

  note: {
    gridColumn: '1 / -1',
    fontSize: '0.82rem',
    color: '#475569',
    textAlign: 'center',
    padding: '14px',
    background: 'rgba(37,99,235,0.08)',
    borderRadius: '16px',
    fontWeight: '600',
  },
  suggestionBox: {
    position: "absolute",
    top: "105%",
    left: 0,
    right: 0,
    background: "#ffffff",
    borderRadius: "22px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
    zIndex: 999,
    maxHeight: "320px",
    overflowY: "auto",
    border: "1px solid #dbeafe",
    padding: "8px",
  },

  suggestionItem: {
    padding: "14px 16px",
    cursor: "pointer",
    borderRadius: "14px",
    marginBottom: "6px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "0.92rem",
    fontWeight: "600",
    transition: "0.2s",
  },

  distanceBox: {
    gridColumn: "1 / -1",
    padding: "18px",
    borderRadius: "18px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    textAlign: "center",
    marginTop: "10px",
  },
};

export default BookingForm;