import React, { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  Route,
  Sparkles,
  MapPin,
  Truck,
  Fuel,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  Zap,
  Navigation2,
  Users,
  Package,
  RefreshCw,
  LocateFixed,
  ExternalLink,
} from "lucide-react";

import { getDistance } from "geolib";

const API_URL = "http://localhost:5000/api";

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

const SmartDispatch = () => {
  const [job, setJob] = useState({
    pickup: "",
    drop: "",
    truckType: "",
    trailerSize: "",
    priority: "Fastest",
    goodsType: "",
  });

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [tripDistance, setTripDistance] = useState(0);

  const [selectedTruck, setSelectedTruck] = useState(null);

  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const normalizeStatus = (status) =>
    String(status || "").toLowerCase();

  const loadData = async () => {
    try {
      setLoading(true);

      const [truckRes, bookingRes, driverRes] =
        await Promise.all([

          fetchWithAuth(
            `${API_URL}/trucks`
          ),

          fetchWithAuth(
            `${API_URL}/bookings`
          ),

          fetchWithAuth(
            `${API_URL}/drivers`
          ),
        ]);

      const truckData = await truckRes.json();
      const bookingData = await bookingRes.json();
      const driverData = await driverRes.json();

      setTrucks(Array.isArray(truckData) ? truckData : []);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setDrivers(Array.isArray(driverData) ? driverData : []);
    } catch (err) {
      console.error(err);
      alert("Backend load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  // FREE LOCATION API
  const getCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}`
      );

      const data = await response.json();

      if (!data.length) return null;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const calculateETA = (distanceKm) => {
    const avgSpeed = 45;
    const hours = distanceKm / avgSpeed;

    if (hours < 1) {
      return `${Math.round(hours * 60)} mins`;
    }

    return `${hours.toFixed(1)} hrs`;
  };

  const estimatedAmount = useMemo(() => {
    if (!tripDistance || !job.truckType) return 0;

    const rate = truckRates[job.truckType] || 0;

    return Math.round(tripDistance * rate);
  }, [tripDistance, job.truckType]);

  const availableTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const status = normalizeStatus(truck.status);

      return (
        status.includes("available") ||
        status.includes("idle") ||
        status === ""
      );
    });
  }, [trucks]);

  const scoredTrucks = useMemo(() => {
    if (!pickupCoords) return [];

    return availableTrucks

      .filter((truck) => {
        if (!job.truckType) return true;

        return truck.name === job.truckType;
      })

      .map((truck, index) => {
        
        const COMPANY_LOCATION = {
          lat: 8.7107,
          lng: 77.4516,
          place: "Ambasamudram",
        };

        const latestTruckLocation =
          truck.lastGpsLocation?.lat &&
          truck.lastGpsLocation?.lng
            ? truck.lastGpsLocation
            : truck.liveLocation;

        if (
          !latestTruckLocation ||
          !latestTruckLocation.lat ||
          !latestTruckLocation.lng
        ) {
          return null;
        }

        const truckLat = latestTruckLocation.lat;
        const truckLng = latestTruckLocation.lng;

        const distanceMeters = getDistance(
          {
            latitude: pickupCoords.lat,
            longitude: pickupCoords.lng,
          },
          {
            latitude: truckLat,
            longitude: truckLng,
          }
        );

        const distanceKm = (distanceMeters / 1000).toFixed(1);

        const fuel = Number(truck.fuelLevel || 70);

        const rating = Number(truck.rating || 4.5);

        const distanceScore = Math.max(
          0,
          100 - Number(distanceKm) * 2
        );

        const fuelScore = fuel;

        const ratingScore = rating * 20;

        const aiScore = Math.round(
          distanceScore * 0.5 +
            fuelScore * 0.3 +
            ratingScore * 0.2
        );

        return {
          ...truck,
          distanceKm,
          fuel,
          rating,
          aiScore,
          eta: calculateETA(distanceKm),
          driverName:
          truck.driver?.name ||
          truck.driverName ||
          "Available Driver",

        truckLocation:
           latestTruckLocation.place || "Unknown Location",
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.aiScore - a.aiScore);
  }, [availableTrucks, pickupCoords]);

  const handleRunAI = async () => {
    if (!job.pickup || !job.drop) {
      alert("Enter pickup and drop");
      return;
    }

    try {
      setLocationLoading(true);

      const pickup = await getCoordinates(job.pickup);
      const drop = await getCoordinates(job.drop);

      if (!pickup) {
        alert(
          "Pickup location not found. Try: Chennai, Bangalore, Coimbatore..."
        );
        return;
      }

      if (!drop) {
        alert("Drop location not found");
        return;
      }

      setPickupCoords(pickup);
      setDropCoords(drop);

      const distanceMeters = getDistance(
        {
          latitude: pickup.lat,
          longitude: pickup.lng,
        },
        {
          latitude: drop.lat,
          longitude: drop.lng,
        }
      );

      const distanceKm = (distanceMeters / 1000).toFixed(1);

      setTripDistance(distanceKm);

      setTimeout(() => {
        if (scoredTrucks.length > 0) {
          setSelectedTruck(scoredTrucks[0]);
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Location detect failed");
    } finally {
      setLocationLoading(false);
    }
  };

  const openGoogleMap = () => {
    if (!selectedTruck || !pickupCoords) return;

    const truckLat =
      selectedTruck.liveLocation?.lat ||
      selectedTruck.currentLocation?.lat;

    const truckLng =
      selectedTruck.liveLocation?.lng ||
      selectedTruck.currentLocation?.lng;

    window.open(
      `https://www.google.com/maps/dir/${truckLat},${truckLng}/${pickupCoords.lat},${pickupCoords.lng}`,
      "_blank"
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <div style={styles.badge}>
            <Sparkles size={16} />
            AI SMART DISPATCH
          </div>

          <h1 style={styles.title}>
            Real-Time Fleet Intelligence
          </h1>

          <p style={styles.subtitle}>
            Live GPS + AI based truck recommendation system
          </p>
        </div>

        <div style={styles.heroBox}>
          <LocateFixed size={34} />
          <h2>{availableTrucks.length}</h2>
          <p>Available Trucks</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            Dispatch Requirement
          </h3>

          <div style={styles.formGrid}>
            <input
              name="pickup"
              placeholder="Pickup Location"
              value={job.pickup}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              name="drop"
              placeholder="Drop Location"
              value={job.drop}
              onChange={handleChange}
              style={styles.input}
            />

            <select
              name="truckType"
              value={job.truckType}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">
                Select a Truck
              </option>

              <option value="Mini Truck (TATA Ace)">
                🚛 Mini Truck (TATA Ace)
              </option>

              <option value="Pickup Truck">
                🚚 Pickup Truck
              </option>

              <option value="20ft / 22ft / 24ft Container">
                📦 20ft / 22ft / 24ft Container
              </option>

              <option value="32 ft Container Truck (SXL)">
                🚛 32 ft Container Truck (SXL)
              </option>

              <option value="32 ft Container Truck (MXL)">
                🚛 32 ft Container Truck (MXL)
              </option>

              <option value="19 ft Open Truck">
                🚚 19 ft Open Truck
              </option>

              <option value="10 Tyre Truck">
                🛞 10 Tyre Truck
              </option>

              <option value="12 Tyre Truck">
                🛞 12 Tyre Truck
              </option>

              <option value="14 Tyre Truck">
                🛞 14 Tyre Truck
              </option>

              <option value="16 Tyre Truck">
                🛞 16 Tyre Truck
              </option>

              <option value="Trailer Truck">
                🚛 Trailer Truck
              </option>
            </select>

            {job.truckType === "Trailer Truck" && (
              <select
                name="trailerSize"
                value={job.trailerSize}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  marginTop: "10px",
                }}
                required
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
            )}
                 
            <select
              name="priority"
              value={job.priority}
              onChange={handleChange}
              style={styles.input}
            >
              <option>Fastest</option>
              <option>Lowest Cost</option>
              <option>Best Rated</option>
            </select>

            <input
              name="goodsType"
              placeholder="Goods Type"
              value={job.goodsType}
              onChange={handleChange}
              style={styles.input}
            />

            {tripDistance > 0 && (
              <div style={styles.estimateBox}>
                <h3 style={{ margin: 0 }}>
                  Distance: {tripDistance} KM
                </h3>

                <h2 style={{ marginTop: 10 }}>
                  Estimated Amount: ₹{estimatedAmount.toLocaleString()}
                </h2>
              </div>
            )}

            <button
              onClick={handleRunAI}
              style={styles.runBtn}
            >
              {locationLoading
                ? "Detecting..."
                : "Run AI Dispatch"}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {!selectedTruck ? (
            <div style={styles.empty}>
              <Truck size={60} />
              <h3>No Truck Selected</h3>
            </div>
          ) : (
            <>
              <div style={styles.recommend}>
                <CheckCircle2 size={18} />
                Best AI Match
              </div>

              <h2>{selectedTruck.name}</h2>

              <div style={styles.info}>
                <span>Truck Number</span>
                <strong>
                  {selectedTruck.number || "TN-00-0000"}
                </strong>
              </div>

              <div style={styles.info}>
                <span>Distance</span>
                <strong>
                  {selectedTruck.distanceKm} km
                </strong>
              </div>

              <div style={styles.info}>
                <span>ETA</span>
                <strong>{selectedTruck.eta}</strong>
              </div>

              <div style={styles.info}>
                <span>Truck Current Location</span>
                <strong>
                  {selectedTruck.truckLocation}
                </strong>
              </div>

              <div style={styles.info}>
                <span>Fuel</span>
                <strong>{selectedTruck.fuel}%</strong>
              </div>

              <div style={styles.info}>
                <span>Driver</span>
                <strong>
                  {selectedTruck.driverName}
                </strong>
              </div>

              <div style={styles.info}>
                <span>AI Score</span>
                <strong>
                  {selectedTruck.aiScore}%
                </strong>
              </div>

              <button
                onClick={openGoogleMap}
                style={styles.mapBtn}
              >
                <ExternalLink size={18} />
                Open Google Route
              </button>
            </>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.fleetHeader}>
          <h3 style={styles.sectionTitle}>
            Live Fleet Ranking
          </h3>

          <button
            onClick={loadData}
            style={styles.refreshBtn}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div style={styles.fleetList}>
          {scoredTrucks.map((truck) => (
            <div
              key={truck._id}
              style={styles.truckRow}
            >
              <div>
                <h4 style={{ margin: 0 }}>
                  {truck.name || "Truck"}
                </h4>

                <p style={styles.rowText}>
                  {truck.distanceKm} km • ETA{" "}
                  {truck.eta}
                </p>
              </div>

              <div style={styles.score}>
                {truck.aiScore}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: 34,
    borderRadius: 34,
    background:
      "linear-gradient(135deg,#071b34 0%,#0f2f57 30%,#144d8d 70%,#2563eb 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow:
      "0 30px 70px rgba(37,99,235,0.35)",
  },

  badge: {
    display: "inline-flex",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    fontWeight: 900,
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },

  title: {
    margin: "20px 0 12px",
    fontSize: "2.5rem",
    fontWeight: 900,
    color: "#fff",
  },

  subtitle: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.8,
  },

  heroBox: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))",
    padding: 28,
    borderRadius: 28,
    textAlign: "center",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 26,
  },

  card: {
    background:
      "linear-gradient(135deg,#ffffff 0%,#f8fbff 100%)",
    padding: 28,
    borderRadius: 30,
    boxShadow:
      "0 25px 60px rgba(15,74,136,0.12)",
    border: "1px solid rgba(255,255,255,0.7)",
  },

  sectionTitle: {
    marginBottom: 22,
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "1.3rem",
  },

  formGrid: {
    display: "grid",
    gap: 18,
  },

  input: {
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid rgba(37,99,235,0.12)",
    fontSize: "1rem",
    outline: "none",
    fontWeight: 700,
    background:
      "linear-gradient(135deg,#ffffff,#f8fbff)",
    boxShadow:
      "0 10px 25px rgba(15,74,136,0.06)",
    transition: "all 0.28s ease",
  },

  runBtn: {
    padding: 18,
    border: "none",
    borderRadius: 20,
    background:
      "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow:
      "0 20px 45px rgba(99,102,241,0.35)",
    transition: "all 0.3s ease",
  },

  empty: {
    height: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    gap: 12,
  },

  recommend: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    background:
      "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    color: "#047857",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    marginBottom: 18,
  },

  info: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: "1px solid #edf2f7",
  },

  mapBtn: {
    width: "100%",
    marginTop: 22,
    padding: 16,
    border: "none",
    borderRadius: 18,
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow:
      "0 20px 45px rgba(99,102,241,0.3)",
  },

  fleetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  refreshBtn: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 999,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
  },

  fleetList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  truckRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 22,
    background:
      "linear-gradient(135deg,#eff6ff,#ffffff)",
    border: "1px solid rgba(99,102,241,0.1)",
    boxShadow:
      "0 12px 28px rgba(99,102,241,0.08)",
  },

  rowText: {
    color: "#64748b",
    marginTop: 6,
  },

  score: {
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    boxShadow:
      "0 12px 30px rgba(99,102,241,0.25)",
  },
  estimateBox: {
    padding: 20,
    borderRadius: 14,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    textAlign: "center",
  },
};



export default SmartDispatch;