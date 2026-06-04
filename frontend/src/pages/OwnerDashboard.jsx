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

const SIDEBAR_WIDTH = 280;

const AddDriverForm = () => {

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    driverName: '',
    mobile: '',
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
          "http://localhost:5000/api/trucks"
        );

        const truckData = await truckRes.json();

        const driverRes = await fetchWithAuth(
          "http://localhost:5000/api/drivers"
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
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateDriverForm()) {
      return;
    }

    try {

      const driverData = {
        name: form.driverName,
        phone: form.mobile,
        username: form.username,
        password: form.password,
        licenseNumber: form.licenseNumber,
        experience: form.experience,
        address: form.address,
        assignedTruck: form.assignedTruck || null,
        status: "available",
      };

      const res = await fetchWithAuth(
        "http://localhost:5000/api/drivers",
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

      // ✅ Refresh Drivers
      const driverRes = await fetchWithAuth(
        "http://localhost:5000/api/drivers"
      );

      const updatedDrivers = await driverRes.json();

      setDrivers(Array.isArray(updatedDrivers) ? updatedDrivers : []);

      // ✅ Reset Form
      setForm({
        driverName: '',
        mobile: '',
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

      <div style={styles.premiumFormWrapper}>

        <div style={styles.formGlow1}></div>
        <div style={styles.formGlow2}></div>

        <div className="card" style={styles.premiumFormCard}>

          <div style={styles.formTopSection}>

            <div style={styles.formIconWrap}>
              <UserPlus size={28} />
            </div>

            <div>
              <h2 style={styles.premiumFormTitle}>
                Add Driver
              </h2>

              <p style={styles.premiumFormSubTitle}>
                Create driver login credentials and assign available truck.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
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
              className="btn btn-primary"
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
        trailerSize:"",
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
    <div style={styles.premiumFormWrapper}>
      <div style={styles.formGlow1}></div>
      <div style={styles.formGlow2}></div>

      <div className="card" style={styles.premiumFormCard}>
        <div style={styles.formTopSection}>
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
            <h2 style={styles.premiumFormTitle}>Add Truck</h2>

            <p style={styles.premiumFormSubTitle}>
              Add truck details, RC book, permit, fitness, and insurance information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.premiumFormGrid}>
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
            className="btn btn-primary"
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
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('ownerLoggedIn');
    if (!isLoggedIn) navigate('/owner/login');
  }, [navigate]);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings/notifications/all");
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
      <div style={styles.sidebarHeader}>
        <div style={styles.brandWrap}>
          <div style={styles.brandLogoWrap}>
            <img src={eagleLogo} alt="Eagle Transport Logo" style={styles.brandLogo} />
          </div>
          <div>
            <h2 style={styles.sidebarTitle}>Eagle Transport</h2>
            <p style={styles.sidebarSubTitle}>Owner Control Panel</p>
          </div>
        </div>
      </div>

      <div style={styles.menu}>
        {menuItems.map((item) => (
          <button
            key={item.name}
            style={{
              ...styles.menuItem,
              ...(activeTab === item.name ? styles.activeMenuItem : {}),
            }}
            onClick={() => handleTabChange(item.name)}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.name}</span>
            {activeTab === item.name && <ChevronRight size={16} />}
          </button>
        ))}
      </div>

      <div style={styles.sidebarFooterCard}>
        <div style={styles.sidebarFooterTop}>
          <Activity size={18} />
          <span>Operations Running Smoothly</span>
        </div>
        <p style={styles.sidebarFooterText}>
          Monitor trucks, bookings, tolls, and alerts from one premium dashboard.
        </p>
      </div>

      <div style={styles.logoutWrap}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={styles.layout}>
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
              className="mobile-only"
            >
              <div style={styles.mobileCloseWrap}>
                <button onClick={() => setIsMobileMenuOpen(false)} style={styles.mobileCloseBtn}>
                  <X size={28} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={styles.main} className="owner-dashboard-main">
        <div style={styles.topbar} className="owner-dashboard-topbar">
          <div style={styles.topbarLeft}>
            <button className="mobile-only" onClick={() => setIsMobileMenuOpen(true)} style={styles.mobileMenuBtn}>
              <Menu size={28} />
            </button>

            <button style={styles.homeBtn} onClick={() => navigate('/')}>
              <Home size={18} /> Home
            </button>

            <div style={styles.searchBar} className="desktop-only">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search bookings, trucks, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput} // Styles-il searchInput add seiyavum
              />
            </div>
          </div>

          <div style={styles.topActions}>                       
            <div style={styles.notificationWrap}>
  

  <div style={styles.notificationWrap}>
  <button
    type="button"
    style={styles.notificationBtn}
    onClick={() => setShowNotificationDropdown((prev) => !prev)}
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
              await fetch(
                `http://localhost:5000/api/bookings/notifications/${item._id}/read`,
                {
                  headers: authHeader(),
                  method: "PUT" }
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
            <div style={styles.profile}>
              <img src="/admin.png" alt="Admin User" style={styles.avatarImg} />
              <div className="desktop-only">
                <p style={styles.profileName}>Admin User</p>
                <p style={styles.profileRole}>Owner</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.contentOuter} className="owner-dashboard-content-outer">
          <div style={styles.content} className="owner-dashboard-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <div style={styles.contentHeader} className="owner-dashboard-header">                
                  <div style={styles.headerActionWrap}>
                    {activeTab === 'Trucks & Drivers' && (
                      <>
                        <button className="btn btn-primary" style={styles.primaryActionBtn} onClick={() => handleTabChange('Add Truck')}>
                          + Add Truck
                        </button>
                        <button className="btn btn-primary" style={styles.primaryActionBtn} onClick={() => handleTabChange('Add Driver')}>
                          + Add Driver
                        </button>
                      </>
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
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }

          .owner-dashboard-main {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
          }

          .owner-dashboard-topbar {
            padding: 0 16px !important;
            height: auto !important;
            min-height: 74px !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }

          .owner-dashboard-content-outer {
            padding: 16px !important;
          }

          .owner-dashboard-quickstats {
            grid-template-columns: 1fr 1fr !important;
          }

          .owner-dashboard-content {
            padding: 20px !important;
            border-radius: 22px !important;
            min-height: auto !important;
          }

          .owner-dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 640px) {
          .owner-dashboard-quickstats {
            grid-template-columns: 1fr !important;
          }

          .owner-dashboard-content {
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .owner-dashboard-topbar {
            padding: 12px !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #edf3f9 0%, #f6f9fc 100%)',
    overflowX: 'hidden',
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
    overflowX: 'hidden',
  },

  topbar: {
    height: '74px',
    backgroundColor: 'rgba(255,255,255,0.76)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(15, 59, 115, 0.08)',
    padding: '0 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 90,
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