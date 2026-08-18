import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel } from 'lucide-react';
import PaymentManagement from "./admin/PaymentManagement";
import { addTruck, addDriver } from "../api/api";
import {
  LayoutDashboard,
  Truck,
  Package,
  AlertTriangle,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Home,
  ChevronRight,
  Activity,
  ShieldCheck,
  Save,
  FileText,
  UserPlus,
  Sun,
  Moon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import Overview from './admin/Overview';
import TrucksAndDrivers from './admin/TrucksAndDrivers';
import LiveBookings from './admin/LiveBookings';
import TollgateLogs from './admin/TollgateLogs';
import EmergencyAlerts from './admin/EmergencyAlerts';
import SettingsPage from './admin/Settings';
import eagleLogo from '/src/assets/eagle-logo.png';
import CreateBooking from './admin/CreateBooking';
import SmartDispatch from './admin/SmartDispatch';
import FuelLogs from "./admin/FuelLogs";
import "../styles/owner-dashboard-dark.css";

const fetchWithAuth = (url, options = {}) => {

  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });

};

const RAW_API_URL = String(import.meta.env.VITE_API_URL || "").trim();

const API_URL = RAW_API_URL
  ? `${RAW_API_URL.replace(/\/+$/, "")}${/\/api$/i.test(
    RAW_API_URL.replace(/\/+$/, "")
  )
    ? ""
    : "/api"}`
  : "/api";

const SIDEBAR_WIDTH = 280;

const AddDriverForm = () => {

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    driverName: '',
    mobile: '',
    email: "",
    username: '',
    password: '',
    licenseNumber: '',
    experience: '',
    assignedTruck: '',
    address: '',
  });

  // ✅ Load Trucks & Drivers
  useEffect(() => {

    const loadData = async () => {

      try {

        const truckRes = await fetchWithAuth(
          `${API_URL}/trucks`
        );

        const truckData = await truckRes.json();

        const driverRes = await fetchWithAuth(
          `${API_URL}/drivers`
        );

        const driverData = await driverRes.json();

        setTrucks(Array.isArray(truckData) ? truckData : []);
        setDrivers(Array.isArray(driverData) ? driverData : []);

      } catch (error) {

        console.error("Load data error:", error);

      }
    };

    loadData();

  }, []);

  // ✅ Only Unassigned Trucks
  const availableTrucksForDriver = trucks.filter((truck) => {

    return !drivers.some((driver) => {

      const assignedTruckId =
        driver.assignedTruck?._id ||
        driver.assignedTruck ||
        driver.truck;

      return String(assignedTruckId) === String(truck._id);

    });

  });

  // ✅ Validation
  const validateDriverForm = () => {

    let newErrors = {};

    if (!form.driverName.trim()) {
      newErrors.driverName = "Driver Name is required";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    }

    if (!form.email.trim()) {
      newErrors.email =
        "Email is required";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Enter valid email";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber = "License Number is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  // ✅ Submit Function (Updated to match Backend Expected keys)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDriverForm()) {
      return;
    }

    try {
      const driverData = {
        name: form.driverName,
        phone: form.mobile,
        email: form.email,
        driverId: form.username, // 👈 இங்க 'username'-ஐ 'driverId' ஆக மாற்றி பேக்-எண்டிற்கு அனுப்புறோம்!
        password: form.password,
        licenseNumber: form.licenseNumber,
        experience: form.experience,
        address: form.address,
        assignedTruck: form.assignedTruck || null, // 👈 டிரக் ஐடியும் பேக்-எண்டிற்குப் போகிறது
        status: "available",
      };

      const res = await fetchWithAuth(
        `${API_URL}/drivers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(driverData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Driver add failed ❌");
        return;
      }

      alert("Driver added successfully ✅");

      // ✅ Refresh Drivers List
      const driverRes = await fetchWithAuth(
        `${API_URL}/drivers`
      );
      const updatedDrivers = await driverRes.json();
      setDrivers(Array.isArray(updatedDrivers) ? updatedDrivers : []);

      // ✅ Reset Form completely
      setForm({
        driverName: '',
        mobile: '',
        email: '',
        username: '',
        password: '',
        licenseNumber: '',
        experience: '',
        assignedTruck: '',
        address: '',
      });

    } catch (error) {
      console.error("Driver add error:", error);
      alert(error.message || "Backend error ❌");
    }
  };

  return (

    <div>

      <div className="owner-add-form-wrap" style={styles.premiumFormWrapper}>

        <div style={styles.formGlow1}></div>
        <div style={styles.formGlow2}></div>

        <div className="card owner-add-form-card" style={styles.premiumFormCard}>

          <div className="owner-add-form-head" style={styles.formTopSection}>

            <div style={styles.formIconWrap}>
              <UserPlus size={28} />
            </div>

            <div>
              <h2 className="owner-add-form-title" style={styles.premiumFormTitle}>
                Add Driver
              </h2>

              <p className="owner-add-form-subtitle" style={styles.premiumFormSubTitle}>
                Create driver login credentials and assign available truck.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="owner-add-form-grid"
            style={styles.premiumFormGrid}
          >

            {/* Driver Name */}
            <div>
              <input
                style={styles.premiumInput}
                placeholder="Driver Name"
                value={form.driverName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driverName: e.target.value,
                  })
                }
              />

              {errors.driverName && (
                <span style={styles.errorText}>
                  {errors.driverName}
                </span>
              )}
            </div>

            {/* Mobile */}
            <div>
              <input
                style={styles.premiumInput}
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobile: e.target.value,
                  })
                }
              />

              {errors.mobile && (
                <span style={styles.errorText}>
                  {errors.mobile}
                </span>
              )}
            </div>

            <div>
              <input
                type="email"
                style={styles.premiumInput}
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

              {errors.email && (
                <span style={styles.errorText}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                autoComplete="off"
                style={styles.premiumInput}
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
              />

              {errors.username && (
                <span style={styles.errorText}>
                  {errors.username}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                autoComplete="new-password"
                style={styles.premiumInput}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              {errors.password && (
                <span style={styles.errorText}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* License */}
            <div>
              <input
                style={styles.premiumInput}
                placeholder="License Number"
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    licenseNumber: e.target.value,
                  })
                }
              />

              {errors.licenseNumber && (
                <span style={styles.errorText}>
                  {errors.licenseNumber}
                </span>
              )}
            </div>

            {/* Experience */}
            <div>
              <input
                style={styles.premiumInput}
                placeholder="Experience (Example: 5 Years)"
                value={form.experience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    experience: e.target.value,
                  })
                }
              />
            </div>

            {/* Available Trucks */}
            <div>

              <select
                value={form.assignedTruck}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedTruck: e.target.value,
                  })
                }
                style={styles.premiumInput}
              >
                <option value="">
                  Select Available Truck
                </option>

                {trucks
                  .filter((truck) => {

                    // ✅ Check this truck already assigned or not
                    const alreadyAssigned = drivers.some((driver) => {

                      // ✅ No assigned truck means skip
                      if (
                        !driver.assignedTruck &&
                        !driver.truck
                      ) {
                        return false;
                      }

                      const assignedTruckId =
                        driver.assignedTruck?._id ||
                        driver.assignedTruck ||
                        driver.truck;

                      return (
                        assignedTruckId &&
                        String(assignedTruckId) === String(truck._id)
                      );

                    });

                    // ✅ Only unassigned trucks show
                    return !alreadyAssigned;

                  })
                  .map((truck) => (

                    <option
                      key={truck._id}
                      value={truck._id}
                    >
                      {truck.truckNumber ||
                        truck.number ||
                        truck.vehicleNumber}
                      {" - "}
                      {truck.category || truck.truckType}
                    </option>

                  ))}

              </select>

            </div>

            {/* Address */}
            <div style={{ gridColumn: "1 / -1" }}>

              <textarea
                style={{
                  ...styles.premiumInput,
                  minHeight: "120px",
                  resize: "none",
                }}
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />

              {errors.address && (
                <span style={styles.errorText}>
                  {errors.address}
                </span>
              )}

            </div>

            {/* Submit */}
            <button
              className="btn btn-primary owner-add-form-submit"
              style={styles.premiumSubmitBtn}
            >
              <Save size={18} />
              Save Driver
            </button>

          </form>

        </div>

      </div>

    </div>

  );
};

const AddTruckForm = () => {
  const [trucks, setTrucks] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    truckName: '',
    truckNumber: '',
    truckType: 'Heavy Truck',
    capacity: '',
    rcBook: '',
    insurance: '',
    permit: '',
    fitness: '',
    fuelType: 'Diesel',
    ownerName: '',
    gpsDeviceNumber: "",
    gpsProvider: "",
    gpsInstalled: false,
  });

  const validateTruckForm = () => {
    let newErrors = {};

    if (!form.truckName.trim()) {
      newErrors.truckName = "Truck Name is required";
    }

    if (!form.truckNumber.trim()) {
      newErrors.truckNumber = "Truck Number is required";
    }

    if (!form.capacity.trim()) {
      newErrors.capacity = "Capacity is required";
    }

    if (!form.rcBook.trim()) {
      newErrors.rcBook = "RC Book Number is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTruckForm()) {
      return;
    }

    const truckData = {
      name: form.truckName,
      number: form.truckNumber,
      category: form.truckType,
      trailerSize: form.trailerSize,
      capacity: form.capacity,
      rcBook: form.rcBook,
      insurance: form.insurance,
      permit: form.permit,
      fitness: form.fitness,
      fuelType: form.fuelType,
      ownerName: form.ownerName,
      location: 'Main Hub',
      status: 'idle',
      health: 'good',
    };

    try {
      const savedTruck = await addTruck(truckData);
      setTrucks([{ ...form, id: savedTruck?._id || Date.now() }, ...trucks]);
      setForm({
        truckName: '',
        truckNumber: '',
        truckType: '',
        trailerSize: "",
        capacity: '',
        rcBook: '',
        insurance: '',
        permit: '',
        fitness: '',
        fuelType: 'Diesel',
        ownerName: '',
      });
      alert('Truck added to database successfully ✅');
    } catch (error) {
      console.error('Add Truck Error:', error);
      alert('Truck add panna mudiyala ❌ Backend running ah irukka nu check pannunga.');
    }
  };

  return (
    <div>
      <div className="owner-add-form-wrap" style={styles.premiumFormWrapper}>
        <div style={styles.formGlow1}></div>
        <div style={styles.formGlow2}></div>

        <div className="card owner-add-form-card" style={styles.premiumFormCard}>
          <div className="owner-add-form-head" style={styles.formTopSection}>
            <div
              style={{
                ...styles.formIconWrap,
                background:
                  "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",
              }}
            >
              <Truck size={28} />
            </div>

            <div>
              <h2 className="owner-add-form-title" style={styles.premiumFormTitle}>Add Truck</h2>

              <p className="owner-add-form-subtitle" style={styles.premiumFormSubTitle}>
                Add truck details, RC book, permit, fitness, and insurance information.
              </p>
            </div>
          </div>

          <form className="owner-add-form-grid" onSubmit={handleSubmit} style={styles.premiumFormGrid}>
            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Truck Name"
              value={form.truckName}
              onChange={(e) =>
                setForm({ ...form, truckName: e.target.value })
              }
              required
            />
            {errors.truckName && (
              <span style={styles.errorText}>{errors.truckName}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Truck Number"
              value={form.truckNumber}
              onChange={(e) =>
                setForm({ ...form, truckNumber: e.target.value })
              }
              required
            />
            {errors.truckNumber && (
              <span style={styles.errorText}>{errors.truckNumber}</span>
            )}

            <div style={{ width: "100%" }}>
              <select
                style={{
                  ...styles.premiumInput,
                  border: errors.driverName
                    ? "2px solid #ef4444"
                    : styles.premiumInput.border,
                }}
                value={form.truckType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    truckType: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Truck Type
                </option>

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

              {/* TRAILER SIZE */}
              {form.truckType === "Trailer Truck" && (
                <select
                  style={{
                    ...styles.premiumInput,
                    marginTop: "12px",
                  }}
                  value={form.trailerSize || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trailerSize: e.target.value,
                    })
                  }
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
            </div>

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Capacity (e.g. 15 Ton)"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: e.target.value })
              }
              required
            />
            {errors.capacity && (
              <span style={styles.errorText}>{errors.capacity}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="RC Book Number"
              value={form.rcBook}
              onChange={(e) =>
                setForm({ ...form, rcBook: e.target.value })
              }
              required
            />
            {errors.rcBook && (
              <span style={styles.errorText}>{errors.rcBook}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Insurance Number"
              value={form.insurance}
              onChange={(e) =>
                setForm({ ...form, insurance: e.target.value })
              }
            />
            {errors.insurance && (
              <span style={styles.errorText}>{errors.insurance}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Permit Number"
              value={form.permit}
              onChange={(e) =>
                setForm({ ...form, permit: e.target.value })
              }
            />
            {errors.permit && (
              <span style={styles.errorText}>{errors.permit}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Fitness Certificate Number"
              value={form.fitness}
              onChange={(e) =>
                setForm({ ...form, fitness: e.target.value })
              }
            />
            {errors.fitness && (
              <span style={styles.errorText}>{errors.fitness}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="GPS Device Number"
              value={form.gpsDeviceNumber}
              onChange={(e) =>
                setForm({ ...form, gpsDeviceNumber: e.target.value })
              }
            />
            {errors.gpsDeviceNumber && (
              <span style={styles.errorText}>{errors.gpsDeviceNumber}</span>
            )}

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="GPS Provider (e.g. Airtel GPS)"
              value={form.gpsProvider}
              onChange={(e) =>
                setForm({ ...form, gpsProvider: e.target.value })
              }
            />
            {errors.gpsProvider && (
              <span style={styles.errorText}>{errors.gpsProvider}</span>
            )}

            <select
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              value={form.gpsInstalled}
              onChange={(e) =>
                setForm({
                  ...form,
                  gpsInstalled: e.target.value === "true",
                })
              }
            >
              <option value={false}>GPS Not Installed</option>
              <option value={true}>GPS Installed</option>
            </select>

            <select
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              value={form.fuelType}
              onChange={(e) =>
                setForm({ ...form, fuelType: e.target.value })
              }
            >
              <option>Diesel</option>
              <option>Petrol</option>
              <option>CNG</option>
              <option>Electric</option>
            </select>

            <input
              style={{
                ...styles.premiumInput,
                border: errors.driverName
                  ? "2px solid #ef4444"
                  : styles.premiumInput.border,
              }}
              placeholder="Truck Owner Name"
              value={form.ownerName}
              onChange={(e) =>
                setForm({ ...form, ownerName: e.target.value })
              }
            />
            {errors.ownerName && (
              <span style={styles.errorText}>{errors.ownerName}</span>
            )}

            <button
              className="btn btn-primary owner-add-form-submit"
              style={styles.premiumSubmitBtn}
            >
              <Save size={18} />
              Save Truck
            </button>
          </form>
        </div>
      </div>

      {trucks.length > 0 && (
        <div className="card" style={styles.listCard}>
          <h3 style={styles.formTitle}>Added Trucks</h3>

          {trucks.map((truck) => (
            <div key={truck.id} style={styles.listItem}>
              <strong>{truck.truckName}</strong>
              <span>{truck.truckNumber}</span>
              <span>{truck.truckType}</span>
              <span>{truck.capacity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || user.role !== "owner") {
      navigate("/owner/login", { replace: true });
    }
  }, [navigate]);

  /* =========================================
     DASHBOARD THEME
     Always starts in Light Mode when dashboard opens.
  ========================================= */
  useEffect(() => {
    document.body.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    setDashboardTheme("light");

    return () => {
      // Keep the selected dashboard theme until the user leaves/re-enters.
    };
  }, []);

  const toggleDashboardTheme = () => {
    setDashboardTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";

      document.body.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);

      return nextTheme;
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/bookings/notifications/all`);
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Notification fetch error:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (name) => {
    setActiveTab(name);
    setIsMobileMenuOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, component: <Overview onNavigate={handleTabChange} searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> },
    { name: 'Trucks & Drivers', icon: <Users size={20} />, component: <TrucksAndDrivers /> },
    { name: 'Add Driver', icon: <UserPlus size={20} />, component: <AddDriverForm /> },
    { name: 'Add Truck', icon: <Truck size={20} />, component: <AddTruckForm /> },
    { name: 'Live Bookings', icon: <Package size={20} />, component: <LiveBookings /> },
    { name: 'Tollgate Logs', icon: <CreditCard size={20} />, component: <TollgateLogs /> },
    { name: 'Fuel Logs', icon: <Fuel size={20} />, component: <FuelLogs /> },
    { name: 'Payments', icon: <CreditCard size={20} />, component: <PaymentManagement /> },
    { name: 'Emergency Alerts', icon: <AlertTriangle size={20} />, component: <EmergencyAlerts /> },
    { name: 'Create Booking', icon: <Package size={20} />, component: <CreateBooking /> },
    { name: 'Smart Dispatch AI', icon: <Activity size={20} />, component: <SmartDispatch /> },
    { name: 'Settings', icon: <Settings size={20} />, component: <SettingsPage /> },

  ];


  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="owner-sidebar-header" style={styles.sidebarHeader}>
        <div className="owner-sidebar-brand" style={styles.brandWrap}>
          <div className="owner-sidebar-logo-wrap" style={styles.brandLogoWrap}>
            <img className="owner-sidebar-logo" src={eagleLogo} alt="Eagle Transport Logo" style={styles.brandLogo} />
          </div>
          <div>
            <h2 className="owner-sidebar-title" style={styles.sidebarTitle}>Eagle Transport</h2>
            <p className="owner-sidebar-subtitle" style={styles.sidebarSubTitle}>Owner Control Panel</p>
          </div>
        </div>
      </div>

      <div className="owner-sidebar-menu" style={styles.menu}>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`owner-sidebar-menu-item ${activeTab === item.name ? "is-active" : ""}`}
            style={{
              ...styles.menuItem,
              ...(activeTab === item.name ? styles.activeMenuItem : {}),
            }}
            onClick={() => handleTabChange(item.name)}
          >
            <span className="owner-sidebar-menu-icon" style={styles.menuIcon}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.name}</span>
            {activeTab === item.name && <ChevronRight size={16} />}
          </button>
        ))}
      </div>

      <div className="owner-sidebar-footer-card" style={styles.sidebarFooterCard}>
        <div style={styles.sidebarFooterTop}>
          <Activity size={18} />
          <span>Operations Running Smoothly</span>
        </div>
        <p style={styles.sidebarFooterText}>
          Monitor trucks, bookings, tolls, and alerts from one premium dashboard.
        </p>
      </div>

      <div className="owner-sidebar-logout-wrap" style={styles.logoutWrap}>
        <button className="owner-sidebar-logout-btn" style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div
      className="owner-dashboard-layout"
      style={{
        ...styles.layout,
        background:
          dashboardTheme === "dark"
            ? "#061524"
            : "linear-gradient(180deg, #edf3f9 0%, #f6f9fc 100%)",
      }}
    >
      <aside style={styles.desktopSidebar} className="desktop-only">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-only"
              style={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              style={styles.mobileSidebar}
              className="mobile-only owner-mobile-sidebar"
            >
              <div className="owner-mobile-close-wrap" style={styles.mobileCloseWrap}>
                <button className="owner-mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)} style={styles.mobileCloseBtn}>
                  <X size={28} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div
        className="owner-dashboard-main"
        style={{
          ...styles.main,
          background: dashboardTheme === "dark" ? "#061524" : "transparent",
        }}
      >
        <div style={styles.topbar} className="owner-dashboard-topbar">
          <div style={styles.topbarLeft}>
            <button className="mobile-only owner-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} style={styles.mobileMenuBtn}>
              <Menu size={28} />
            </button>

            <button className="owner-home-btn" style={styles.homeBtn} onClick={() => navigate('/')}>
              <Home size={18} /> Home
            </button>

            <div style={styles.searchBar} className="desktop-only owner-search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search bookings, trucks, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="owner-search-input"
                style={styles.searchInput} // Styles-il searchInput add seiyavum
              />
            </div>
          </div>

          <div style={styles.topActions}>

            {/* DASHBOARD LIGHT / DARK MODE */}
            <button
              type="button"
              className="owner-theme-toggle"
              onClick={toggleDashboardTheme}
              aria-label={dashboardTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              title={dashboardTheme === "light" ? "Dark Mode" : "Light Mode"}
            >
              <span className="owner-theme-toggle__icon">
                {dashboardTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </span>

              <span className="owner-theme-toggle__label desktop-only">
                {dashboardTheme === "light" ? "Dark" : "Light"}
              </span>
            </button>

            <div style={styles.notificationWrap}>


              <div style={styles.notificationWrap}>
                <button
                  type="button"
                  className="owner-notification-btn"
                  style={styles.notificationBtn}
                  onClick={async () => {
                    const willOpen = !showNotificationDropdown;

                    setShowNotificationDropdown(willOpen);

                    if (willOpen && unreadCount > 0) {
                      setNotifications((prev) =>
                        prev.map((item) => ({
                          ...item,
                          isRead: true,
                        }))
                      );

                      try {
                        const unreadNotifications = notifications.filter(
                          (item) => !item.isRead
                        );

                        await Promise.all(
                          unreadNotifications.map((item) =>
                            fetchWithAuth(
                              `${API_URL}/bookings/notifications/${item._id}/read`,
                              { method: "PUT" }
                            )
                          )
                        );
                      } catch (error) {
                        console.error("Mark notification read error:", error);
                      }
                    }
                  }}
                >
                  <Bell size={22} />

                  {unreadCount > 0 && (
                    <span style={styles.notificationCount}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div style={styles.notificationDropdown}>
                    <h4 style={styles.notificationTitle}>Notifications</h4>

                    {notifications.length === 0 ? (
                      <p style={styles.notificationEmpty}>No notifications</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item._id}
                          style={{
                            ...styles.notificationItem,
                            ...(item.isRead ? styles.notificationRead : styles.notificationUnread),
                          }}
                          onClick={async () => {
                            await fetchWithAuth(
                              `${API_URL}/bookings/notifications/${item._id}/read`,
                              { method: "PUT" }
                            );

                            setNotifications((prev) =>
                              prev.map((n) =>
                                n._id === item._id ? { ...n, isRead: true } : n
                              )
                            );
                          }}
                        >
                          <strong>{item.message}</strong>
                          <small>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString("en-IN")
                              : ""}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="owner-profile" style={styles.profile}>
              <img className="owner-avatar" src="/admin.png" alt="Admin User" style={styles.avatarImg} />
              <div className="desktop-only">
                <p style={styles.profileName}>Admin User</p>
                <p style={styles.profileRole}>Owner</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="owner-dashboard-content-outer"
          style={{
            ...styles.contentOuter,
            display: "flex",
            flexDirection: "column",
            background: dashboardTheme === "dark" ? "#061524" : "transparent",
          }}
        >
          <div
            className="owner-dashboard-content"
            style={{
              ...styles.content,
              flex: 1,
              backgroundColor: dashboardTheme === "dark" ? "#061524" : "#ffffff",
              borderColor:
                dashboardTheme === "dark"
                  ? "rgba(132, 174, 214, 0.10)"
                  : "rgba(15, 59, 115, 0.06)",
              boxShadow:
                dashboardTheme === "dark"
                  ? "none"
                  : "0 14px 34px rgba(15, 59, 115, 0.06)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight:
                    activeTab === "Tollgate Logs" && dashboardTheme === "dark"
                      ? "calc(100dvh - 100px)"
                      : undefined,
                  background:
                    activeTab === "Tollgate Logs" && dashboardTheme === "dark"
                      ? "#061524"
                      : "transparent",
                }}
              >
                <div style={styles.contentHeader} className="owner-dashboard-header">
                  <div style={styles.headerActionWrap}>
                    {activeTab === 'Trucks & Drivers' && (
                      <div className="fleet-premium-actions">
                        <button className="fleet-premium-action fleet-premium-action--truck" onClick={() => handleTabChange('Add Truck')}>
                          <span className="fleet-premium-action__icon"><Truck size={19} /></span>
                          <span className="fleet-premium-action__copy"><strong>Add Truck</strong><small>New vehicle</small></span>
                          <span className="fleet-premium-action__plus">+</span>
                        </button>
                        <button className="fleet-premium-action fleet-premium-action--driver" onClick={() => handleTabChange('Add Driver')}>
                          <span className="fleet-premium-action__icon"><UserPlus size={19} /></span>
                          <span className="fleet-premium-action__copy"><strong>Add Driver</strong><small>New member</small></span>
                          <span className="fleet-premium-action__plus">+</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {menuItems.find((i) => i.name === activeTab)?.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`

        /* Premium fleet quick actions */
        .fleet-premium-actions { display:flex; gap:10px; width:100%; justify-content:flex-end; margin-bottom:10px; }
        .fleet-premium-action { min-width:164px; height:58px; padding:7px 10px; border:1px solid rgba(15,74,136,.10); border-radius:17px; display:flex; align-items:center; gap:9px; cursor:pointer; color:#0b315d; background:linear-gradient(145deg,#fff 0%,#f5f9fd 100%); box-shadow:0 8px 22px rgba(8,47,89,.08); transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease; -webkit-tap-highlight-color:transparent; }
        .fleet-premium-action:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(8,47,89,.13); border-color:rgba(15,91,159,.20); }
        .fleet-premium-action:active { transform:scale(.975); }
        .fleet-premium-action__icon { width:40px; height:40px; flex:0 0 40px; border-radius:12px; display:grid; place-items:center; color:#fff; background:linear-gradient(135deg,#0f5b9f,#123b6c); box-shadow:0 7px 16px rgba(15,74,136,.18); }
        .fleet-premium-action--truck .fleet-premium-action__icon { background:linear-gradient(135deg,#ff9a2f,#ef6c00); box-shadow:0 7px 16px rgba(239,108,0,.18); }
        .fleet-premium-action__copy { display:flex; flex-direction:column; text-align:left; line-height:1.08; flex:1; }
        .fleet-premium-action__copy strong { font-size:12.5px; font-weight:800; white-space:nowrap; }
        .fleet-premium-action__copy small { margin-top:4px; font-size:9px; color:#8090a3; font-weight:650; white-space:nowrap; }
        .fleet-premium-action__plus { width:23px; height:23px; flex:0 0 23px; display:grid; place-items:center; border-radius:8px; background:#edf4fb; color:#0f5b9f; font-size:17px; font-weight:700; }
        @media (max-width:768px) { .fleet-premium-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin:0 0 10px; } .fleet-premium-action { min-width:0; width:100%; height:52px; padding:6px 8px; border-radius:15px; gap:7px; } .fleet-premium-action__icon { width:36px; height:36px; flex-basis:36px; border-radius:11px; } .fleet-premium-action__icon svg { width:17px; height:17px; } .fleet-premium-action__copy strong { font-size:11px; } .fleet-premium-action__copy small { font-size:8px; } .fleet-premium-action__plus { width:20px; height:20px; flex-basis:20px; font-size:15px; border-radius:7px; } }
        @media (max-width:380px) { .fleet-premium-action { height:48px; padding:5px 7px; } .fleet-premium-action__icon { width:33px; height:33px; flex-basis:33px; } .fleet-premium-action__copy small { display:none; } .fleet-premium-action__plus { width:18px; height:18px; flex-basis:18px; } }

        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }

          .owner-dashboard-main {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow-x: hidden !important;
          }

          .owner-dashboard-topbar {
            width: 100% !important;
            min-height: 68px !important;
            height: 68px !important;
            padding: 8px 14px !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
            box-sizing: border-box !important;
          }

          .owner-dashboard-content-outer {
            width: 100% !important;
            padding: 12px !important;
            box-sizing: border-box !important;
          }

          .owner-dashboard-content {
            width: 100% !important;
            min-width: 0 !important;
            min-height: auto !important;
            padding: 12px !important;
            border-radius: 19px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .owner-dashboard-header {
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 6px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .owner-dashboard-quickstats {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .owner-dashboard-topbar {
            min-height: 64px !important;
            height: 64px !important;
            padding: 7px 10px !important;
          }

          .owner-dashboard-topbar > div:first-child,
          .owner-dashboard-topbar > div:last-child {
            gap: 7px !important;
          }

          .owner-theme-toggle {
            width: 40px !important;
            min-width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
            border-radius: 12px !important;
          }

          .owner-theme-toggle__icon {
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
          }

          .owner-mobile-menu-btn,
          .owner-notification-btn {
            width: 40px !important;
            min-width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
            border-radius: 12px !important;
          }

          .owner-mobile-menu-btn svg,
          .owner-notification-btn svg {
            width: 21px !important;
            height: 21px !important;
          }

          .owner-home-btn {
            min-height: 40px !important;
            padding: 0 13px !important;
            gap: 6px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
          }

          .owner-home-btn svg {
            width: 16px !important;
            height: 16px !important;
          }

          .owner-profile {
            gap: 0 !important;
          }

          .owner-avatar {
            width: 40px !important;
            height: 40px !important;
          }

          .owner-dashboard-content-outer {
            padding: 9px !important;
          }

          .owner-dashboard-content {
            padding: 9px !important;
            border-radius: 17px !important;
          }

          .owner-dashboard-quickstats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }
        }

        @media (max-width: 380px) {
          .owner-dashboard-topbar {
            padding: 6px 8px !important;
          }

          .owner-home-btn {
            padding: 0 10px !important;
          }

          .owner-avatar {
            width: 36px !important;
            height: 36px !important;
          }
        }




        /* =========================================================
           FINAL FULL-HEIGHT DARK CANVAS FIX
           Prevents short pages (Tollgate / Emergency) from revealing white.
        ========================================================= */

        [data-theme="dark"] .owner-dashboard-layout,
        [data-theme="dark"] .owner-dashboard-main,
        [data-theme="dark"] .owner-dashboard-content-outer,
        [data-theme="dark"] .owner-dashboard-content {
          background: #061524 !important;
          background-color: #061524 !important;
        }

        .owner-dashboard-content-outer {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 1 auto !important;
        }

        .owner-dashboard-content {
          flex: 1 1 auto !important;
        }

        @media (max-width: 1024px) {
          .owner-dashboard-layout,
          .owner-dashboard-main {
            min-height: 100dvh !important;
          }

          .owner-dashboard-content-outer {
            min-height: calc(100dvh - 68px) !important;
          }

          .owner-dashboard-content {
            min-height: calc(100dvh - 92px) !important;
          }
        }

        @media (max-width: 640px) {
          .owner-dashboard-content-outer {
            min-height: calc(100dvh - 64px) !important;
          }

          .owner-dashboard-content {
            min-height: calc(100dvh - 82px) !important;
          }
        }


        /* =========================================================
           OWNER DASHBOARD — PREMIUM MOBILE SIDEBAR + DARK TOPBAR
           UI ONLY. No API / calculations / functions are changed.
        ========================================================= */

        /* =========================================================
           STICKY TOPBAR + COMPACT THEME SWITCH
        ========================================================= */

        .owner-dashboard-main {
          overflow-x: clip !important;
        }

        .owner-dashboard-topbar {
          position: sticky !important;
          top: 0 !important;
          z-index: 120 !important;
          flex-shrink: 0 !important;
        }

        .owner-theme-toggle {
          min-width: 78px;
          height: 42px;
          padding: 0 12px;
          border: 1px solid rgba(15, 74, 136, .10);
          border-radius: 13px;
          background: rgba(247, 250, 255, .96);
          color: #0c3c6b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(8, 47, 89, .06);
          transition:
            transform .18s ease,
            background .18s ease,
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .owner-theme-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 19px rgba(8, 47, 89, .09);
        }

        .owner-theme-toggle__icon {
          width: 23px;
          height: 23px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          color: #0f5b9f;
          background: #eaf4ff;
        }

        .owner-theme-toggle__label {
          line-height: 1;
        }

        /* Theme-safe topbar (desktop + mobile) */
        .owner-dashboard-topbar {
          transition:
            background-color .22s ease,
            border-color .22s ease,
            box-shadow .22s ease,
            color .22s ease !important;
        }

        [data-theme="dark"] .owner-dashboard-topbar {
          background: rgba(7, 24, 43, .92) !important;
          border-bottom-color: rgba(148, 163, 184, .13) !important;
          box-shadow: 0 8px 26px rgba(0, 0, 0, .18) !important;
          color: #eaf3ff !important;
          backdrop-filter: blur(18px) saturate(135%) !important;
          -webkit-backdrop-filter: blur(18px) saturate(135%) !important;
        }

        [data-theme="dark"] .owner-search-bar {
          background: rgba(255,255,255,.07) !important;
          border-color: rgba(255,255,255,.10) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
        }

        [data-theme="dark"] .owner-search-input {
          color: #f8fbff !important;
          background: transparent !important;
        }

        [data-theme="dark"] .owner-search-input::placeholder {
          color: #91a4bb !important;
        }

        [data-theme="dark"] .owner-notification-btn,
        [data-theme="dark"] .owner-mobile-menu-btn {
          color: #e7f1fc !important;
          background: rgba(255,255,255,.07) !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 8px 20px rgba(0,0,0,.12) !important;
        }

        [data-theme="dark"] .owner-profile {
          background: rgba(255,255,255,.06) !important;
          border-color: rgba(255,255,255,.09) !important;
          color: #f4f8fd !important;
        }

        [data-theme="dark"] .owner-profile p:first-child {
          color: #f4f8fd !important;
        }

        [data-theme="dark"] .owner-profile p:last-child {
          color: #9db0c5 !important;
        }

        [data-theme="dark"] .owner-home-btn {
          background: linear-gradient(135deg, #145a9d 0%, #0d3c70 100%) !important;
          border: 1px solid rgba(93, 170, 239, .20) !important;
          box-shadow: 0 9px 22px rgba(0,0,0,.18) !important;
        }

        /* Mobile drawer */
        @media (max-width: 1024px) {
          .owner-mobile-sidebar {
            width: min(252px, 82vw) !important;
            max-width: 252px !important;
            background:
              linear-gradient(180deg, #071b33 0%, #0b2b50 55%, #103a69 100%) !important;
            border-right: 1px solid rgba(255,255,255,.08) !important;
            box-shadow: 18px 0 46px rgba(2, 12, 27, .30) !important;
            overflow-x: hidden !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255,255,255,.18) transparent !important;
          }

          .owner-mobile-sidebar::-webkit-scrollbar {
            width: 4px;
          }

          .owner-mobile-sidebar::-webkit-scrollbar-track {
            background: transparent;
          }

          .owner-mobile-sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,.18);
            border-radius: 999px;
          }

          .owner-mobile-sidebar .owner-sidebar-header {
            padding: 16px 48px 14px 14px !important;
            min-height: 68px !important;
            border-bottom: 1px solid rgba(255,255,255,.08) !important;
          }

          .owner-mobile-sidebar .owner-sidebar-brand {
            gap: 9px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logo-wrap {
            width: 38px !important;
            height: 38px !important;
            min-width: 38px !important;
            border-radius: 11px !important;
            box-shadow: 0 7px 18px rgba(255,140,26,.16) !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logo {
            width: 62px !important;
            height: 62px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-title {
            font-size: 13px !important;
            line-height: 1.15 !important;
            font-weight: 800 !important;
            letter-spacing: -.15px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-subtitle {
            margin-top: 3px !important;
            font-size: 9.5px !important;
            line-height: 1.2 !important;
            color: rgba(255,255,255,.58) !important;
          }

          .owner-mobile-close-wrap {
            top: 15px !important;
            right: 12px !important;
            z-index: 5 !important;
          }

          .owner-mobile-close-btn {
            width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            border-radius: 11px !important;
            color: #fff !important;
            background: rgba(255,255,255,.08) !important;
            border: 1px solid rgba(255,255,255,.09) !important;
            box-shadow: 0 7px 18px rgba(0,0,0,.12) !important;
            transition: transform .15s ease, background .15s ease !important;
          }

          .owner-mobile-close-btn svg {
            width: 19px !important;
            height: 19px !important;
          }

          .owner-mobile-close-btn:active {
            transform: scale(.94) !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu {
            padding: 11px 10px 8px !important;
            gap: 4px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-item {
            min-height: 41px !important;
            padding: 8px 10px !important;
            gap: 9px !important;
            border-radius: 11px !important;
            font-size: 11.5px !important;
            line-height: 1.15 !important;
            font-weight: 700 !important;
            letter-spacing: -.05px !important;
            transition:
              transform .14s ease,
              background .14s ease,
              border-color .14s ease,
              box-shadow .14s ease !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-item:active {
            transform: scale(.975) !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-item.is-active {
            color: #fff !important;
            background:
              linear-gradient(135deg, rgba(255,140,26,.22), rgba(255,255,255,.09)) !important;
            border-color: rgba(255,181,89,.20) !important;
            box-shadow:
              0 7px 17px rgba(0,0,0,.15),
              inset 3px 0 0 #ff8c1a !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-icon {
            width: 27px !important;
            height: 27px !important;
            flex: 0 0 27px !important;
            display: grid !important;
            place-items: center !important;
            border-radius: 8px !important;
            background: rgba(255,255,255,.055) !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-icon svg {
            width: 15px !important;
            height: 15px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-item.is-active .owner-sidebar-menu-icon {
            background: rgba(255,255,255,.10) !important;
          }

          /* Keep drawer short and useful on phones */
          .owner-mobile-sidebar .owner-sidebar-footer-card {
            display: none !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logout-wrap {
            padding: 8px 10px 14px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logout-btn {
            min-height: 41px !important;
            padding: 8px 11px !important;
            gap: 9px !important;
            border-radius: 11px !important;
            font-size: 11.5px !important;
            background: rgba(239,68,68,.10) !important;
            border: 1px solid rgba(248,113,113,.14) !important;
            color: #ffe5e5 !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logout-btn svg {
            width: 15px !important;
            height: 15px !important;
          }
        }

        /* Large phones */
        @media (max-width: 640px) {
          .owner-dashboard-topbar {
            background: rgba(255,255,255,.94) !important;
            border-bottom: 1px solid rgba(15,74,136,.07) !important;
            box-shadow: 0 5px 18px rgba(8,47,89,.06) !important;
            backdrop-filter: blur(16px) saturate(130%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(130%) !important;
          }

          [data-theme="dark"] .owner-dashboard-topbar {
            background: rgba(6,22,40,.95) !important;
            border-bottom-color: rgba(255,255,255,.08) !important;
            box-shadow: 0 7px 20px rgba(0,0,0,.19) !important;
          }

          .owner-mobile-menu-btn,
          .owner-notification-btn {
            background: #f7faff !important;
            color: #0b3b69 !important;
            border: 1px solid #e4edf7 !important;
            box-shadow: 0 5px 14px rgba(8,47,89,.055) !important;
          }

          [data-theme="dark"] .owner-mobile-menu-btn,
          [data-theme="dark"] .owner-notification-btn {
            background: rgba(255,255,255,.07) !important;
            color: #eef6ff !important;
            border-color: rgba(255,255,255,.10) !important;
          }

          .owner-home-btn {
            min-width: 78px !important;
            justify-content: center !important;
            background: linear-gradient(135deg,#0f5b9f,#103d70) !important;
            box-shadow: 0 7px 16px rgba(15,74,136,.16) !important;
          }

          .owner-avatar {
            border: 2px solid rgba(15,91,159,.10) !important;
            box-shadow: 0 5px 14px rgba(8,47,89,.08) !important;
          }

          [data-theme="dark"] .owner-avatar {
            border-color: rgba(255,255,255,.12) !important;
            box-shadow: 0 5px 14px rgba(0,0,0,.18) !important;
          }

          .owner-mobile-sidebar {
            width: min(242px, 84vw) !important;
            max-width: 242px !important;
          }
        }

        /* Small phones */
        @media (max-width: 420px) {
          .owner-dashboard-topbar {
            min-height: 58px !important;
            height: 58px !important;
            padding: 6px 8px !important;
          }

          .owner-theme-toggle {
            width: 37px !important;
            min-width: 37px !important;
            height: 37px !important;
            border-radius: 11px !important;
          }

          .owner-theme-toggle__icon svg {
            width: 17px !important;
            height: 17px !important;
          }

          .owner-mobile-menu-btn,
          .owner-notification-btn {
            width: 37px !important;
            min-width: 37px !important;
            height: 37px !important;
            border-radius: 11px !important;
          }

          .owner-mobile-menu-btn svg,
          .owner-notification-btn svg {
            width: 18px !important;
            height: 18px !important;
          }

          .owner-home-btn {
            min-width: 70px !important;
            min-height: 37px !important;
            height: 37px !important;
            padding: 0 10px !important;
            border-radius: 11px !important;
            font-size: 11px !important;
          }

          .owner-home-btn svg {
            width: 14px !important;
            height: 14px !important;
          }

          .owner-avatar {
            width: 37px !important;
            height: 37px !important;
          }

          .owner-mobile-sidebar {
            width: min(228px, 86vw) !important;
            max-width: 228px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-header {
            min-height: 62px !important;
            padding: 13px 43px 11px 11px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logo-wrap {
            width: 34px !important;
            height: 34px !important;
            min-width: 34px !important;
            border-radius: 10px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logo {
            width: 56px !important;
            height: 56px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-title {
            font-size: 12px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-subtitle {
            font-size: 8.8px !important;
          }

          .owner-mobile-close-wrap {
            top: 12px !important;
            right: 9px !important;
          }

          .owner-mobile-close-btn {
            width: 33px !important;
            height: 33px !important;
            border-radius: 10px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu {
            padding: 8px 8px 6px !important;
            gap: 3px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-item {
            min-height: 38px !important;
            padding: 7px 8px !important;
            gap: 7px !important;
            border-radius: 10px !important;
            font-size: 10.5px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-icon {
            width: 25px !important;
            height: 25px !important;
            flex-basis: 25px !important;
            border-radius: 7px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-menu-icon svg {
            width: 14px !important;
            height: 14px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logout-wrap {
            padding: 6px 8px 10px !important;
          }

          .owner-mobile-sidebar .owner-sidebar-logout-btn {
            min-height: 38px !important;
            border-radius: 10px !important;
            font-size: 10.5px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .owner-mobile-sidebar *,
          .owner-dashboard-topbar *,
          .owner-mobile-close-btn {
            transition: none !important;
          }
        }


        /* ==========================================
           ADD DRIVER / ADD TRUCK - MOBILE PREMIUM
        ========================================== */

        @media (max-width: 768px) {
          .owner-add-form-wrap {
            width: 100% !important;
            margin: 0 0 14px !important;
            overflow: visible !important;
          }

          .owner-add-form-wrap > div[style*="position: absolute"] {
            display: none !important;
          }

          .owner-add-form-card {
            width: 100% !important;
            padding: 18px 16px !important;
            border-radius: 20px !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            background: linear-gradient(145deg, #ffffff 0%, #f7fbff 100%) !important;
            border: 1px solid #e4edf7 !important;
            box-shadow: 0 12px 30px rgba(8, 47, 89, 0.08) !important;
          }

          .owner-add-form-head {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            gap: 11px !important;
            margin-bottom: 16px !important;
          }

          .owner-add-form-head > div:first-child {
            width: 46px !important;
            height: 46px !important;
            min-width: 46px !important;
            border-radius: 14px !important;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18) !important;
          }

          .owner-add-form-head > div:first-child svg {
            width: 20px !important;
            height: 20px !important;
          }

          .owner-add-form-title {
            margin: 0 !important;
            font-size: 20px !important;
            line-height: 1.1 !important;
            letter-spacing: -0.35px !important;
            color: #0b315d !important;
          }

          .owner-add-form-subtitle {
            margin: 4px 0 0 !important;
            max-width: 245px !important;
            font-size: 10.5px !important;
            line-height: 1.4 !important;
            color: #71839a !important;
          }

          .owner-add-form-grid {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .owner-add-form-grid > div {
            width: 100% !important;
            min-width: 0 !important;
          }

          .owner-add-form-grid input,
          .owner-add-form-grid select,
          .owner-add-form-grid textarea {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 44px !important;
            padding: 0 12px !important;
            border-radius: 12px !important;
            border: 1px solid #d8e4f0 !important;
            background: #ffffff !important;
            color: #153b63 !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            outline: none !important;
            box-shadow: 0 3px 10px rgba(8, 47, 89, 0.035) !important;
            box-sizing: border-box !important;
          }

          .owner-add-form-grid textarea {
            min-height: 86px !important;
            padding: 11px 12px !important;
            line-height: 1.45 !important;
            resize: vertical !important;
          }

          .owner-add-form-grid input:focus,
          .owner-add-form-grid select:focus,
          .owner-add-form-grid textarea:focus {
            border-color: #2b6fb0 !important;
            box-shadow: 0 0 0 3px rgba(43, 111, 176, 0.08) !important;
          }

          .owner-add-form-grid span[style*="color"] {
            display: block !important;
            margin: 3px 2px 0 !important;
            font-size: 9.5px !important;
            line-height: 1.3 !important;
          }

          .owner-add-form-submit {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            min-height: 44px !important;
            margin-top: 2px !important;
            padding: 0 14px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            gap: 7px !important;
            background: linear-gradient(135deg, #0f5b9f 0%, #103d70 100%) !important;
            box-shadow: 0 9px 20px rgba(15, 74, 136, 0.18) !important;
          }

          .owner-add-form-submit svg {
            width: 15px !important;
            height: 15px !important;
          }
        }

        @media (max-width: 420px) {
          .owner-add-form-card {
            padding: 16px 13px !important;
            border-radius: 18px !important;
          }

          .owner-add-form-head {
            gap: 9px !important;
            margin-bottom: 14px !important;
          }

          .owner-add-form-head > div:first-child {
            width: 42px !important;
            height: 42px !important;
            min-width: 42px !important;
            border-radius: 12px !important;
          }

          .owner-add-form-title {
            font-size: 18px !important;
          }

          .owner-add-form-subtitle {
            max-width: 215px !important;
            font-size: 9.5px !important;
          }

          .owner-add-form-grid {
            gap: 8px !important;
          }

          .owner-add-form-grid input,
          .owner-add-form-grid select {
            min-height: 42px !important;
            font-size: 11.5px !important;
          }

          .owner-add-form-grid textarea {
            min-height: 78px !important;
            font-size: 11.5px !important;
          }

          .owner-add-form-submit {
            min-height: 42px !important;
            font-size: 11.5px !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
        }

        /* Tollgate dark short-page fill only */
        body[data-theme="dark"] .owner-dashboard-content .toll-mobile-page,
        html[data-theme="dark"] .owner-dashboard-content .toll-mobile-page {
          flex: 1 1 auto !important;
          background: #061524 !important;
          background-color: #061524 !important;
        }



        /* =========================================================
           OWNER DASHBOARD MOBILE TOPBAR — FIXED POSITION ONLY
           UI/layout fix only.
           No functions, calculations, API calls, content or other CSS changed.
        ========================================================= */

        @media (max-width: 1024px) {

          .owner-dashboard-topbar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;

            width: 100% !important;
            max-width: 100% !important;

            z-index: 500 !important;

            margin: 0 !important;

            box-sizing: border-box !important;
          }

          /* Fixed topbar is removed from normal document flow.
             Add only the exact top spacing required so page content
             starts below the bar instead of going underneath it. */
          .owner-dashboard-main {
            padding-top: 68px !important;
          }

        }


        @media (max-width: 640px) {

          .owner-dashboard-main {
            padding-top: 64px !important;
          }

        }

        /* ===============================
   MOBILE MENU ICON CENTER FIX
================================ */

@media (max-width: 1024px) {

  .owner-mobile-menu-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    padding: 0 !important;
    margin: 0 !important;

    width: 40px !important;
    min-width: 40px !important;
    height: 40px !important;

    line-height: 1 !important;
  }

  .owner-mobile-menu-btn svg {
    display: block !important;

    width: 22px !important;
    height: 22px !important;

    margin: 0 !important;
    padding: 0 !important;

    flex-shrink: 0 !important;
  }
}

@media (max-width: 420px) {

  .owner-mobile-menu-btn {
    width: 38px !important;
    min-width: 38px !important;
    height: 38px !important;
  }

  .owner-mobile-menu-btn svg {
    width: 21px !important;
    height: 21px !important;
  }
}


      `}</style>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'transparent',
    overflowX: 'clip',
  },

  desktopSidebar: {
    width: `${SIDEBAR_WIDTH}px`,
    background: 'linear-gradient(180deg, #0b2342 0%, #102f57 55%, #143965 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '10px 0 30px rgba(5, 23, 42, 0.18)',
    overflowY: 'auto',
  },

  mobileSidebar: {
    width: `${SIDEBAR_WIDTH}px`,
    background: 'linear-gradient(180deg, #0b2342 0%, #102f57 55%, #143965 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 200,
    boxShadow: '4px 0 20px rgba(0,0,0,0.35)',
    overflowY: 'auto',
  },

  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(3px)',
    zIndex: 180,
  },

  mobileCloseWrap: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },

  mobileCloseBtn: {
    color: 'white',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    padding: '6px',
  },

  sidebarHeader: {
    padding: '26px 22px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },

  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  brandLogoWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(255, 140, 26, 0.20)',
    overflow: 'hidden',
  },

  brandLogo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },

  sidebarTitle: {
    fontSize: '1.08rem',
    color: 'white',
    margin: 0,
    fontWeight: '700',
  },

  sidebarSubTitle: {
    margin: '4px 0 0 0',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.85rem',
  },

  menu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '22px 16px',
    gap: '10px',
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 16px',
    color: 'rgba(255,255,255,0.76)',
    borderRadius: '16px',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
  },

  menuIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeMenuItem: {
    background: 'linear-gradient(135deg, rgba(255,140,26,0.18) 0%, rgba(255,255,255,0.08) 100%)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
  },

  sidebarFooterCard: {
    margin: '8px 16px 0',
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  sidebarFooterTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    fontWeight: '700',
    marginBottom: '8px',
  },

  sidebarFooterText: {
    margin: 0,
    color: 'rgba(255,255,255,0.68)',
    lineHeight: '1.6',
    fontSize: '0.85rem',
  },

  logoutWrap: {
    marginTop: 'auto',
    padding: '20px 16px 24px',
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 16px',
    color: '#fff',
    width: '100%',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    fontWeight: '600',
  },

  main: {
    flex: 1,
    marginLeft: `${SIDEBAR_WIDTH}px`,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    width: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
    maxWidth: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
    overflowX: 'clip',
  },

  topbar: {
    height: '74px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(18px) saturate(135%)',
    WebkitBackdropFilter: 'blur(18px) saturate(135%)',
    borderBottom: '1px solid rgba(15, 59, 115, 0.08)',
    padding: '0 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 120,
    boxShadow: '0 6px 20px rgba(8, 47, 89, 0.06)',
  },

  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  mobileMenuBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--dark-blue)',
    cursor: 'pointer',
  },

  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '10px 16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(15, 74, 136, 0.18)',
  },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fbff',
    padding: '10px 16px',
    borderRadius: '999px',
    width: '330px',
    border: '1px solid rgba(15, 59, 115, 0.08)',
  },

  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    color: 'var(--dark-blue)',
  },

  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },

  iconBtn: {
    position: 'relative',
    color: 'var(--text-muted)',
    background: '#fff',
    border: '1px solid rgba(15, 59, 115, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    width: '42px',
    height: '42px',
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
    width: "320px",
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
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },


  badgeCount: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'var(--danger)',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
  },

  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 8px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.6)',
  },

  avatarImg: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: 'var(--shadow-sm)',
    border: '2px solid #fff',
  },

  profileName: {
    fontWeight: '700',
    fontSize: '0.9rem',
    lineHeight: '1',
    margin: 0,
    color: 'var(--dark-blue)',
  },

  profileRole: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '4px 0 0 0',
  },

  contentOuter: {
    flex: 1,
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },

  quickStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },

  quickStatCard: {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(15, 59, 115, 0.08)',
    borderRadius: '20px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 10px 30px rgba(15, 59, 115, 0.05)',
  },

  quickStatIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickStatLabel: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
  },

  quickStatValue: {
    margin: '4px 0 0 0',
    color: 'var(--dark-blue)',
    fontSize: '1rem',
    fontWeight: '800',
  },

  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '28px',
    minHeight: 'calc(100vh - 210px)',
    padding: '32px',
    boxShadow: '0 14px 34px rgba(15, 59, 115, 0.06)',
    border: '1px solid rgba(15, 59, 115, 0.06)',
  },

  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    gap: '16px',
    flexWrap: 'wrap',
  },

  breadcrumb: {
    display: 'inline-block',
    marginBottom: '10px',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
    background: '#f5f8fc',
    padding: '6px 12px',
    borderRadius: '999px',
  },

  pageTitle: {
    fontSize: '1.9rem',
    color: 'var(--dark-blue)',
    margin: 0,
    fontWeight: '800',
  },

  pageSubTitle: {
    margin: '8px 0 0 0',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },

  headerActionWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },

  primaryActionBtn: {
    borderRadius: '14px',
    padding: '10px 18px',
    fontWeight: '700',
    boxShadow: '0 10px 20px rgba(255, 140, 26, 0.2)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },

  formCard: {
    padding: '28px',
    borderRadius: '24px',
    marginBottom: '24px',
  },

  formTitle: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontSize: '1.5rem',
    fontWeight: '800',
  },

  formSubTitle: {
    margin: '8px 0 22px',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #dbe4ef',
    outline: 'none',
    fontSize: '1rem',
    boxSizing: 'border-box',
    background: '#fff',
  },

  submitBtn: {
    gridColumn: '1 / -1',
    borderRadius: '14px',
    padding: '14px 20px',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  listCard: {
    padding: '24px',
    borderRadius: '24px',
  },

  listItem: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid var(--border-light)',
    color: 'var(--dark-blue)',
  },
  notificationWrap: {
    position: "relative",
  },

  notificationBtn: {
    position: "relative",
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    border: "1px solid rgba(15, 74, 136, 0.12)",
    background: "#ffffff",
    color: "var(--dark-blue)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15, 74, 136, 0.08)",
  },

  notificationCount: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "999px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDropdown: {
    position: "absolute",
    top: "54px",
    right: 0,
    width: "320px",
    maxHeight: "420px",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "14px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
    border: "1px solid #e8eef6",
    zIndex: 999,
  },

  notificationTitle: {
    margin: "0 0 12px",
    color: "var(--dark-blue)",
    fontSize: "16px",
    fontWeight: 900,
  },

  notificationEmpty: {
    margin: 0,
    color: "var(--text-muted)",
    fontWeight: 700,
    textAlign: "center",
    padding: "18px",
  },

  notificationItem: {
    padding: "12px",
    borderRadius: "14px",
    marginBottom: "10px",
    cursor: "pointer",
    display: "grid",
    gap: "5px",
    color: "var(--dark-blue)",
  },

  notificationUnread: {
    background: "#eef6ff",
    border: "1px solid #cfe4ff",
  },

  notificationRead: {
    background: "#f8fafc",
    border: "1px solid #e8eef6",
    opacity: 0.75,
  },

  premiumFormWrapper: {
    position: "relative",
    marginBottom: "28px",
  },

  formGlow1: {
    position: "absolute",
    width: "220px",
    height: "220px",
    background: "rgba(59,130,246,0.18)",
    filter: "blur(70px)",
    borderRadius: "50%",
    top: "-40px",
    left: "-40px",
    zIndex: 0,
  },

  formGlow2: {
    position: "absolute",
    width: "240px",
    height: "240px",
    background: "rgba(255,140,26,0.18)",
    filter: "blur(70px)",
    borderRadius: "50%",
    bottom: "-40px",
    right: "-40px",
    zIndex: 0,
  },

  premiumFormCard: {
    position: "relative",
    zIndex: 2,
    padding: "34px",
    borderRadius: "32px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,255,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 25px 60px rgba(15, 74, 136, 0.12)",
    backdropFilter: "blur(18px)",
  },

  formTopSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "28px",
  },

  formIconWrap: {
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
    boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
  },

  premiumFormTitle: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "900",
    color: "#0f172a",
  },

  premiumFormSubTitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "0.96rem",
    lineHeight: "1.7",
  },

  premiumFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  premiumInput: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid #dbe7f5",
    outline: "none",
    fontSize: "0.98rem",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    fontWeight: "600",
    transition: "all 0.25s ease",
    boxShadow: "0 6px 18px rgba(15, 74, 136, 0.05)",
  },

  premiumSubmitBtn: {
    gridColumn: "1 / -1",
    borderRadius: "20px",
    padding: "16px 24px",
    fontWeight: "800",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
    color: "#fff",
    boxShadow: "0 18px 35px rgba(37,99,235,0.28)",
    cursor: "pointer",
  },
};

export default OwnerDashboard;