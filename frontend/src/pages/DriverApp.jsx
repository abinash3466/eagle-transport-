import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { fetchWithAuth } from "../utils/fetchWithAuth";
import {
  Truck,
  MapPin,
  Fuel,
  Wrench,
  Settings,
  Bell,
  Navigation,
  CheckCircle,
  Navigation2,
  CreditCard,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  BatteryCharging,
  Gauge,
  Droplets,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const DriverApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [showPassword, setShowPassword] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);
  const [showDriverNotifications, setShowDriverNotifications] = useState(false);
  const [driverNotifications, setDriverNotifications] = useState([]);

  const [loginData, setLoginData] = useState({
    driverId: '',
    password: '',
  });

  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [forgotData, setForgotData] = useState({
    driverId: "",
    otp: "",
    newPassword: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [driverData, setDriverData] = useState({});

  const [routeData, setRouteData] = useState({
    bookingMongoId: '',
    bookingId: '',
    driverMongoId: '',
    truckMongoId: '',
    pickup: 'Not Assigned',
    destination: 'Not Assigned',
    currentLocation: 'Not Started',
    tripStatus: 'No Active Trip',
    reachedDestination: false,
  });

  const [healthData, setHealthData] = useState({
    fuelLevel: 62,
    engineOil: 74,
    tyreCondition: 81,
    batteryHealth: 88,
  });

  const hasAssignedTruck = driverData?.truckName && driverData.truckName !== "Not Assigned";
  const [gpsLog, setGpsLog] = useState([]);

  const [fuelForm, setFuelForm] = useState({
    pumpName: '',
    liters: '',
    amount: '',
    fuelType: 'Diesel',
    place: '',
  });

  const [tollForm, setTollForm] = useState({
    tollgate: '',
    amount: '',
    paymentMethod: 'FASTag',
    place: '',
  });

  const [issueForm, setIssueForm] = useState({
    issueType: 'Tyre Issue',
    severity: 'Medium',
    description: '',
    location: '',
  });

  const [tripEndForm, setTripEndForm] = useState({
    remarks: '',
    destinationReached: false,
  });

  const [settingsData, setSettingsData] = useState({
    darkMode: false,
    gpsAutoUpdate: true,
    alertsOn: true,
  });

  const [fuelLogs, setFuelLogs] = useState([]);
  const [tollLogs, setTollLogs] = useState([]);
  const [issueLogs, setIssueLogs] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const clearSuccess = () => {
    setTimeout(() => setSuccessMsg(''), 2200);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/drivers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token || data.driver?.token);
      setIsLoggedIn(true);

      const getTruckImage = (truck) => {
        const truckType = (
          truck?.truckType ||
          truck?.category ||
          truck?.name ||
          ""
        ).toLowerCase();

        if (truckType.includes("mini") || truckType.includes("tata ace")) {
          return "/truck-fleet/mini_truck.jpg";
        }
        if (truckType.includes("pickup")) {
          return "/truck-fleet/pickup_truck.jpg";
        }
        if (truckType.includes("32 ft") || truckType.includes("32ft")) {
          return "/truck-fleet/32ft_container.jpg";
        }
        if (
          truckType.includes("20ft") ||
          truckType.includes("22ft") ||
          truckType.includes("24ft") ||
          truckType.includes("container")
        ) {
          return "/truck-fleet/container_truck.jpg";
        }
        if (truckType.includes("19 ft") || truckType.includes("19ft") || truckType.includes("open truck")) {
          return "/truck-fleet/open_truck.jpg";
        }
        if (truckType.includes("10 tyre")) {
          return "/truck-fleet/10_tyre_truck.jpg";
        }
        if (truckType.includes("12 tyre")) {
          return "/truck-fleet/12_tyre_truck.jpg";
        }
        if (truckType.includes("14 tyre")) {
          return "/truck-fleet/14_tyre_truck.jpg";
        }
        if (truckType.includes("16 tyre")) {
          return "/truck-fleet/16_tyre_truck.jpg";
        }
        if (truckType.includes("trailer")) {
          return "/truck-fleet/trailer_truck.jpg";
        }
        return "/truck-fleet/default_truck.jpg";
      };

      const truck = data.booking?.truck || data.driver?.assignedTruck;

      setDriverData({
        _id: data.driver._id,
        name: data.driver.name || "Driver",
        driverId: data.driver.driverId,
        truckName: truck?.name || truck?.category || "Not Assigned",
        truckNumber: truck?.number || truck?.truckNumber || truck?.vehicleNumber || "-",
        truckImage: getTruckImage(truck),
        status: data.driver.status || "available",
      });

      if (data.booking) {
        setRouteData({
          bookingMongoId: data.booking._id,
          bookingId: data.booking.bookingId,
          driverMongoId: data.driver._id,
          truckMongoId: truck?._id || "",
          pickup: data.booking.pickup || "Not Added",
          destination: data.booking.drop || "Not Added",
          currentLocation: data.booking.currentLocation || data.booking.pickup || "Not Started",
          tripStatus: data.booking.status || "Dispatched",
          reachedDestination: false,
        });

        setDriverNotifications([
          {
            title: "New Trip Assigned",
            message: `${data.booking.pickup || "Pickup"} → ${data.booking.drop || "Drop"}`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }

      setSuccessMsg("Driver login successful ✅");
      clearSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Server error");
    }
  };

  const sendResetOtp = async () => {
    const driverId = forgotData.driverId.trim();

    if (!driverId) {
      alert("Enter Driver ID");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/drivers/send-driver-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Unable to send OTP");
        return;
      }

      setOtpSent(true);
      alert("OTP sent to your registered email ✅");
    } catch (error) {
      console.error("Driver OTP send error:", error);
      alert("Unable to send OTP");
    }
  };

  const resetPassword = async () => {
    const driverId = forgotData.driverId.trim();
    const otp = forgotData.otp.trim();
    const newPassword = forgotData.newPassword;

    if (!driverId || !otp || !newPassword) {
      alert("Driver ID, OTP and new password are required");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/drivers/verify-driver-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Password reset failed");
        return;
      }

      alert("Password Reset Successful ✅");
      setShowForgotPassword(false);
      setForgotData({ driverId: "", otp: "", newPassword: "" });
      setOtpSent(false);
    } catch (error) {
      console.error("Driver password reset error:", error);
      alert("Password reset failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setActiveMenu('Home');
    setLoginData({ driverId: '', password: '' });
    setDriverData({});
    setRouteData({
      bookingMongoId: '',
      bookingId: '',
      driverMongoId: '',
      truckMongoId: '',
      pickup: 'Not Assigned',
      destination: 'Not Assigned',
      currentLocation: 'Not Started',
      tripStatus: 'No Active Trip',
      reachedDestination: false,
    });
  };

  const updateGpsLocation = async () => {
    if (!routeData.bookingMongoId) {
      alert("No active booking assigned");
      return;
    }

    if (!navigator.geolocation) {
      alert("GPS not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const currentLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        try {
          // ✅ fetchWithAuth மற்றும் சரியான ஹெட்டர்ஸ் அமைப்பு
          const res = await fetchWithAuth(
            `${API_URL}/bookings/${routeData.bookingMongoId}/location`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentLocation,
                liveLocation: {
                  lat,
                  lng,
                  updatedAt: new Date(),
                },
              }),
            }
          );

          const data = await res.json();

          if (!res.ok || !data.success) {
            alert(data.message || "Location update failed");
            return;
          }

          setRouteData((prev) => ({
            ...prev,
            currentLocation,
          }));

          setGpsLog((prev) => [
            {
              place: currentLocation,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "Live GPS Updated",
            },
            ...prev,
          ]);

          setSuccessMsg("Live GPS location updated ✅");
          clearSuccess();
        } catch (err) {
          console.error(err);
          alert("Server error while updating live GPS");
        }
      },
      (error) => {
        console.error("GPS error:", error);
        alert("Please allow location permission to update live GPS");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!settingsData.gpsAutoUpdate) return;
    if (!routeData.bookingMongoId) return;
    if (routeData.tripStatus !== "In Transit") return;

    const timer = setInterval(() => {
      updateGpsLocation();
    }, 60000);

    return () => clearInterval(timer);
  }, [
    isLoggedIn,
    settingsData.gpsAutoUpdate,
    routeData.bookingMongoId,
    routeData.tripStatus,
  ]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!routeData.bookingMongoId) return;
    if (routeData.tripStatus !== "In Transit") return;

    const reminderTimer = setInterval(() => {
      const confirmSend = window.confirm(
        "📍 2-hour customer location update due.\n\nDo you want to send WhatsApp live location update now?"
      );

      if (confirmSend) {
        updateGpsLocation();
      }
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(reminderTimer);
  }, [isLoggedIn, routeData.bookingMongoId, routeData.tripStatus]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    const liters = Number(fuelForm.liters || 0);
    if (!fuelForm.pumpName || !fuelForm.amount || !fuelForm.place || liters <= 0) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/fuel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fuelForm,
          liters,
          amount: Number(fuelForm.amount),
          booking: routeData.bookingMongoId || null,
          driver: routeData.driverMongoId || null,
          truck: routeData.truckMongoId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Fuel log failed");
        return;
      }

      setFuelLogs((prev) => [{ ...fuelForm, id: Date.now(), time: new Date().toLocaleString() }, ...prev]);
      setHealthData((prev) => ({ ...prev, fuelLevel: Math.min(100, prev.fuelLevel + Math.round(liters * 2)) }));
      setFuelForm({ pumpName: "", liters: "", amount: "", fuelType: "Diesel", place: "" });
      setSuccessMsg("Fuel log saved to backend ✅");
      clearSuccess();
      setActiveMenu("Home");
    } catch (error) {
      console.error("Fuel log error:", error);
      alert("Server error while saving fuel log");
    }
  };

  const handleTollSubmit = async (e) => {
    e.preventDefault();
    if (!tollForm.tollgate || !tollForm.amount || !tollForm.place) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/toll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...tollForm,
          amount: Number(tollForm.amount),
          booking: routeData.bookingMongoId || null,
          driver: routeData.driverMongoId || null,
          truck: routeData.truckMongoId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Toll log failed");
        return;
      }

      setTollLogs((prev) => [{ ...tollForm, id: Date.now(), time: new Date().toLocaleString() }, ...prev]);
      setTollForm({ tollgate: "", amount: "", paymentMethod: "FASTag", place: "" });
      setSuccessMsg("Toll entry saved to backend ✅");
      clearSuccess();
      setActiveMenu("Home");
    } catch (error) {
      console.error("Toll log error:", error);
      alert("Server error while saving toll log");
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.description || !issueForm.location) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...issueForm,
          booking: routeData.bookingMongoId || null,
          driver: routeData.driverMongoId || null,
          truck: routeData.truckMongoId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Issue submit failed");
        return;
      }

      setIssueLogs((prev) => [{ ...issueForm, id: Date.now(), time: new Date().toLocaleString() }, ...prev]);

      if (issueForm.issueType.toLowerCase().includes("oil")) {
        setHealthData((prev) => ({ ...prev, engineOil: Math.max(20, prev.engineOil - 15) }));
      }
      if (issueForm.issueType.toLowerCase().includes("tyre")) {
        setHealthData((prev) => ({ ...prev, tyreCondition: Math.max(20, prev.tyreCondition - 18) }));
      }

      setIssueForm({ issueType: "Tyre Issue", severity: "Medium", description: "", location: "" });
      setSuccessMsg("Truck issue saved to backend ✅");
      clearSuccess();
      setActiveMenu("Home");
    } catch (error) {
      console.error("Issue error:", error);
      alert("Server error while submitting issue");
    }
  };

  const handleStartTrip = async () => {
    if (!driverData._id) {
      alert("Driver information missing");
      return;
    }

    try {
      const res = await fetchWithAuth(
        `${API_URL}/drivers/${driverData._id}/start-trip`,
        {
          method: "PUT"
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Start trip failed");
        return;
      }

      setRouteData((prev) => ({
        ...prev,
        tripStatus: "In Transit",
        currentLocation: prev.pickup,
      }));

      setGpsLog((prev) => [
        {
          place: routeData.pickup || "Pickup Point",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "Trip Started",
        },
        ...prev,
      ]);

      setSuccessMsg("Trip Started Successfully 🚀");
      clearSuccess();
    } catch (err) {
      console.error(err);
      alert("Server error while starting trip");
    }
  };

  const handleEndTrip = async (e) => {
    e.preventDefault();

    if (!routeData.bookingMongoId) {
      alert("No active booking assigned");
      return;
    }

    if (!tripEndForm.destinationReached) {
      setSuccessMsg("Please confirm destination reached before ending trip");
      clearSuccess();
      return;
    }

    try {
      const res = await fetchWithAuth(
        `${API_URL}/bookings/${routeData.bookingMongoId}/end-trip`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ remarks: tripEndForm.remarks }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "End trip failed ❌");
        return;
      }

      setRouteData((prev) => ({
        ...prev,
        tripStatus: "Trip Completed",
        reachedDestination: true,
        currentLocation: prev.destination,
      }));

      setGpsLog((prev) => [
        {
          place: routeData.destination || "Destination Point",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "Trip Ended",
        },
        ...prev,
      ]);

      setTripEndForm({ remarks: "", destinationReached: false });
      setSuccessMsg("Trip ended successfully ✅");
      clearSuccess();
      setActiveMenu("Home");
    } catch (error) {
      console.error("End trip error:", error);
      alert("Server error while ending trip ❌");
    }
  };

  useEffect(() => {
    if (!driverData?._id) return;

    const loadTripHistory = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/drivers/${driverData._id}/trips`, {
          method: "GET"
        });
        const data = await res.json();

        if (data.success) {
          setTripHistory(data.trips || []);
        }
      } catch (error) {
        console.error("Trip history load error:", error);
      }
    };

    loadTripHistory();
  }, [driverData?._id, isLoggedIn]);

  const healthCards = useMemo(
    () => [
      {
        title: 'Fuel Level',
        value: `${healthData.fuelLevel}%`,
        icon: <Fuel size={22} />,
        color: 'var(--primary-blue)',
        progress: healthData.fuelLevel,
      },
      {
        title: 'Engine Oil',
        value: `${healthData.engineOil}%`,
        icon: <Droplets size={22} />,
        color: 'var(--warning)',
        progress: healthData.engineOil,
      },
      {
        title: 'Tyre Condition',
        value: `${healthData.tyreCondition}%`,
        icon: <Gauge size={22} />,
        color: 'var(--success)',
        progress: healthData.tyreCondition,
      },
      {
        title: 'Battery Health',
        value: `${healthData.batteryHealth}%`,
        icon: <BatteryCharging size={22} />,
        color: 'var(--danger)',
        progress: healthData.batteryHealth,
      },
    ],
    [healthData]
  );

  const DriverLiveMap = ({ routeData, driverData }) => {
    const [response, setResponse] = useState(null);
    const [routeIndex, setRouteIndex] = useState(0);
    const [routeOptions, setRouteOptions] = useState([]);
    const [mapError, setMapError] = useState('');
    const [dynamicApiKey, setDynamicApiKey] = useState('');

    // 🔄 பேக்-எண்ட் .env-ல் இருந்து லைவ் கீ-யை இழுக்கும் லாஜிக் அண்ணே
    useEffect(() => {
      const fetchKey = async () => {
        try {
          const res = await fetch(`${API_URL}/config/google-maps-key`);
          const data = await res.json();
          if (data.success) {
            setDynamicApiKey(data.apiKey);
          }
        } catch (err) {
          console.error("Error fetching Google Maps Key from backend:", err);
        }
      };
      fetchKey();
    }, []);

    const { isLoaded } = useJsApiLoader({
      // 🚀 பேக்-எண்ட் கீ கிடைத்தால் அதை எடுக்கும், இல்லைனா பிரண்ட்-எண்ட் .env கீ-யை பேக்கப்பாக எடுக்கும்!
      googleMapsApiKey: dynamicApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places'],
    });

    const directionsCallback = (res) => {
      if (res !== null) {
        if (res.status === 'OK') {
          if (!response) {
            setResponse(res);

            const labels = [
              "Bypass Highway (Fastest Route)",
              "City Road (Shortest / No Tolls)",
              "Shortcut Route (Local Bypass)"
            ];

            const routes = res.routes.map((r, index) => ({
              title: labels[index] || `Alternative Route ${index + 1}`,
              distance: r.legs[0].distance?.text || "Calculating...",
              duration: r.legs[0].duration?.text || "Calculating...",
            }));

            setRouteOptions(routes);
            setMapError('');
          }
        } else {
          console.error("Google Maps Directions Status Check ❌:", res.status);
          setMapError(`Route calculation failed: ${res.status}. Please check pickup & drop names.`);
        }
      }
    };

    if (!isLoaded) return <div style={{ padding: '20px', color: '#0f3158', fontWeight: 'bold' }}>Loading Google Maps Intelligence...</div>;

    // 🛡️ அண்ணே, டேட்டாபேஸ்ல முகவரி ரொம்ப நீளமாகவோ அல்லது தப்பாகவோ இருந்தால் சிஸ்டம் கிராஷ் ஆகாமல் இருக்க கச்சிதமான சிட்டி பெயர்களாக சுருக்குகிறோம்!
    const cleanLocation = (loc) => {
      if (!loc || loc === 'Not Assigned' || loc === 'Not Added' || loc === 'N/A') return '';
      // கமா இருந்தால் முதல் வார்த்தையை (மெயின் சிட்டியை மட்டும்) எடுக்கிறோம்
      const parts = loc.split(',');
      return parts[0].trim();
    };

    const pickupClean = cleanLocation(routeData?.pickup);
    const dropClean = cleanLocation(routeData?.destination);

    const originLoc = pickupClean !== '' ? pickupClean : "Ambasamudram";
    const destLoc = dropClean !== '' ? dropClean : "Chennai";

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', paddingTop: '4px' }}>
          {routeOptions.length > 0 ? (
            routeOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRouteIndex(idx)}
                style={{
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: routeIndex === idx ? 'none' : '1px solid #e2e8f0',
                  background: routeIndex === idx ? 'linear-gradient(135deg, #155799 0%, #0f3158 100%)' : '#ffffff',
                  color: routeIndex === idx ? '#ffffff' : '#0f3158',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: routeIndex === idx ? '0 10px 25px rgba(21,87,153,0.3)' : '0 4px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.25s ease',
                }}
              >
                📍 {opt.title} <br />
                <span style={{ fontSize: '0.8rem', opacity: routeIndex === idx ? 0.9 : 0.65, fontWeight: '600' }}>
                  {opt.distance} • {opt.duration}
                </span>
              </button>
            ))
          ) : (
            <div style={{ color: '#ff7a00', fontWeight: '700', fontSize: '0.95rem', padding: '10px' }}>
              🔀 Mapping alternative bypass routes...
            </div>
          )}
        </div>

        <div style={{ height: '450px', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 45px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
          <GoogleMap
            id="eagle-driver-optimized-map"
            mapContainerStyle={{ width: '100%', height: '100%' }}
            zoom={7}
            center={{ lat: 10.8281, lng: 78.6984 }}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              styles: [
                { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
                { featureType: "landscape", elementType: "all", stylers: [{ color: "#f2f2f2" }] }
              ]
            }}
          >
            <DirectionsService
              options={{
                origin: originLoc,
                destination: destLoc,
                travelMode: 'DRIVING',
                provideRouteAlternatives: true,
              }}
              callback={directionsCallback}
            />

            {response && (
              <DirectionsRenderer
                options={{
                  directions: response,
                  routeIndex: routeIndex,
                  polylineOptions: {
                    strokeColor: routeIndex === 0 ? '#2563eb' : routeIndex === 1 ? '#16a34a' : '#ea580c',
                    strokeWeight: 6,
                    strokeOpacity: 0.85
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>

        {mapError && (
          <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '600' }}>
            ⚠️ {mapError}
          </div>
        )}

        <div style={{ background: '#f8fbff', padding: '18px', borderRadius: '18px', border: '1px solid #dbe7f4', fontSize: '0.95rem', color: '#0f3158', fontWeight: '600', boxShadow: 'inset 0 1px 0 #fff' }}>
          🚀 <strong>Active Navigation:</strong> Running on <span style={{ color: '#ff7a00' }}>{routeOptions[routeIndex]?.title || 'Bypass Highway (Fastest)'}</span>.
          Total Distance is <strong style={{ color: '#155799' }}>{routeOptions[routeIndex]?.distance || '...'}</strong> with an estimated travel time of <strong style={{ color: '#155799' }}>{routeOptions[routeIndex]?.duration || '...'}</strong>.
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={loginStyles.loginPage}>
        <div style={loginStyles.loginCard}>
          <div style={loginStyles.logoBox}>
            <img src="/eagle-logo.png" alt="Eagle Logo" style={loginStyles.logoImg} />
          </div>

          <h1 style={loginStyles.title}>Driver Login</h1>
          <p style={loginStyles.subtitle}>
            Secure access to Eagle Transport Driver <br /> Dashboard
          </p>

          <div style={loginStyles.badge}>
            <ShieldCheck size={18} />
            <span>Protected driver access</span>
          </div>

          <form onSubmit={handleLogin} style={loginStyles.form}>
            <label style={loginStyles.label}>Driver ID</label>
            <div style={loginStyles.inputWrap}>
              <User size={22} color="#64748b" />
              <input
                type="text"
                placeholder="DRV00"
                value={loginData.driverId}
                onChange={(e) => setLoginData((prev) => ({ ...prev, driverId: e.target.value }))}
                style={loginStyles.input}
                required
              />
            </div>

            <label style={loginStyles.label}>Password</label>
            <div style={loginStyles.inputWrap}>
              <Lock size={22} color="#64748b" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                style={loginStyles.input}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={loginStyles.eyeBtn}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label style={loginStyles.rememberRow}>
              <input type="checkbox" defaultChecked style={loginStyles.checkbox} />
              <span>Remember me</span>
            </label>

            <button type="button" style={loginStyles.forgotBtn} onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>

            {loginError && <div style={loginStyles.error}>{loginError}</div>}

            <button type="submit" style={loginStyles.loginBtn}>
              Login to Driver Dashboard
            </button>
          </form>

          {showForgotPassword && (
            <div style={loginStyles.modalOverlay}>
              <div style={loginStyles.modalCard}>
                <h2 style={loginStyles.modalTitle}>Reset Password</h2>
                <input
                  type="text"
                  placeholder="Enter Driver ID"
                  value={forgotData.driverId}
                  onChange={(e) => setForgotData((prev) => ({ ...prev, driverId: e.target.value }))}
                  style={loginStyles.modalInput}
                />

                {!otpSent ? (
                  <button style={loginStyles.modalBtn} onClick={sendResetOtp}>
                    Send OTP
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter OTP"
                      value={forgotData.otp}
                      onChange={(e) => setForgotData((prev) => ({ ...prev, otp: e.target.value }))}
                      style={loginStyles.modalInput}
                    />
                    <input
                      type="password"
                      placeholder="Enter New Password"
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      style={loginStyles.modalInput}
                    />
                    <button style={loginStyles.modalBtn} onClick={resetPassword}>
                      Reset Password
                    </button>
                  </>
                )}

                <button
                  style={loginStyles.closeBtn}
                  onClick={() => {
                    setShowForgotPassword(false);
                    setOtpSent(false);
                    setForgotData({ driverId: "", otp: "", newPassword: "" });
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.headerTitle}>Driver Dashboard</h1>
            <p style={styles.headerSub}>Live trip control panel</p>
          </div>

          <div style={styles.headerActions}>
            <div style={styles.notificationWrap}>
              <button style={styles.headerIconBtn} onClick={() => setShowDriverNotifications((prev) => !prev)}>
                <Bell size={22} />
                {driverNotifications.length > 0 && <span style={styles.notifyDot}></span>}
              </button>

              {showDriverNotifications && (
                <div style={styles.notificationDropdown}>
                  <h4 style={styles.notificationTitle}>Notifications</h4>
                  {driverNotifications.length === 0 ? (
                    <p style={styles.notificationEmpty}>No notifications</p>
                  ) : (
                    driverNotifications.map((item, index) => (
                      <div key={index} style={styles.notificationItem}>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                        <small>{item.time}</small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button style={styles.headerLogoutBtn} onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div style={styles.driverStrip}>
          <img src="/driver.png" alt="Driver" style={styles.driverAvatar} />
          <div style={{ flex: 1 }}>
            <h2 style={styles.driverName}>{driverData.name}</h2>
            <div style={styles.onlineRow}>
              <span style={styles.onlineDot}></span>
              <span>{driverData.status} • {driverData.driverId}</span>
            </div>
          </div>

          <div style={styles.assignedTruckTop}>
            <img src={driverData.truckImage} alt={driverData.truckName} style={styles.topTruckImage} />
            <div>
              <p style={styles.assignedLabel}>Assigned Truck</p>
              <h3 style={styles.assignedTruckName}>{driverData.truckName}</h3>
              <span className="badge badge-default">{driverData.truckNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && <div style={styles.successToast}>{successMsg}</div>}

      {/* Main Content */}
      <div style={styles.contentWrap}>
        <AnimatePresence mode="wait">
          {activeMenu === 'Home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
            >
              {/* Health Cards */}
              {hasAssignedTruck ? (
                <div style={styles.healthGrid}>
                  {healthCards.map((item) => (
                    <div key={item.title} className="card" style={styles.healthCard}>
                      <div style={styles.healthTop}>
                        <div
                          style={{
                            ...styles.healthIcon,
                            color: item.color,
                            backgroundColor: `${item.color}15`,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <p style={styles.smallLabel}>{item.title}</p>
                          <h4 style={styles.healthValue}>{item.value}</h4>
                        </div>
                      </div>
                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${item.progress}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={styles.noTruckCard}>
                  <img src="/no-truck.png" alt="No Truck" style={styles.noTruckImage} />
                  <h2 style={styles.noTruckTitle}>No Truck Assigned</h2>
                  <p style={styles.noTruckText}>
                    Truck health indicators will appear once owner assigns a truck and booking.
                  </p>
                </div>
              )}

              {/* Active Route Card */}
              <div className="card" style={styles.routeCard}>
                <div style={styles.routeHeader}>
                  <h3 style={styles.routeTitle}>Active Route</h3>
                  <span className={`badge badge-${routeData.tripStatus === 'Trip Completed' ? 'success' : 'warning'}`}>
                    {routeData.tripStatus}
                  </span>
                </div>

                <div style={styles.routeContent}>
                  <div style={styles.routeLineIcons}>
                    <MapPin size={20} color="var(--primary-blue)" />
                    <div style={styles.routeLine}></div>
                    <Navigation2 size={20} color="var(--warning)" />
                    <div style={styles.routeLine}></div>
                    <MapPin size={20} color="var(--danger)" />
                  </div>

                  <div style={styles.routeTexts}>
                    <div>
                      <p style={styles.routeLabel}>Pickup (Completed)</p>
                      <p style={styles.routeValue}>{routeData.pickup}</p>
                    </div>
                    <div>
                      <p style={styles.routeLabel}>Current Location</p>
                      <p style={styles.routeValue}>{routeData.currentLocation}</p>
                    </div>
                    <div>
                      <p style={styles.routeLabel}>Destination</p>
                      <p style={styles.routeValue}>{routeData.destination}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.tripActionButtons}>
                  <button type="button" style={styles.startTripBtn} onClick={handleStartTrip}>
                    🚚 Start Trip
                  </button>
                  <button type="button" style={styles.updateGpsBtn} onClick={updateGpsLocation}>
                    📍 Update GPS Location
                  </button>
                  <button type="button" style={styles.endTripBtn} onClick={() => setActiveMenu("EndTrip")}>
                    ✅ End Trip
                  </button>
                </div>
              </div>

              {/* GPS Timeline */}
              <div className="card" style={styles.timelineCard}>
                <h3 style={styles.sectionTitle}>Recent Location Updates</h3>
                <div style={styles.timelineList}>
                  {gpsLog.map((item, index) => (
                    <div key={index} style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div style={{ flex: 1 }}>
                        <p style={styles.timelineTitle}>{item.place}</p>
                        <p style={styles.timelineMeta}>{item.type} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip History */}
              <div className="card" style={styles.timelineCard}>
                <h3 style={styles.sectionTitle}>Trip History</h3>
                {tripHistory.length === 0 ? (
                  <p style={styles.timelineMeta}>No completed trips yet</p>
                ) : (
                  <div style={styles.timelineList}>
                    {tripHistory.map((trip) => (
                      <div key={trip._id} style={styles.timelineItem}>
                        <div style={styles.timelineDot}></div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.timelineTitle}>{trip.pickup} → {trip.drop}</p>
                          <p style={styles.timelineMeta}>{trip.status} • {trip.truck?.number || "No truck"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 style={styles.sectionTitle}>Quick Actions</h3>
                <div style={styles.quickActionGrid}>
                  <motion.button whileTap={{ scale: 0.96 }} className="card" style={styles.actionCard} onClick={() => setActiveMenu('Fuel')}>
                    <Fuel size={32} color="var(--primary-blue)" style={{ marginBottom: '12px' }} />
                    <p style={styles.actionText}>Add Fuel</p>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.96 }} className="card" style={styles.actionCard} onClick={() => setActiveMenu('Toll')}>
                    <CreditCard size={32} color="var(--success)" style={{ marginBottom: '12px' }} />
                    <p style={styles.actionText}>Add Toll</p>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.96 }} className="card" style={styles.actionCard} onClick={() => setActiveMenu('Issue')}>
                    <Wrench size={32} color="var(--danger)" style={{ marginBottom: '12px' }} />
                    <p style={styles.actionText}>Truck Issue</p>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.96 }} className="card" style={styles.actionCard} onClick={() => setActiveMenu("TripSummary")}>
                    <ShieldCheck size={32} color="var(--warning)" style={{ marginBottom: "12px" }} />
                    <p style={styles.actionText}>Trip Summary</p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeMenu === 'Fuel' && (
            <motion.div key="fuel" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Fuel Entry</h2>
                <p style={styles.formDesc}>Enter petrol pump details, liters, and total amount.</p>

                <form onSubmit={handleFuelSubmit} style={styles.formGrid}>
                  <input style={styles.input} placeholder="Petrol Pump Name" value={fuelForm.pumpName} onChange={(e) => setFuelForm({ ...fuelForm, pumpName: e.target.value })} />
                  <input style={styles.input} placeholder="Location / Place" value={fuelForm.place} onChange={(e) => setFuelForm({ ...fuelForm, place: e.target.value })} />
                  <input style={styles.input} type="number" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                  <input style={styles.input} type="number" placeholder="Amount" value={fuelForm.amount} onChange={(e) => setFuelForm({ ...fuelForm, amount: e.target.value })} />
                  <select style={styles.input} value={fuelForm.fuelType} onChange={(e) => setFuelForm({ ...fuelForm, fuelType: e.target.value })}>
                    <option>Diesel</option>
                    <option>Petrol</option>
                  </select>

                  <div style={styles.formActions}>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveMenu('Home')}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><Save size={16} /> Save Fuel Log</button>
                  </div>
                </form>

                {fuelLogs.length > 0 && (
                  <div style={styles.logBox}>
                    <h3 style={styles.logTitle}>Recent Fuel Logs</h3>
                    {fuelLogs.slice(0, 3).map((item) => (
                      <div key={item.id} style={styles.logItem}>
                        <strong>{item.pumpName}</strong> • {item.liters}L • ₹{item.amount}
                        <div style={styles.logMeta}>{item.place} • {item.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeMenu === 'Toll' && (
            <motion.div key="toll" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Toll Entry</h2>
                <p style={styles.formDesc}>Add tollgate name, amount, payment method, and location.</p>

                <form onSubmit={handleTollSubmit} style={styles.formGrid}>
                  <input style={styles.input} placeholder="Tollgate Name" value={tollForm.tollgate} onChange={(e) => setTollForm({ ...tollForm, tollgate: e.target.value })} />
                  <input style={styles.input} placeholder="Location / Place" value={tollForm.place} onChange={(e) => setTollForm({ ...tollForm, place: e.target.value })} />
                  <input style={styles.input} type="number" placeholder="Amount" value={tollForm.amount} onChange={(e) => setTollForm({ ...tollForm, amount: e.target.value })} />
                  <select style={styles.input} value={tollForm.paymentMethod} onChange={(e) => setTollForm({ ...tollForm, paymentMethod: e.target.value })}>
                    <option>FASTag</option>
                    <option>Cash</option>
                    <option>UPI</option>
                  </select>

                  <div style={styles.formActions}>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveMenu('Home')}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><Save size={16} /> Save Toll Entry</button>
                  </div>
                </form>

                {tollLogs.length > 0 && (
                  <div style={styles.logBox}>
                    <h3 style={styles.logTitle}>Recent Toll Logs</h3>
                    {tollLogs.slice(0, 3).map((item) => (
                      <div key={item.id} style={styles.logItem}>
                        <strong>{item.tollgate}</strong> • ₹{item.amount} • {item.paymentMethod}
                        <div style={styles.logMeta}>{item.place} • {item.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeMenu === 'Issue' && (
            <motion.div key="issue" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Truck Issue Report</h2>
                <p style={styles.formDesc}>Enter truck issue reason, severity, and current location.</p>

                <form onSubmit={handleIssueSubmit} style={styles.formGrid}>
                  <select style={styles.input} value={issueForm.issueType} onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}>
                    <option>Tyre Issue</option>
                    <option>Brake Issue</option>
                    <option>Engine Oil Low</option>
                    <option>Battery Issue</option>
                    <option>Fuel Leakage</option>
                    <option>General Mechanical Issue</option>
                  </select>

                  <select style={styles.input} value={issueForm.severity} onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>

                  <input style={styles.input} placeholder="Current Location" value={issueForm.location} onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })} />
                  <textarea
                    style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                    placeholder="Describe issue reason clearly..."
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  />

                  <div style={styles.formActions}>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveMenu('Home')}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><AlertTriangle size={16} /> Submit Issue</button>
                  </div>
                </form>

                {issueLogs.length > 0 && (
                  <div style={styles.logBox}>
                    <h3 style={styles.logTitle}>Recent Issue Reports</h3>
                    {issueLogs.slice(0, 3).map((item) => (
                      <div key={item.id} style={styles.logItem}>
                        <strong>{item.issueType}</strong> • {item.severity}
                        <div style={styles.logMeta}>{item.location} • {item.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeMenu === "TripSummary" && (
            <motion.div key="trip-summary" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Trip Summary</h2>
                <p style={styles.formDesc}>Complete overview of your assigned trip.</p>

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryBox}>
                    <span>Booking ID</span>
                    <strong>{routeData.bookingId || "Not Assigned"}</strong>
                  </div>
                  <div style={styles.summaryBox}>
                    <span>Status</span>
                    <strong>{routeData.tripStatus}</strong>
                  </div>
                  <div style={styles.summaryBox}>
                    <span>Pickup</span>
                    <strong>{routeData.pickup}</strong>
                  </div>
                  <div style={styles.summaryBox}>
                    <span>Destination</span>
                    <strong>{routeData.destination}</strong>
                  </div>
                  <div style={styles.summaryBox}>
                    <span>Current Location</span>
                    <strong>{routeData.currentLocation}</strong>
                  </div>
                  <div style={styles.summaryBox}>
                    <span>Truck</span>
                    <strong>{driverData.truckNumber}</strong>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button className="btn btn-outline" onClick={() => setActiveMenu("Home")}>Back</button>
                  <button className="btn btn-primary" onClick={() => setActiveMenu("EndTrip")}>
                    <CheckCircle size={16} /> Go to End Trip
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeMenu === 'EndTrip' && (
            <motion.div key="endtrip" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>End Trip</h2>
                <p style={styles.formDesc}>Confirm destination reached and close the active trip.</p>

                <form onSubmit={handleEndTrip} style={styles.formGrid}>
                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={tripEndForm.destinationReached}
                      onChange={(e) => setTripEndForm((prev) => ({ ...prev, destinationReached: e.target.checked }))}
                    />
                    <span>Destination reached successfully</span>
                  </label>

                  <textarea
                    style={{ ...styles.input, minHeight: '110px', resize: 'vertical' }}
                    placeholder="Trip end remarks"
                    value={tripEndForm.remarks}
                    onChange={(e) => setTripEndForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  />

                  <div style={styles.formActions}>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveMenu('Home')}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><CheckCircle size={16} /> Confirm End Trip</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeMenu === 'Map' && (
            <motion.div key="map" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Route Optimization Map</h2>
                <p style={styles.formDesc}>Select your preferred route type to view live navigation paths and bypass options.</p>

                {/* 🗺️ கூகுள் மேப் லைவ் ஏரியா அண்ணே */}
                <DriverLiveMap routeData={routeData} driverData={driverData} />
              </div>
            </motion.div>
          )}

          {activeMenu === 'Settings' && (
            <motion.div key="settings" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="card" style={styles.formCard}>
                <h2 style={styles.formTitle}>Driver Settings</h2>
                <p style={styles.formDesc}>Manage dashboard preferences.</p>

                <div style={styles.settingsList}>
                  <label style={styles.switchRow}>
                    <span>GPS Auto Update</span>
                    <input
                      type="checkbox"
                      checked={settingsData.gpsAutoUpdate}
                      onChange={(e) => setSettingsData((prev) => ({ ...prev, gpsAutoUpdate: e.target.checked }))}
                    />
                  </label>

                  <label style={styles.switchRow}>
                    <span>Notifications</span>
                    <input
                      type="checkbox"
                      checked={settingsData.alertsOn}
                      onChange={(e) => setSettingsData((prev) => ({ ...prev, alertsOn: e.target.checked }))}
                    />
                  </label>

                  <label style={styles.switchRow}>
                    <span>Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={settingsData.darkMode}
                      onChange={(e) => setSettingsData((prev) => ({ ...prev, darkMode: e.target.checked }))}
                    />
                  </label>
                </div>

                <div style={styles.formActions}>
                  <button className="btn btn-outline" onClick={() => setActiveMenu('Home')}>Back</button>
                  <button className="btn btn-primary" onClick={() => { setSuccessMsg('Settings saved'); clearSuccess(); setActiveMenu('Home'); }}>
                    <Save size={16} /> Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <button
          onClick={() => setActiveMenu('Home')}
          style={{
            ...styles.bottomNavBtn,
            color: activeMenu === 'Home' ? 'var(--primary-blue)' : 'var(--text-muted)',
          }}
        >
          <Truck size={24} />
          <span style={styles.bottomNavText}>Home</span>
        </button>

        <button
          onClick={() => setActiveMenu('Map')}
          style={{
            ...styles.bottomNavBtn,
            color: activeMenu === 'Map' ? 'var(--primary-blue)' : 'var(--text-muted)',
          }}
        >
          <Navigation size={24} />
          <span style={styles.bottomNavText}>Map</span>
        </button>

        <button
          onClick={() => setActiveMenu('Settings')}
          style={{
            ...styles.bottomNavBtn,
            color: activeMenu === 'Settings' ? 'var(--primary-blue)' : 'var(--text-muted)',
          }}
        >
          <Settings size={24} />
          <span style={styles.bottomNavText}>Settings</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#f5f8fc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '95px',
  },
  header: {
    background: 'linear-gradient(180deg, #0d376b 0%, #123c6d 100%)',
    color: 'white',
    padding: '24px',
    paddingBottom: '36px',
    position: 'relative',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: '1.55rem',
    margin: 0,
    fontWeight: '800',
    color: 'rgb(255, 255, 255)',
  },
  headerSub: {
    margin: '6px 0 0 0',
    color: 'rgba(255,255,255,0.78)',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  headerIconBtn: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrap: {
    position: "relative",
  },
  notificationDropdown: {
    position: "absolute",
    top: "54px",
    right: 0,
    width: "280px",
    background: "#ffffff",
    color: "#0f3158",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
    zIndex: 999,
  },
  notificationTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    fontWeight: 900,
  },
  notificationEmpty: {
    margin: 0,
    color: "#64748b",
  },
  notificationItem: {
    padding: "12px",
    borderRadius: "14px",
    background: "#f1f6ff",
    marginBottom: "10px",
  },
  notifyDot: {
    position: 'absolute',
    top: '8px',
    right: '9px',
    width: '10px',
    height: '10px',
    backgroundColor: 'var(--accent-orange)',
    borderRadius: '50%',
  },
  headerLogoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.10)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  driverStrip: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '16px',
    alignItems: 'center',
  },
  driverAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255,255,255,0.25)',
  },
  driverName: {
    fontSize: '1.25rem',
    margin: '0 0 6px 0',
    fontWeight: '800',
    color: 'rgb(255, 255, 255)',
  },
  onlineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.86)',
    flexWrap: 'wrap',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--success)',
    borderRadius: '50%',
    display: 'inline-block',
  },
  assignedTruckTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '12px',
    borderRadius: '18px',
  },
  topTruckImage: {
    width: '84px',
    height: '58px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.15)',
  },
  assignedLabel: {
    fontSize: '0.78rem',
    margin: '0 0 6px 0',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  assignedTruckName: {
    margin: '0 0 6px 0',
    fontSize: '1rem',
    fontWeight: '800',
    color: '#fff',
  },
  contentWrap: {
    flex: 1,
    padding: '20px',
    marginTop: '-10px',
    zIndex: 10,
  },
  successToast: {
    margin: '14px 20px 0',
    background: '#ecfdf3',
    color: '#067647',
    border: '1px solid #a6f4c5',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: '700',
  },
  assignedTruckCard: {
    padding: '20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    borderRadius: '24px',
  },
  assignedTruckImage: {
    width: '120px',
    height: '78px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  smallLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    margin: '0 0 6px 0',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cardMainTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.2rem',
    color: 'var(--dark-blue)',
    fontWeight: '800',
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  healthCard: {
    padding: '18px',
    borderRadius: '20px',
  },
  noTruckCard: {
    width: "100%",
    padding: "40px 30px",
    borderRadius: "24px",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    border: "1px solid #dbe4f0",
  },
  noTruckImage: {
    width: "220px",
    marginBottom: "20px",
    objectFit: "contain",
  },
  noTruckTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#123d7a",
    marginBottom: "10px",
  },
  noTruckText: {
    fontSize: "16px",
    color: "#64748b",
    maxWidth: "500px",
    lineHeight: "28px",
  },
  healthTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '14px',
  },
  healthIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthValue: {
    margin: 0,
    fontSize: '1.25rem',
    color: 'var(--dark-blue)',
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '999px',
    background: '#e7edf6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
  },
  routeCard: {
    padding: '24px',
    borderTop: '4px solid var(--accent-orange)',
    borderRadius: '24px',
  },
  routeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  routeTitle: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontWeight: '800',
  },
  routeContent: {
    display: 'flex',
    gap: '16px',
    marginBottom: '22px',
  },
  routeLineIcons: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  routeLine: {
    width: '2px',
    height: '38px',
    background: 'var(--border-light)',
    margin: '6px 0',
  },
  routeTexts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  routeLabel: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  routeValue: {
    margin: '4px 0 0 0',
    fontWeight: '700',
    color: 'var(--dark-blue)',
    fontSize: '1rem',
  },
  routeBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '1.05rem',
    fontWeight: '800',
    borderRadius: '16px',
  },
  timelineCard: {
    padding: '24px',
    borderRadius: '24px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    color: 'var(--dark-blue)',
    fontWeight: '800',
    fontSize: '1.2rem',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-light)',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--primary-blue)',
    marginTop: '8px',
  },
  timelineTitle: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontWeight: '700',
  },
  timelineMeta: {
    margin: '5px 0 0 0',
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
  },
  quickActionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  actionCard: {
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: '22px',
    border: '1px solid rgba(15, 59, 115, 0.08)',
  },
  actionText: {
    fontWeight: '700',
    margin: 0,
    color: 'var(--dark-blue)',
    fontSize: '1rem',
  },
  formCard: {
    padding: '24px',
    borderRadius: '24px',
  },
  formTitle: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontWeight: '800',
    fontSize: '1.5rem',
  },
  formDesc: {
    margin: '8px 0 22px 0',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  formGrid: {
    display: 'grid',
    gap: '14px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #dbe4ef',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  logBox: {
    marginTop: '22px',
    background: '#f8fbff',
    border: '1px solid #dbe7f4',
    borderRadius: '18px',
    padding: '16px',
  },
  logTitle: {
    margin: '0 0 12px 0',
    color: 'var(--dark-blue)',
    fontWeight: '800',
  },
  logItem: {
    padding: '10px 0',
    borderBottom: '1px solid #e8eef6',
    color: 'var(--dark-blue)',
  },
  logMeta: {
    marginTop: '4px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
    color: 'var(--dark-blue)',
  },
  mapPlaceholder: {
    minHeight: '320px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #eaf2fb 0%, #dfeaf7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  mapRouteCard: {
    background: 'rgba(255,255,255,0.9)',
    padding: '22px',
    borderRadius: '18px',
    boxShadow: '0 10px 25px rgba(15,59,115,0.08)',
    width: '100%',
    maxWidth: '420px',
  },
  mapText: {
    margin: '0 0 10px 0',
    color: 'var(--dark-blue)',
    fontWeight: '600',
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fbff',
    border: '1px solid #dbe7f4',
    padding: '16px',
    borderRadius: '16px',
    fontWeight: '700',
    color: 'var(--dark-blue)',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '14px 12px',
    paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
    zIndex: 50,
    boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
  },
  bottomNavBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  bottomNavText: {
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  tripActionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  startTripBtn: {
    border: "none",
    outline: "none",
    padding: "11px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(249, 115, 22, 0.28)",
  },
  updateGpsBtn: {
    border: "none",
    outline: "none",
    padding: "11px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.28)",
  },
  endTripBtn: {
    border: "none",
    outline: "none",
    padding: "11px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(22, 163, 74, 0.28)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  summaryBox: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fbff",
    border: "1px solid #dbe7f4",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "var(--dark-blue)",
  },
};

const loginStyles = {
  loginPage: {
    minHeight: "100vh",
    background: "#0f3158",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(10px)',
    padding: '36px 32px',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  logoBox: {
    width: "78px",
    height: "78px",
    borderRadius: "20px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
    boxShadow: "0 14px 30px rgba(15,49,88,0.14)",
  },
  logoImg: {
    width: "110px",
    height: "110px",
    objectFit: "contain",
  },
  title: {
    margin: 0,
    color: '#0f3057',
    fontSize: '2rem',
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    margin: '10px 0 16px',
    fontSize: '0.96rem',
    lineHeight: '1.6',
  },
  badge: {
    width: "fit-content",
    margin: "0 auto 24px",
    padding: "10px 18px",
    borderRadius: "999px",
    background: "#eef6ff",
    border: "1px solid #cfe4ff",
    color: "#123f70",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontWeight: 800,
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#123f70",
    marginTop: "6px",
  },
  inputWrap: {
    height: "56px",
    borderRadius: "16px",
    border: "1px solid #d7e3f2",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#0f3158",
  },
  eyeBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "16px",
    color: "#334155",
    margin: "8px 0 14px",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    accentColor: "#155799",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  loginBtn: {
    height: "56px",
    border: "none",
    borderRadius: "16px",
    background: "#155799",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  forgotBtn: {
    marginTop: "14px",
    border: "none",
    background: "transparent",
    color: "#155799",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "15px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  modalTitle: {
    margin: 0,
    color: "#0f3158",
    fontWeight: "900",
    textAlign: "center",
  },
  modalInput: {
    height: "54px",
    borderRadius: "14px",
    border: "1px solid #dbe4ef",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
  },
  modalBtn: {
    height: "52px",
    border: "none",
    borderRadius: "14px",
    background: "#155799",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },
  closeBtn: {
    height: "50px",
    border: "none",
    borderRadius: "14px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default DriverApp;