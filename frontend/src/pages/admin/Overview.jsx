import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authHeader } from "../../utils/authHeader";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { GST_PERCENTAGE } from "../../utils/financeConfig";
import {
  Truck,
  Package,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  Users,
  CheckCircle,
  CalendarDays,
  Clock3,
  ShieldAlert,
  UserPlus,
  Route,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

// Props-il searchTerm matrum setSearchTerm-ai vaangugirom
const Overview = ({ onNavigate, searchTerm, setSearchTerm }) => {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tollLogs, setTollLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const safeJson = async (res) => {
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || data?.logs || data?.items || [];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [truckRes, driverRes, bookingRes, tollRes, issueRes, fuelRes] = await Promise.all([
        fetch(
          `${API_URL}/trucks`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/drivers`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/bookings`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/toll`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/issues`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/fuel`,
          {
            headers: authHeader(),
          }
        ),
      ]);

      const [truckData, driverData, bookingData, tollData, issueData, fuelData] = await Promise.all([
        safeJson(truckRes),
        safeJson(driverRes),
        safeJson(bookingRes),
        safeJson(tollRes),
        safeJson(issueRes),
        safeJson(fuelRes),
      ]);

      setTrucks(truckData);
      setDrivers(driverData);
      setBookings(bookingData);
      setTollLogs(tollData);
      setIssues(issueData);
      setFuelLogs(fuelData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Overview data load error:', error);
      setTrucks([]);
      setDrivers([]);
      setBookings([]);
      setTollLogs([]);
      setIssues([]);
      setFuelLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 120000);
    return () => clearInterval(timer);
  }, []);

  const normalizeStatus = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('transit') || s.includes('route')) return 'In Transit';
    if (s.includes('dispatch') || s.includes('assign')) return 'Dispatched';
    return 'Booked';
  };

  const getTruckIdFromBooking = (booking) => {
    return (
      booking.truck?._id ||
      booking.truck?.id ||
      booking.truck ||
      booking.assignedTruck?._id ||
      booking.assignedTruck?.id ||
      booking.assignedTruck ||
      null
    );
  };

  const formatMoney = (amount) => {
    const value = Number(amount || 0);
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };


  const getPaidAmount = (booking) => {
    return Number(
      booking.paidAmount ||
      booking.advanceAmount ||
      booking.advance ||
      booking.payment?.paidAmount ||
      booking.payment?.advanceAmount ||
      0
    );
  };

  const getBookingAmount = (booking) => {
    return Number(booking.amount || booking.totalAmount || booking.fare || booking.estimatedFare || 0);
  };

  const getInvoiceTotal = (booking) => {
    const savedTotal = Number(booking.payment?.totalWithGST || 0);
    if (savedTotal > 0) return savedTotal;

    const baseAmount = getBookingAmount(booking);
    const savedGst = Number(booking.payment?.gstAmount || 0);
    const gstAmount =
      savedGst > 0 ? savedGst : (baseAmount * GST_PERCENTAGE) / 100;

    return baseAmount + gstAmount;
  };

  const getFuelLiters = (log) => Number(log.liters || log.litre || log.quantity || log.fuelLiters || 0);
  const getFuelAmount = (log) => Number(log.amount || log.totalAmount || log.cost || log.fuelCost || 0);
  const getFuelKm = (log) => Number(log.km || log.kilometer || log.distanceKm || log.odometerKm || log.currentKm || 0);

  const getFuelMileage = (log) => {
    const km = getFuelKm(log);
    const liters = getFuelLiters(log);
    return liters > 0 ? km / liters : 0;
  };

  // Filtered Logic using SearchTerm prop
  const filteredBookings = useMemo(() => {
    const search = (searchTerm || '').toLowerCase();
    return bookings.filter((booking) => {
      return (
        booking.bookingId?.toLowerCase().includes(search) ||
        booking.customerName?.toLowerCase().includes(search) ||
        booking.phone?.toLowerCase().includes(search) ||
        booking.pickup?.toLowerCase().includes(search) ||
        booking.drop?.toLowerCase().includes(search)
      );
    });
  }, [bookings, searchTerm]);

  const overview = useMemo(() => {
    const activeTruckIds = new Set();

    filteredBookings.forEach((booking) => {
      const status = normalizeStatus(booking.status);
      const truckId = getTruckIdFromBooking(booking);

      if (truckId && status !== 'Delivered') {
        activeTruckIds.add(String(truckId));
      }
    });

    const activeTrucks = activeTruckIds.size;

    const liveBookings = filteredBookings.filter((booking) => {
      const status = normalizeStatus(booking.status);
      return status === 'Dispatched' || status === 'In Transit';
    }).length;

    const pendingBookings = filteredBookings.filter(
      (booking) => normalizeStatus(booking.status) === 'Booked'
    ).length;

    const deliveredBookings = filteredBookings.filter(
      (booking) => normalizeStatus(booking.status) === 'Delivered'
    ).length;

    const totalRevenue = filteredBookings.reduce(
      (sum, booking) => sum + getInvoiceTotal(booking),
      0
    );

    const collectedRevenue = filteredBookings.reduce(
      (sum, booking) => sum + getPaidAmount(booking),
      0
    );

    const pendingPayments = filteredBookings.reduce((sum, booking) => {
      const total = getInvoiceTotal(booking);
      const paid = getPaidAmount(booking);
      return sum + Math.max(total - paid, 0);
    }, 0);

    const tollTotal = tollLogs.reduce(
      (sum, toll) => sum + Number(toll.amount || 0),
      0
    );

    const utilization =
      trucks.length > 0 ? Math.round((activeTrucks / trucks.length) * 100) : 0;

    const totalFuelLiters = fuelLogs.reduce(
      (sum, log) => sum + getFuelLiters(log),
      0
    );

    const totalFuelCost = fuelLogs.reduce(
      (sum, log) => sum + getFuelAmount(log),
      0
    );

    const totalFuelKm = fuelLogs.reduce(
      (sum, log) => sum + getFuelKm(log),
      0
    );

    const averageMileage = totalFuelLiters > 0 ? (totalFuelKm / totalFuelLiters).toFixed(1) : '0.0';

    const totalServiceCost = issues.reduce((sum, issue) => {
      return sum + Number(issue.serviceDetails?.amount || issue.serviceCost || 0);
    }, 0);

    return {
      totalTrucks: trucks.length,
      activeTrucks,
      liveBookings,
      pendingBookings,
      deliveredBookings,
      totalDrivers: drivers.length,
      totalRevenue,
      collectedRevenue,
      pendingPayments,
      tollTotal,
      alertCount: issues.length,
      utilization,
      totalFuelLiters,
      totalFuelCost,
      totalFuelKm,
      averageMileage,
      totalServiceCost,
    };
  }, [trucks, drivers, filteredBookings, tollLogs, issues, fuelLogs]);

  const stats = [
    {
      key: 'trucks',
      title: 'Total Trucks',
      value: overview.totalTrucks,
      icon: <Truck size={24} />,
      color: 'var(--primary-blue)',
      trend: `${overview.activeTrucks} active now`,
      details: trucks.map((t) => ({
        title: t.name || t.number || 'Truck',
        text: `${t.number || 'No Number'} • ${t.category || 'No Category'} • ${t.status || 'idle'}`,
      })),
    },

    {
      key: 'drivers',
      title: 'Total Drivers',
      value: overview.totalDrivers,
      icon: <Users size={24} />,
      color: 'var(--info)',
      trend: 'Driver records',
      details: drivers.map((d) => ({
        title: d.name || 'Driver',
        text: `${d.phone || 'No phone'} • ${d.driverId || 'No ID'} • ${d.status || 'available'}`,
      })),
    },

    {
      key: 'active',
      title: 'Active On Route',
      value: overview.activeTrucks,
      icon: <Truck size={24} />,
      color: 'var(--success)',
      trend: `${overview.utilization}% utilization`,
      details: filteredBookings
        .filter((b) => normalizeStatus(b.status) !== 'Delivered' && getTruckIdFromBooking(b))
        .map((b) => ({
          title: b.bookingId || 'Active Booking',
          text: `${b.customerName || 'Customer'} • ${b.pickup || 'Pickup'} → ${b.drop || 'Drop'}`,
        })),
    },

    {
      key: 'bookings',
      title: 'Live Bookings',
      value: overview.liveBookings,
      icon: <Package size={24} />,
      color: 'var(--warning)',
      trend: `${overview.pendingBookings} pending`,
      details: filteredBookings.map((b) => ({
        title: b.bookingId || 'Booking',
        text: `${normalizeStatus(b.status)} • ${b.customerName || 'Customer'} • ${formatMoney(getInvoiceTotal(b))}`,
      })),
    },
    {
      key: 'issues',

      title: 'Emergency Alerts',

      value: issues.filter(
        (i) => i.status !== 'Resolved'
      ).length,

      icon: <AlertTriangle size={24} />,

      color: 'var(--danger)',

      trend:
        issues.filter(
          (i) => i.status !== 'Resolved'
        ).length > 0
          ? 'Requires attention'
          : 'No active alerts',

      details: issues
        .filter(
          (i) => i.status !== 'Resolved'
        )
        .map((i) => ({
          title:
            i.issueType || 'Issue',

          text: `
${i.severity || 'Medium'} • 
${i.location || 'No location'} • 
${i.description || 'No description'}
      `,
        })),
    },

    {
      key: 'service-cost',

      title: 'Service Cost Total',

      value: formatMoney(
        issues
          .filter(
            (i) =>
              i.status === 'Resolved'
          )
          .reduce(
            (total, item) =>
              total +
              Number(
                item
                  ?.serviceDetails
                  ?.amount || 0
              ),
            0
          )
      ),

      icon: <AlertTriangle size={24} />,

      color: '#ef4444',

      trend: `${issues.filter(
        (i) =>
          i.status === 'Resolved'
      ).length
        } service records`,

      details: issues
        .filter(
          (i) =>
            i.status === 'Resolved'
        )
        .map((i) => ({
          title:
            i.issueType ||
            'Truck Service',

          text: `
Workshop: ${i?.serviceDetails
              ?.workshop ||
            'Unknown'
            } • 

Cost: ${formatMoney(
              i?.serviceDetails
                ?.amount || 0
            )} • 

Truck: ${i.truck?.number ||
            i.truck
              ?.truckNumber ||
            i.truckNumber ||
            'No Truck'
            } • 

Status: ${i.status ||
            'Resolved'
            }
      `,
        })),
    },

    {
      key: 'delivered',
      title: 'Delivered Trips',
      value: overview.deliveredBookings,
      icon: <CheckCircle size={24} />,
      color: 'var(--success)',
      trend: 'Completed bookings',
      details: filteredBookings
        .filter((b) => normalizeStatus(b.status) === 'Delivered')
        .map((b) => ({
          title: b.bookingId || 'Delivered Booking',
          text: `${b.customerName || 'Customer'} • ${b.pickup || 'Pickup'} → ${b.drop || 'Drop'}`,
        })),
    },

    {
      key: 'toll',
      title: 'Toll Amount',
      value: formatMoney(overview.tollTotal),
      icon: <CreditCard size={24} />,
      color: 'var(--accent-orange)',
      trend: `${tollLogs.length} toll records`,
      details: tollLogs.map((t) => ({
        title: t.tollgate || 'Tollgate',
        text: `₹${Number(t.amount || 0).toLocaleString('en-IN')} • ${t.place || 'No place'} • ${t.paymentMethod || 'FASTag'}`,
      })),
    },

    {
      key: 'revenue',
      title: 'Total Revenue',
      value: formatMoney(overview.totalRevenue),
      icon: <ArrowUpRight size={24} />,
      color: 'var(--dark-blue)',
      trend: `${filteredBookings.length} bookings found`,
      details: filteredBookings.map((b) => ({
        title: b.bookingId || 'Booking',
        text: `${b.customerName || 'Customer'} • ${formatMoney(getInvoiceTotal(b))} • ${normalizeStatus(b.status)}`,
      })),
    },

    {
      key: 'pending-payments',
      title: 'Pending Payments',
      value: formatMoney(overview.pendingPayments),
      icon: <CreditCard size={24} />,
      color: 'var(--danger)',
      trend: `${formatMoney(overview.collectedRevenue)} collected`,
      details: filteredBookings
        .filter((b) => Math.max(getInvoiceTotal(b) - getPaidAmount(b), 0) > 0)
        .map((b) => ({
          title: b.bookingId || 'Booking',
          text: `${b.customerName || 'Customer'} • Pending ${formatMoney(Math.max(getInvoiceTotal(b) - getPaidAmount(b), 0))} • ${normalizeStatus(b.status)}`,
        })),
    },

    {
      key: 'fuel',
      title: 'Fuel Consumption',
      value: `${Number(overview.totalFuelLiters || 0).toLocaleString('en-IN')} L`,
      icon: <CreditCard size={24} />,
      color: 'var(--accent-orange)',
      trend: `${formatMoney(overview.totalFuelCost)} fuel cost`,
      details: fuelLogs.map((fuel) => ({
        title: fuel.pumpName || fuel.fuelStation || 'Fuel Entry',
        text: `${getFuelLiters(fuel)} L • ${formatMoney(getFuelAmount(fuel))} • ${getFuelKm(fuel)} km • ${getFuelMileage(fuel).toFixed(1)} km/L`,
      })),
    },

    {
      key: 'mileage',
      title: 'Mileage Report',
      value: `${overview.averageMileage} km/L`,
      icon: <Truck size={24} />,
      color: 'var(--success)',
      trend: `${Number(overview.totalFuelKm || 0).toLocaleString('en-IN')} total km recorded`,
      details: fuelLogs.map((fuel) => ({
        title: fuel.truck?.number || fuel.truckNumber || fuel.vehicleNumber || fuel.pumpName || 'Fuel Mileage',
        text: `${getFuelKm(fuel)} km / ${getFuelLiters(fuel)} L = ${getFuelMileage(fuel).toFixed(1)} km/L`,
      })),
    },
  ];

  const revenueData = useMemo(() => {
    if (bookings.length === 0) return [{ name: 'No Data', revenue: 0 }];

    const months = {};
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt || Date.now());
      const month = date.toLocaleDateString('en-IN', { month: 'short' });
      months[month] = (months[month] || 0) + getBookingAmount(booking);
    });

    return Object.keys(months).map((month) => ({
      name: month,
      revenue: months[month],
    }));
  }, [bookings]);

  const dispatchData = useMemo(() => {
    const days = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    bookings.forEach((booking) => {
      const status = normalizeStatus(booking.status);
      if (status === 'Dispatched' || status === 'In Transit' || status === 'Delivered') {
        const day = new Date(booking.updatedAt || booking.createdAt || Date.now())
          .toLocaleDateString('en-IN', { weekday: 'short' });
        if (days[day] !== undefined) days[day] += 1;
      }
    });

    return Object.keys(days).map((day) => ({ name: day, trips: days[day] }));
  }, [bookings]);

  const quickActions = [
    { title: 'Create Booking', icon: <Package size={18} />, desc: 'Quickly create a new shipment', page: 'Create Booking' },
    { title: 'Smart Dispatch AI', icon: <Route size={18} />, desc: 'Auto assign best truck for booking', page: 'Smart Dispatch AI' },
    { title: 'Add Driver', icon: <UserPlus size={18} />, desc: 'Create driver login and profile', page: 'Add Driver' },
    { title: 'Add Truck', icon: <Truck size={18} />, desc: 'Register new truck details', page: 'Add Truck' },
  ];

  const recentActivity = bookings.length
    ? bookings.slice(0, 6).map((b) => ({
      title: `Booking ${normalizeStatus(b.status)}`,
      meta: `${b.bookingId || 'No ID'} • ${b.pickup || 'Pickup'} → ${b.drop || 'Drop'}`,
      time: b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'Recently',
    }))
    : [
      {
        title: 'No activity yet',
        meta: 'Production ready empty dashboard. Add trucks, drivers, and bookings to begin.',
        time: 'Now',
      },
    ];

  const searchResults = useMemo(() => {
    const search = (searchTerm || '').toLowerCase();

    if (!search) return null;

    const matchedDrivers = drivers.filter((driver) =>
      `${driver.name || ''} ${driver.phone || ''} ${driver.driverId || ''}`
        .toLowerCase()
        .includes(search)
    );

    const matchedTrucks = trucks.filter((truck) =>
      `${truck.name || ''} ${truck.number || ''} ${truck.category || ''}`
        .toLowerCase()
        .includes(search)
    );

    const matchedBookings = bookings.filter((booking) =>
      `${booking.bookingId || ''} 
     ${booking.customerName || ''} 
     ${booking.phone || ''} 
     ${booking.pickup || ''} 
     ${booking.drop || ''}`
        .toLowerCase()
        .includes(search)
    );

    return {
      drivers: matchedDrivers,
      trucks: matchedTrucks,
      bookings: matchedBookings,
    };
  }, [searchTerm, drivers, trucks, bookings]);

  return (
    <div className="owner-overview" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overview-hero" style={styles.heroCard}>
        <div className="overview-hero-main">
          <div className="overview-hero-badge" style={styles.heroBadge}>Executive Overview</div>
          <h2 className="overview-hero-title" style={styles.heroTitle}>Welcome Mr. Abinash</h2>
          <p className="overview-hero-text" style={styles.heroText}>
            Real-time visibility across bookings, trucks, drivers, tolls, revenue, and emergency operations.
          </p>

          <div className="overview-hero-meta-wrap" style={styles.heroMetaWrap}>
            <div className="overview-hero-meta" style={styles.heroMeta}>
              <CalendarDays size={16} />
              Today: {overview.liveBookings} Live Bookings
            </div>
            <div className="overview-hero-meta" style={styles.heroMeta}>
              <Clock3 size={16} />
              {overview.pendingBookings} Pending Deliveries
            </div>
            <div className="overview-hero-meta" style={styles.heroMeta}>
              <ShieldAlert size={16} />
              {overview.alertCount} Alert Needs Review
            </div>
            <button
              type="button"
              className="overview-refresh-btn"
              style={styles.refreshBtn}
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <div className="overview-last-updated" style={styles.lastUpdatedText}>
              Auto update: 2 min once
              {lastUpdated ? ` • Last: ${lastUpdated.toLocaleTimeString('en-IN')}` : ''}
            </div>
          </div>
        </div>

        <div className="overview-fleet-card" style={styles.heroSideCard}>
          <p style={styles.heroSideLabel}>Fleet Utilization</p>
          <h3 style={styles.heroSideValue}>{overview.utilization}%</h3>
          <p style={styles.heroSideSub}>{overview.activeTrucks} / {overview.totalTrucks} trucks active</p>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${overview.utilization}%` }}></div>
          </div>
        </div>
      </motion.div>

      {loading && <div className="card" style={styles.loadingCard}>Loading latest dashboard data...</div>}

      <div className="overview-stats-grid" style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <motion.button
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="glass-card"
            style={styles.statCard}
            onClick={() => setSelectedBox(stat)}
          >
            <div style={styles.statTop}>
              <div>
                <p style={styles.statTitle}>{stat.title}</p>
                <h3 style={styles.statValue}>{stat.value}</h3>
              </div>
              <div style={{ ...styles.statIcon, backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div style={styles.statTrend}>{stat.trend}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedBox && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card"
            style={styles.detailPanel}
          >
            <div style={styles.detailHeader}>
              <div>
                <h3 style={styles.detailTitle}>{selectedBox.title} Details</h3>
                <p style={styles.detailSub}>Clicked box related backend records</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedBox(null)}>
                <X size={20} />
              </button>
            </div>

            {selectedBox.details.length === 0 ? (
              <div style={styles.emptyBox}>No records found. Production data is empty.</div>
            ) : (
              <div style={styles.detailGrid}>
                {selectedBox.details.map((item, index) => (
                  <div key={index} style={styles.detailItem}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {searchTerm && searchResults && (
        <div className="card" style={styles.searchResultCard}>
          <h3 style={styles.chartTitle}>
            Search Results for "{searchTerm}"
          </h3>

          {/* DRIVER RESULTS */}
          {searchResults.drivers.length > 0 && (
            <>
              <h4 style={styles.resultHeading}>Drivers</h4>

              {searchResults.drivers.map((driver, index) => (
                <div key={index} style={styles.resultItem}>
                  <strong>{driver.name}</strong>

                  <p>Phone: {driver.phone}</p>
                  <p>Driver ID: {driver.driverId}</p>
                  <p>Status: {driver.status}</p>
                </div>
              ))}
            </>
          )}

          {/* TRUCK RESULTS */}
          {searchResults.trucks.length > 0 && (
            <>
              <h4 style={styles.resultHeading}>Trucks</h4>

              {searchResults.trucks.map((truck, index) => (
                <div key={index} style={styles.resultItem}>
                  <strong>{truck.name || truck.number}</strong>

                  <p>Truck No: {truck.number}</p>
                  <p>Category: {truck.category}</p>
                  <p>Status: {truck.status}</p>
                </div>
              ))}
            </>
          )}

          {/* BOOKING RESULTS */}
          {searchResults.bookings.length > 0 && (
            <>
              <h4 style={styles.resultHeading}>Bookings</h4>

              {searchResults.bookings.map((booking, index) => (
                <div key={index} style={styles.resultItem}>
                  <strong>{booking.bookingId}</strong>

                  <p>Customer: {booking.customerName}</p>
                  <p>Phone: {booking.phone}</p>
                  <p>
                    Route: {booking.pickup} → {booking.drop}
                  </p>

                  <p>Status: {booking.status}</p>
                </div>
              ))}
            </>
          )}

          {searchResults.drivers.length === 0 &&
            searchResults.trucks.length === 0 &&
            searchResults.bookings.length === 0 && (
              <p>No matching results found</p>
            )}
        </div>
      )}

      <div className="overview-quick-actions" style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={styles.quickActionCard}
            onClick={() => onNavigate && onNavigate(action.page)}
          >
            <div style={styles.quickActionIcon}>{action.icon}</div>
            <div>
              <h4 style={styles.quickActionTitle}>{action.title}</h4>
              <p style={styles.quickActionDesc}>{action.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="overview-charts" style={styles.chartsGrid}>
        <motion.div className="card" style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Revenue Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary-blue)" strokeWidth={3} fill="rgba(15,74,136,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card" style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Dispatch Summary</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dispatchData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="trips" fill="var(--accent-orange)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="card" style={styles.activityCard}>
        <h3 style={styles.chartTitle}>Recent Activity</h3>
        {recentActivity.map((item, index) => (
          <div key={index} style={styles.activityItem}>
            <div style={styles.activityDot}></div>
            <div style={{ flex: 1 }}>
              <p style={styles.activityTitle}>{item.title}</p>
              <p style={styles.activityMeta}>{item.meta}</p>
            </div>
            <span style={styles.activityTime}>{item.time}</span>
          </div>
        ))}
      </div>


      <style>{`
        @media (max-width: 640px) {
          .owner-overview {
            width: 100% !important;
            min-width: 0 !important;
            gap: 14px !important;
          }

          .overview-hero {
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            padding: 18px !important;
            border-radius: 20px !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            background: linear-gradient(145deg, #082b50 0%, #0d4278 58%, #155c9e 100%) !important;
            box-shadow: 0 14px 34px rgba(7, 39, 75, 0.18) !important;
          }

          .overview-hero-main {
            width: 100% !important;
            min-width: 0 !important;
          }

          .overview-hero-badge {
            margin: 0 0 9px !important;
            padding: 6px 10px !important;
            border-radius: 999px !important;
            font-size: 10px !important;
            line-height: 1 !important;
          }

          .overview-hero-title {
            margin: 0 !important;
            max-width: 100% !important;
            font-size: 25px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.55px !important;
          }

          .overview-hero-text {
            max-width: 100% !important;
            margin: 8px 0 0 !important;
            font-size: 11.5px !important;
            line-height: 1.5 !important;
            color: rgba(255, 255, 255, 0.84) !important;
          }

          .overview-hero-meta-wrap {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 7px !important;
            margin-top: 12px !important;
            align-items: stretch !important;
          }

          .overview-hero-meta {
            width: 100% !important;
            min-width: 0 !important;
            padding: 8px 9px !important;
            border-radius: 11px !important;
            gap: 6px !important;
            font-size: 9.5px !important;
            line-height: 1.28 !important;
            justify-content: flex-start !important;
          }

          .overview-hero-meta svg,
          .overview-refresh-btn svg {
            width: 13px !important;
            height: 13px !important;
            flex-shrink: 0 !important;
          }

          .overview-refresh-btn {
            width: 100% !important;
            min-height: 34px !important;
            padding: 7px 9px !important;
            border-radius: 11px !important;
            font-size: 9.5px !important;
            justify-content: center !important;
          }

          .overview-last-updated {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            padding: 1px 0 !important;
            font-size: 8.5px !important;
            line-height: 1.35 !important;
            text-align: left !important;
          }

          .overview-fleet-card {
            width: 100% !important;
            min-width: 0 !important;
            padding: 13px 14px !important;
            border-radius: 15px !important;
            box-sizing: border-box !important;
          }

          .overview-fleet-card p:first-child {
            font-size: 10px !important;
          }

          .overview-fleet-card h3 {
            margin: 3px 0 !important;
            font-size: 27px !important;
            line-height: 1 !important;
          }

          .overview-fleet-card p {
            font-size: 10px !important;
          }

          .overview-fleet-card > div {
            height: 7px !important;
            margin-top: 10px !important;
          }

          .overview-stats-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .overview-stats-grid > button {
            min-width: 0 !important;
            padding: 12px !important;
            border-radius: 15px !important;
            box-sizing: border-box !important;
          }

          .overview-stats-grid h3 {
            margin-top: 5px !important;
            font-size: 20px !important;
          }

          .overview-stats-grid p,
          .overview-stats-grid > button > div:last-child {
            font-size: 9.5px !important;
            line-height: 1.35 !important;
          }

          .overview-stats-grid > button > div:first-child > div:last-child {
            width: 36px !important;
            height: 36px !important;
            border-radius: 12px !important;
          }

          .overview-quick-actions {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .overview-quick-actions > button {
            min-width: 0 !important;
            padding: 11px !important;
            gap: 8px !important;
            border-radius: 15px !important;
          }

          .overview-quick-actions > button > div:first-child {
            width: 34px !important;
            height: 34px !important;
            border-radius: 11px !important;
          }

          .overview-quick-actions h4 {
            font-size: 11px !important;
            line-height: 1.2 !important;
          }

          .overview-quick-actions p {
            margin-top: 3px !important;
            font-size: 8.5px !important;
            line-height: 1.35 !important;
          }

          .overview-charts {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .overview-charts > div,
          .owner-overview > .card {
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
        }

        @media (max-width: 380px) {
          .overview-hero {
            padding: 16px !important;
          }

          .overview-hero-title {
            font-size: 23px !important;
          }

          .overview-stats-grid,
          .overview-quick-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  heroCard: {
    padding: '28px',
    borderRadius: '28px',
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.8fr',
    gap: '22px',
    background: 'linear-gradient(135deg, #0d2d52 0%, #123c6d 55%, #1f5da1 100%)',
    color: '#fff',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    fontWeight: '700',
    fontSize: '0.82rem',
    marginBottom: '14px',
  },
  heroTitle: { margin: 0, fontSize: '2rem', fontWeight: 800, color: '#fff' },
  heroText: { margin: '12px 0 0', color: 'rgba(255,255,255,0.86)', lineHeight: 1.7 },
  heroMetaWrap: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px', alignItems: 'center' },
  refreshBtn: {
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
  },
  lastUpdatedText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  heroMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.10)',
    fontWeight: 600,
    fontSize: '0.86rem',
  },
  heroSideCard: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '22px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  searchResultCard: {
    padding: '24px',
    borderRadius: '24px',
  },

  resultHeading: {
    marginTop: '20px',
    marginBottom: '10px',
    color: 'var(--dark-blue)',
  },

  resultItem: {
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid var(--border-light)',
    marginBottom: '12px',
    background: '#fff',
  },

  searchInput: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    width: '300px',
    outline: 'none',
    fontSize: '0.9rem',
  },

  heroSideLabel: { margin: 0, color: 'rgba(255,255,255,0.72)' },
  heroSideValue: { margin: '8px 0', fontSize: '2.4rem', fontWeight: 800, color: '#fff' },
  heroSideSub: { margin: 0, color: 'rgba(255,255,255,0.78)' },
  progressTrack: {
    marginTop: '18px',
    height: '10px',
    width: '100%',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #f97316, #facc15)',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  loadingCard: { padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '22px',
    borderRadius: '22px',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' },
  statTitle: { margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 },
  statValue: { margin: '8px 0 0', fontSize: '1.8rem', color: 'var(--dark-blue)', fontWeight: 800 },
  statIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTrend: { marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 },
  detailPanel: { padding: '24px', borderRadius: '24px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '18px' },
  detailTitle: { margin: 0, color: 'var(--dark-blue)', fontWeight: 800 },
  detailSub: { margin: '4px 0 0', color: 'var(--text-muted)' },
  closeBtn: {
    border: 'none',
    background: 'rgba(15,74,136,0.08)',
    color: 'var(--dark-blue)',
    width: '40px',
    height: '40px',
    borderRadius: '14px',
    cursor: 'pointer',
  },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' },
  detailItem: {
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(15,74,136,0.04)',
    border: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: 'var(--dark-blue)',
  },
  emptyBox: {
    padding: '20px',
    borderRadius: '16px',
    background: 'rgba(15,74,136,0.04)',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' },
  quickActionCard: {
    border: '1px solid var(--border-light)',
    background: '#fff',
    borderRadius: '20px',
    padding: '18px',
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
  quickActionIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(15, 74, 136, 0.08)',
    color: 'var(--primary-blue)',
    flexShrink: 0,
  },
  quickActionTitle: { margin: 0, color: 'var(--dark-blue)', fontWeight: 800 },
  quickActionDesc: { margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.86rem' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '22px' },
  chartCard: { padding: '24px', borderRadius: '24px', overflow: 'hidden' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '18px' },
  chartTitle: { margin: 0, color: 'var(--dark-blue)', fontWeight: 800 },
  activityCard: { padding: '24px', borderRadius: '24px' },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 0',
    borderBottom: '1px solid var(--border-light)',
  },
  activityDot: { width: '10px', height: '10px', borderRadius: '999px', background: 'var(--accent-orange)', flexShrink: 0 },
  activityTitle: { margin: 0, color: 'var(--dark-blue)', fontWeight: 700 },
  activityMeta: { margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' },
  activityTime: { color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' },
};

export default Overview;