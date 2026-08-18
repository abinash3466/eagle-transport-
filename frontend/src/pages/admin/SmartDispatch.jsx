import React, { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { calculateTripPricing } from "../../utils/pricingCalculator";
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

const RAW_API_URL = String(import.meta.env.VITE_API_URL || "").trim();

const API_URL = RAW_API_URL
  ? `${RAW_API_URL.replace(/\/+$/, "")}${/\/api$/i.test(
    RAW_API_URL.replace(/\/+$/, "")
  )
    ? ""
    : "/api"}`
  : "/api";

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

  const pricing = useMemo(
    () => calculateTripPricing(job.truckType, tripDistance),
    [tripDistance, job.truckType]
  );

  const estimatedAmount = pricing.totalWithGST;

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
    <div className="smart-dispatch-page" style={styles.page}>
      <div className="smart-dispatch-hero" style={styles.hero}>
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

        <div className="smart-dispatch-hero-box" style={styles.heroBox}>
          <LocateFixed size={34} />
          <h2>{availableTrucks.length}</h2>
          <p>Available Trucks</p>
        </div>
      </div>

      <div className="smart-dispatch-grid" style={styles.grid}>
        <div className="smart-dispatch-card smart-dispatch-form-card" style={styles.card}>
          <h3 style={styles.sectionTitle}>
            Dispatch Requirement
          </h3>

          <div className="smart-dispatch-form-grid" style={styles.formGrid}>
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
              <div className="smart-dispatch-estimate" style={{ ...styles.estimateBox, backgroundColor: '#071b34', color: '#fff', textAlign: 'left', padding: '20px', borderRadius: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#ff7a00', fontWeight: '800' }}>AI Dispatch Invoice Preview</h4>

                <p style={{ margin: '6px 0', fontSize: '0.92rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Distance:</span> <strong>{tripDistance} KM</strong>
                </p>

                <p style={{ margin: '6px 0', fontSize: '0.92rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Actual Amount:</span>
                  <strong>₹{pricing.baseAmount.toLocaleString('en-IN')}</strong>
                </p>

                <p style={{ margin: '6px 0', fontSize: '0.92rem', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.8)' }}>
                  <span>GST (5%):</span>
                  <strong>+₹{pricing.gstAmount.toLocaleString('en-IN')}</strong>
                </p>

                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '12px 0' }} />

                <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '900' }}>₹{estimatedAmount.toLocaleString('en-IN')}</span>
                </h3>
              </div>
            )}

            <button
              className="smart-dispatch-run"
              onClick={handleRunAI}
              style={styles.runBtn}
            >
              {locationLoading
                ? "Detecting..."
                : "Run AI Dispatch"}
            </button>
          </div>
        </div>

        <div className="smart-dispatch-card smart-dispatch-result-card" style={styles.card}>
          {!selectedTruck ? (
            <div className="smart-dispatch-empty" style={styles.empty}>
              <Truck size={60} />
              <h3>No Truck Selected</h3>
            </div>
          ) : (
            <>
              <div className="smart-dispatch-recommend" style={styles.recommend}>
                <CheckCircle2 size={18} />
                Best AI Match
              </div>

              <h2>{selectedTruck.name}</h2>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>Truck Number</span>
                <strong>
                  {selectedTruck.number || "TN-00-0000"}
                </strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>Distance</span>
                <strong>
                  {selectedTruck.distanceKm} km
                </strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>ETA</span>
                <strong>{selectedTruck.eta}</strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>Truck Current Location</span>
                <strong>
                  {selectedTruck.truckLocation}
                </strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>Fuel</span>
                <strong>{selectedTruck.fuel}%</strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>Driver</span>
                <strong>
                  {selectedTruck.driverName}
                </strong>
              </div>

              <div className="smart-dispatch-info" style={styles.info}>
                <span>AI Score</span>
                <strong>
                  {selectedTruck.aiScore}%
                </strong>
              </div>

              <button
                className="smart-dispatch-map-btn"
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

      <div className="smart-dispatch-card smart-dispatch-fleet-card" style={styles.card}>
        <div className="smart-dispatch-fleet-header" style={styles.fleetHeader}>
          <h3 style={styles.sectionTitle}>
            Live Fleet Ranking
          </h3>

          <button
            className="smart-dispatch-refresh"
            onClick={loadData}
            style={styles.refreshBtn}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="smart-dispatch-fleet-list" style={styles.fleetList}>
          {scoredTrucks.map((truck) => (
            <div
              className="smart-dispatch-truck-row"
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
      <style>{`
        @media (max-width: 768px) {
          .smart-dispatch-page {
            width: 100% !important;
            min-width: 0 !important;
            gap: 14px !important;
            overflow-x: hidden !important;
          }

          .smart-dispatch-hero {
            padding: 18px !important;
            border-radius: 22px !important;
            gap: 14px !important;
            align-items: stretch !important;
            flex-direction: column !important;
            box-shadow: 0 16px 34px rgba(37, 99, 235, 0.18) !important;
          }

          .smart-dispatch-hero > div:first-child > div:first-child {
            padding: 7px 11px !important;
            font-size: 10px !important;
            gap: 6px !important;
          }

          .smart-dispatch-hero h1 {
            margin: 11px 0 6px !important;
            font-size: 25px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.6px !important;
          }

          .smart-dispatch-hero > div:first-child > p {
            margin: 0 !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
          }

          .smart-dispatch-hero-box {
            display: grid !important;
            grid-template-columns: auto auto 1fr !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 11px 13px !important;
            border-radius: 15px !important;
            text-align: left !important;
          }

          .smart-dispatch-hero-box svg {
            width: 22px !important;
            height: 22px !important;
          }

          .smart-dispatch-hero-box h2 {
            margin: 0 !important;
            font-size: 22px !important;
          }

          .smart-dispatch-hero-box p {
            margin: 0 !important;
            font-size: 10px !important;
          }

          .smart-dispatch-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .smart-dispatch-card {
            width: 100% !important;
            min-width: 0 !important;
            padding: 15px !important;
            border-radius: 19px !important;
            box-sizing: border-box !important;
            box-shadow: 0 12px 28px rgba(15, 74, 136, 0.09) !important;
          }

          .smart-dispatch-card > h3,
          .smart-dispatch-fleet-header h3 {
            margin: 0 0 13px !important;
            font-size: 16px !important;
          }

          .smart-dispatch-form-grid {
            gap: 10px !important;
          }

          .smart-dispatch-form-grid input,
          .smart-dispatch-form-grid select {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            padding: 11px 12px !important;
            border-radius: 12px !important;
            font-size: 11.5px !important;
            box-shadow: 0 4px 12px rgba(15,74,136,0.04) !important;
          }

          .smart-dispatch-estimate {
            padding: 13px !important;
            border-radius: 14px !important;
          }

          .smart-dispatch-estimate h4 {
            margin-bottom: 8px !important;
            font-size: 12px !important;
          }

          .smart-dispatch-estimate p {
            margin: 4px 0 !important;
            font-size: 10.5px !important;
          }

          .smart-dispatch-estimate h3 {
            font-size: 12px !important;
          }

          .smart-dispatch-estimate h3 span:last-child {
            font-size: 19px !important;
          }

          .smart-dispatch-run,
          .smart-dispatch-map-btn {
            min-height: 43px !important;
            padding: 0 13px !important;
            border-radius: 13px !important;
            font-size: 11.5px !important;
            box-shadow: 0 10px 22px rgba(99,102,241,0.20) !important;
            transition: transform .16s ease, box-shadow .16s ease !important;
          }

          .smart-dispatch-run:active,
          .smart-dispatch-map-btn:active,
          .smart-dispatch-refresh:active {
            transform: scale(.98) !important;
          }

          .smart-dispatch-empty {
            height: 150px !important;
            gap: 6px !important;
          }

          .smart-dispatch-empty svg {
            width: 40px !important;
            height: 40px !important;
          }

          .smart-dispatch-empty h3 {
            margin: 2px 0 !important;
            font-size: 14px !important;
          }

          .smart-dispatch-recommend {
            padding: 7px 10px !important;
            margin-bottom: 10px !important;
            font-size: 10px !important;
            gap: 6px !important;
          }

          .smart-dispatch-result-card > h2 {
            margin: 2px 0 10px !important;
            font-size: 20px !important;
          }

          .smart-dispatch-info {
            padding: 9px 0 !important;
            gap: 10px !important;
            font-size: 10.5px !important;
            align-items: flex-start !important;
          }

          .smart-dispatch-info span {
            color: #64748b !important;
            flex: 0 0 44% !important;
          }

          .smart-dispatch-info strong {
            text-align: right !important;
            overflow-wrap: anywhere !important;
          }

          .smart-dispatch-map-btn {
            margin-top: 12px !important;
          }

          .smart-dispatch-fleet-header {
            margin-bottom: 12px !important;
            gap: 8px !important;
          }

          .smart-dispatch-fleet-header h3 {
            margin-bottom: 0 !important;
          }

          .smart-dispatch-refresh {
            padding: 8px 10px !important;
            border-radius: 11px !important;
            font-size: 10px !important;
            gap: 5px !important;
          }

          .smart-dispatch-refresh svg {
            width: 14px !important;
            height: 14px !important;
          }

          .smart-dispatch-fleet-list {
            gap: 9px !important;
          }

          .smart-dispatch-truck-row {
            padding: 11px 12px !important;
            border-radius: 13px !important;
            gap: 10px !important;
            box-shadow: 0 6px 16px rgba(99,102,241,0.06) !important;
          }

          .smart-dispatch-truck-row h4 {
            font-size: 12px !important;
          }

          .smart-dispatch-truck-row p {
            margin: 3px 0 0 !important;
            font-size: 9.5px !important;
          }

          .smart-dispatch-truck-row > div:last-child {
            padding: 7px 10px !important;
            font-size: 10px !important;
            border-radius: 999px !important;
            flex-shrink: 0 !important;
          }
        }

        @media (max-width: 420px) {
          .smart-dispatch-hero { padding: 16px !important; border-radius: 19px !important; }
          .smart-dispatch-hero h1 { font-size: 22px !important; }
          .smart-dispatch-card { padding: 13px !important; border-radius: 17px !important; }
          .smart-dispatch-form-grid input, .smart-dispatch-form-grid select { padding: 10px 11px !important; font-size: 11px !important; }
          .smart-dispatch-run, .smart-dispatch-map-btn { min-height: 41px !important; }
          .smart-dispatch-info { font-size: 10px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-dispatch-run, .smart-dispatch-map-btn, .smart-dispatch-refresh { transition: none !important; }
        }

        /* =========================================================
           SMART DISPATCH — DARK MODE FINAL VISUAL FIX
           UI ONLY.
           No functions, calculations, AI scoring, pricing,
           API calls, location logic or content changed.
        ========================================================= */

        body[data-theme="dark"] .smart-dispatch-card,
        html[data-theme="dark"] .smart-dispatch-card {
          color: #dce9f6 !important;

          background:
            linear-gradient(
              145deg,
              #0d2238 0%,
              #091c2f 100%
            ) !important;

          border:
            1px solid rgba(132, 174, 214, 0.14) !important;

          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.18) !important;
        }


        /* FORM CARD */

        body[data-theme="dark"] .smart-dispatch-form-card,
        html[data-theme="dark"] .smart-dispatch-form-card {
          background:
            linear-gradient(
              145deg,
              #0e263f 0%,
              #0a1e32 100%
            ) !important;
        }


        body[data-theme="dark"] .smart-dispatch-form-card > h3,
        html[data-theme="dark"] .smart-dispatch-form-card > h3,
        body[data-theme="dark"] .smart-dispatch-fleet-header h3,
        html[data-theme="dark"] .smart-dispatch-fleet-header h3 {
          color: #f4f8fd !important;
        }


        /* INPUTS + SELECT */

        body[data-theme="dark"] .smart-dispatch-form-grid input,
        body[data-theme="dark"] .smart-dispatch-form-grid select,
        html[data-theme="dark"] .smart-dispatch-form-grid input,
        html[data-theme="dark"] .smart-dispatch-form-grid select {
          color: #eef6ff !important;

          background:
            #102b46 !important;

          border:
            1px solid rgba(132, 177, 218, 0.20) !important;

          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
        }


        body[data-theme="dark"] .smart-dispatch-form-grid input::placeholder,
        html[data-theme="dark"] .smart-dispatch-form-grid input::placeholder {
          color: #849bb2 !important;
          opacity: 1 !important;
        }


        body[data-theme="dark"] .smart-dispatch-form-grid select option,
        html[data-theme="dark"] .smart-dispatch-form-grid select option {
          color: #eef6ff !important;
          background: #0c243b !important;
        }


        body[data-theme="dark"] .smart-dispatch-form-grid input:focus,
        body[data-theme="dark"] .smart-dispatch-form-grid select:focus,
        html[data-theme="dark"] .smart-dispatch-form-grid input:focus,
        html[data-theme="dark"] .smart-dispatch-form-grid select:focus {
          border-color: #3b92df !important;

          box-shadow:
            0 0 0 3px rgba(59, 146, 223, 0.11) !important;
        }


        /* RESULT CARD */

        body[data-theme="dark"] .smart-dispatch-result-card,
        html[data-theme="dark"] .smart-dispatch-result-card {
          background:
            radial-gradient(
              circle at 50% 38%,
              rgba(50, 125, 195, 0.07),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              #0d2238 0%,
              #091c2f 100%
            ) !important;
        }


        body[data-theme="dark"] .smart-dispatch-empty,
        html[data-theme="dark"] .smart-dispatch-empty {
          color: #8198ae !important;
        }


        body[data-theme="dark"] .smart-dispatch-empty svg,
        html[data-theme="dark"] .smart-dispatch-empty svg {
          color: #6f91b1 !important;
          stroke: #6f91b1 !important;
        }


        body[data-theme="dark"] .smart-dispatch-empty h3,
        html[data-theme="dark"] .smart-dispatch-empty h3 {
          color: #b9ccde !important;
        }


        /* SELECTED RESULT DETAILS */

        body[data-theme="dark"] .smart-dispatch-result-card > h2,
        html[data-theme="dark"] .smart-dispatch-result-card > h2 {
          color: #f2f7fd !important;
        }


        body[data-theme="dark"] .smart-dispatch-info,
        html[data-theme="dark"] .smart-dispatch-info {
          border-bottom-color:
            rgba(132, 174, 214, 0.10) !important;
        }


        body[data-theme="dark"] .smart-dispatch-info span,
        html[data-theme="dark"] .smart-dispatch-info span {
          color: #8fa7bf !important;
        }


        body[data-theme="dark"] .smart-dispatch-info strong,
        html[data-theme="dark"] .smart-dispatch-info strong {
          color: #eef6ff !important;
        }


        /* RECOMMEND CHIP */

        body[data-theme="dark"] .smart-dispatch-recommend,
        html[data-theme="dark"] .smart-dispatch-recommend {
          color: #3cd8a5 !important;

          background:
            rgba(16, 185, 129, 0.10) !important;

          border:
            1px solid rgba(16, 185, 129, 0.16) !important;
        }


        /* FLEET CARD */

        body[data-theme="dark"] .smart-dispatch-fleet-card,
        html[data-theme="dark"] .smart-dispatch-fleet-card {
          background:
            linear-gradient(
              145deg,
              #0d2238 0%,
              #091c2f 100%
            ) !important;
        }


        body[data-theme="dark"] .smart-dispatch-truck-row,
        html[data-theme="dark"] .smart-dispatch-truck-row {
          color: #e9f3fd !important;

          background:
            linear-gradient(
              145deg,
              #102a44 0%,
              #0b2137 100%
            ) !important;

          border:
            1px solid rgba(132, 174, 214, 0.13) !important;

          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.12) !important;
        }


        body[data-theme="dark"] .smart-dispatch-truck-row h4,
        html[data-theme="dark"] .smart-dispatch-truck-row h4 {
          color: #eef6ff !important;
        }


        body[data-theme="dark"] .smart-dispatch-truck-row p,
        html[data-theme="dark"] .smart-dispatch-truck-row p {
          color: #8fa7bf !important;
        }


        /* MOBILE COMPACT DARK MODE */

        @media (max-width: 768px) {

          body[data-theme="dark"] .smart-dispatch-card,
          html[data-theme="dark"] .smart-dispatch-card {
            padding: 14px !important;
            border-radius: 18px !important;
          }


          body[data-theme="dark"] .smart-dispatch-form-grid input,
          body[data-theme="dark"] .smart-dispatch-form-grid select,
          html[data-theme="dark"] .smart-dispatch-form-grid input,
          html[data-theme="dark"] .smart-dispatch-form-grid select {
            background: #102b46 !important;
          }


          body[data-theme="dark"] .smart-dispatch-empty,
          html[data-theme="dark"] .smart-dispatch-empty {
            height: 135px !important;
          }


          body[data-theme="dark"] .smart-dispatch-fleet-card,
          html[data-theme="dark"] .smart-dispatch-fleet-card {
            padding: 13px !important;
          }

        }


      `}</style>
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