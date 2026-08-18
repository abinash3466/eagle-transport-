import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTrucks, getDrivers } from '../../api/api';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { authHeader } from "../../utils/authHeader";
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  AlertCircle,
  Star,
  Truck,
  Users,
  Activity,
  CheckCircle2,
  Eye,
  UserPlus,
  Package,
  Search,
  Trash2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const TrucksAndDrivers = () => {
  const [activeView, setActiveView] = useState('drivers');
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [assignData, setAssignData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: "",
    item: null,
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const pendingRef = useRef(null);
  const fleetRef = useRef(null);
  const trucksRef = useRef(null);
  const driversRef = useRef(null);
  const totalFleetRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const truckImageMap = {
    container_truck: '/truck-fleet/container_truck.jpg',
    heavy_truck: '/truck-fleet/heavy_truck.jpg',
    light_commercial: '/truck-fleet/light_commercial.jpg',
    mini_truck: '/truck-fleet/mini_truck.jpg',
    pickup_truck: '/truck-fleet/pickup_truck.jpg',
    trailer_truck: '/truck-fleet/trailer_truck.jpg',
  };

  const getTruckImage = (truck) => {
    const truckType = (
      truck?.truckType ||
      truck?.category ||
      truck?.name ||
      ""
    ).toLowerCase();

    // Mini Truck
    if (
      truckType.includes("mini") ||
      truckType.includes("tata ace")
    ) {
      return "/truck-fleet/mini_truck.jpg";
    }

    // Pickup Truck
    if (
      truckType.includes("pickup")
    ) {
      return "/truck-fleet/pickup_truck.jpg";
    }

    // 32ft Container MXL / SXL
    if (
      truckType.includes("32 ft") ||
      truckType.includes("32ft")
    ) {
      return "/truck-fleet/32ft_container.jpg";
    }

    // 20ft / 22ft / 24ft Container
    if (
      truckType.includes("20ft") ||
      truckType.includes("22ft") ||
      truckType.includes("24ft") ||
      truckType.includes("container")
    ) {
      return "/truck-fleet/container_truck.jpg";
    }

    // 19ft Open Truck
    if (
      truckType.includes("19 ft") ||
      truckType.includes("19ft") ||
      truckType.includes("open truck")
    ) {
      return "/truck-fleet/open_truck.jpg";
    }

    // 10 Tyre Truck
    if (
      truckType.includes("10 tyre")
    ) {
      return "/truck-fleet/10_tyre_truck.jpg";
    }

    // 12 Tyre Truck
    if (
      truckType.includes("12 tyre")
    ) {
      return "/truck-fleet/12_tyre_truck.jpg";
    }

    // 14 Tyre Truck
    if (
      truckType.includes("14 tyre")
    ) {
      return "/truck-fleet/14_tyre_truck.jpg";
    }

    // 16 Tyre Truck
    if (
      truckType.includes("16 tyre")
    ) {
      return "/truck-fleet/16_tyre_truck.jpg";
    }

    // Trailer Truck
    if (
      truckType.includes("trailer")
    ) {
      return "/truck-fleet/trailer_truck.jpg";
    }

    // Default
    return "/truck-fleet/default_truck.jpg";
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [truckData, driverData, bookingRes] = await Promise.all([
        getTrucks(),
        getDrivers(),
        fetch(
          `${API_URL}/bookings`,
          {
            headers: authHeader(),
          }
        )
      ]);

      const bookingData = await bookingRes.json();

      const formattedTrucks = truckData.map((truck) => ({
        ...truck,
        id: truck._id,
        image: getTruckImage(truck),
        status:
          truck.status === 'idle'
            ? 'Idle'
            : truck.status === 'on-route'
              ? 'On Route'
              : truck.status || 'Idle',
        health: truck.health === 'good' ? 'Good' : truck.health || 'Good',
      }));

      const formattedDrivers = driverData.map((driver) => ({
        ...driver,
        id: driver._id,
        mobile: driver.phone || driver.mobile || 'No phone',
        assigned: driver.assignedTruck?.number || driver.assignedTruck || 'Not Assigned',
        route: driver.route || 'No active route',
        status: driver.status === 'available' ? 'Available' : driver.status || 'Available',
        rating: Number.isFinite(Number(driver.rating)) ? Number(driver.rating) : null,
        image: '/driver_avatar.png',
      }));

      setTrucks(Array.isArray(formattedTrucks) ? formattedTrucks : []);
      setDrivers(Array.isArray(formattedDrivers) ? formattedDrivers : []);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      console.error('Error loading trucks/drivers/bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTruckName = (truck) =>
    truck?.truckNumber ||
    truck?.vehicleNumber ||
    truck?.number ||
    truck?.name ||
    truck?.truckName ||
    'Truck';

  const getDriverName = (driver) =>
    driver?.driverName || driver?.name || driver?.fullName || 'Driver';

  const getDriverPhone = (driver) =>
    driver?.phone || driver?.mobile || driver?.mobileNumber || 'Not Available';

  const getTruckId = (truck) => {
    return truck?._id || truck?.id;
  };

  const getDriverId = (driver) => {
    return driver?._id || driver?.id;
  };

  const normalizeStatus = (status) => {
    const s = (status || '').toLowerCase();

    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('route') || s.includes('transit')) return 'In Transit';
    if (s.includes('dispatch') || s.includes('assign')) return 'Dispatched';
    return 'Booked';
  };

  const isTruckBusy = (truckId) => {
    return Boolean(getAssignedBookingForTruck(truckId));
  };

  const isDriverBusy = (driverId) => {
    return bookings.some(
      (booking) =>
        booking.driver?._id === driverId &&
        normalizeStatus(booking.status) !== 'Delivered'
    );
  };
  const getAssignedBookingForTruck = (truckId) => {
    if (!truckId) return null;

    return bookings.find((booking) => {
      const bookingTruckId =
        booking.truck?._id ||
        booking.truck?.id ||
        booking.truck ||
        booking.assignedTruck?._id ||
        booking.assignedTruck?.id ||
        booking.assignedTruck;

      if (!bookingTruckId) return false;

      return (
        String(bookingTruckId) === String(truckId) &&
        normalizeStatus(booking.status) !== 'Delivered'
      );
    });
  };

  const availableTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const assignedBooking = getAssignedBookingForTruck(truck._id || truck.id);

      if (!assignedBooking) return true;

      const status = normalizeStatus(assignedBooking.status);

      return status === "Delivered";
    });
  }, [trucks, bookings]);

  const availableDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const status = String(driver.status || '').toLowerCase();
      return !isDriverBusy(driver._id) && !status.includes('busy') && !status.includes('route');
    });
  }, [drivers, bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const hasTruck = booking.truck?._id || booking.truck;
      const hasDriver = booking.driver?._id || booking.driver;
      const status = normalizeStatus(booking.status);

      return (!hasTruck || !hasDriver) && status !== 'Delivered';
    });
  }, [bookings]);

  const filteredPendingBookings = useMemo(() => {
    if (!searchTerm.trim()) return pendingBookings;

    const q = searchTerm.toLowerCase();

    return pendingBookings.filter((booking) =>
      String(booking.bookingId || '').toLowerCase().includes(q) ||
      String(booking.customerName || '').toLowerCase().includes(q) ||
      String(booking.phone || '').includes(q)
    );
  }, [pendingBookings, searchTerm]);



  const getStatusBadge = (status) => {
    if (status === 'On Route') return 'success';
    if (status === 'Idle') return 'warning';
    return 'default';
  };

  const getDriverBadge = (status) => {
    if (status === 'Available') return 'success';
    return 'default';
  };

  const getHealthColor = (health) => {
    return health === 'Good' ? 'var(--success)' : 'var(--danger)';
  };

  const handleAssignChange = (bookingId, field, value) => {
    setAssignData((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
  };

  const handleAssignBooking = async (bookingId) => {
    const selected = assignData[bookingId];

    if (!selected?.truckId || !selected?.driverId) {
      alert('Please select truck and driver');
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selected),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Assign failed');
        return;
      }

      alert('Truck and Driver assigned successfully ✅');
      loadData();
    } catch (error) {
      console.error('Assign error:', error);
      alert('Server error while assigning');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      alert("Please confirm delete");
      return;
    }

    try {
      let endpoint = "";

      if (deleteModal.type === "truck") {
        endpoint = `${API_URL}/trucks/${deleteModal.item._id}`;
      }

      if (deleteModal.type === "driver") {
        endpoint = `${API_URL}/drivers/${deleteModal.item._id}`;
      }

      const res = await fetchWithAuth(endpoint, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed");
        return;
      }

      alert(`${deleteModal.type} deleted successfully ✅`);

      setDeleteModal({
        open: false,
        type: "",
        item: null,
      });

      setConfirmDelete(false);

      loadData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error while deleting");
    }
  };



  const renderTruckCard = (truck, showAssigned = false) => {
    const assignedBooking = getAssignedBookingForTruck(truck._id);
    const busy = Boolean(assignedBooking);

    return (
      <motion.div
        key={truck.id}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="card fleet-card"
        style={styles.truckCard}
      >
        <div className="td-truck-image-wrap" style={styles.truckImageWrap}>
          <img
            src={truck.image}
            alt={truck.name || getTruckName(truck)}
            style={styles.truckImage}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />

          <div style={styles.imageFallback}>
            <Truck size={46} />
            <span>Truck Image</span>
          </div>

          <div style={styles.imageOverlay}></div>

          <div style={styles.imageTopBar}>
            <span className={`badge badge-${busy ? 'info' : getStatusBadge(truck.status)}`}>
              {busy ? 'Assigned' : 'Available'}
            </span>

            <span className="td-health-badge" style={styles.healthBadge}>
              {truck.health === 'Good' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {truck.health}
            </span>
          </div>

          <div style={styles.imageBottomContent}>
            <h3 style={styles.truckTitle}>{truck.name || getTruckName(truck)}</h3>
            <span className="td-truck-number-badge" style={styles.truckNumber}>
              {truck.number || truck.vehicleNumber || truck.truckNumber || 'No Number'}
            </span>
          </div>
        </div>

        <div className="td-truck-body" style={styles.truckBody}>
          <div className="td-info-grid" style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>Category</p>
              <p style={styles.infoText}>{truck.category || truck.truckType || 'Truck'}</p>
            </div>

            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>Capacity</p>
              <p style={styles.infoText}>{truck.capacity || 'Not Added'}</p>
            </div>

            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>
                GPS Device
              </p>
            </div>

            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>Location</p>
              <p style={styles.infoText}>
                <MapPin size={14} style={styles.inlineIcon} /> {truck.location || 'Yard'}
              </p>
            </div>

            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>Booking Status</p>
              <p style={styles.infoText}>{busy ? assignedBooking.bookingId : 'Ready for Booking'}</p>
            </div>

            <div style={styles.infoItem}>
              <p className="text-muted" style={styles.infoLabel}>
                GPS Device
              </p>

              <p style={styles.infoText}>
                {truck.gpsDeviceNumber || 'Not Connected'}
              </p>
            </div>

            {showAssigned && assignedBooking && (
              <div style={styles.infoItemFull}>
                <p className="text-muted" style={styles.infoLabel}>Assigned Booking Details</p>
                <p style={styles.infoText}>
                  {assignedBooking.customerName} • {assignedBooking.pickup} → {assignedBooking.drop}
                </p>
              </div>
            )}

            {showAssigned && assignedBooking?.driver && (
              <div style={styles.infoItemFull}>
                <p className="text-muted" style={styles.infoLabel}>Operating Driver</p>
                <p style={styles.infoText}>
                  {getDriverName(assignedBooking.driver)} • {getDriverPhone(assignedBooking.driver)}
                </p>
              </div>
            )}

            <div style={styles.infoItemFull}>
              <p className="text-muted" style={styles.infoLabel}>Vehicle Health</p>
              <div style={styles.healthRow}>
                <span style={{ ...styles.healthText, color: getHealthColor(truck.health) }}>
                  {truck.health}
                </span>
                <div style={styles.healthBarTrack}>
                  <div
                    style={{
                      ...styles.healthBarFill,
                      width: truck.health === 'Good' ? '88%' : '42%',
                      backgroundColor: truck.health === 'Good' ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="td-truck-actions" style={styles.truckActions}>
            <button
              className="btn btn-outline td-view-details-btn"
              style={styles.actionBtn}
              onClick={() => setSelectedTruck(truck)}
            >
              <Eye size={17} />
              View Details
            </button>

            <button
              className="btn td-delete-btn"
              style={styles.deleteBtn}
              onClick={() => {
                setDeleteModal({
                  open: true,
                  type: "truck",
                  item: truck,
                });
              }}
            >
              <Trash2 size={15} />
              Delete
            </button>

          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="td-page-wrap" style={styles.pageWrap}>
      <div className="td-summary-grid" style={styles.summaryGrid}>
        <div
          className="glass-card td-summary-card"
          style={{ ...styles.summaryCard, cursor: 'pointer' }}
          onClick={() => scrollToSection(totalFleetRef)}
        >
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(15, 74, 136, 0.10)', color: 'var(--primary-blue)' }}>
            <Truck size={24} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Fleet</p>
            <h3 style={styles.summaryValue}>{trucks.length}</h3>
          </div>
        </div>

        <div
          className="glass-card td-summary-card"
          style={{ ...styles.summaryCard, cursor: 'pointer' }}
          onClick={() => {
            setActiveView('trucks');
            setTimeout(() => scrollToSection(trucksRef), 100);
          }}
        >
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.10)', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Available Trucks</p>
            <h3 style={styles.summaryValue}>{availableTrucks.length}</h3>
          </div>
        </div>

        <div
          className="glass-card td-summary-card"
          style={{ ...styles.summaryCard, cursor: 'pointer' }}
          onClick={() => {
            setActiveView('drivers');
            setTimeout(() => scrollToSection(driversRef), 100);
          }}
        >
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(245, 158, 11, 0.10)', color: 'var(--warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Available Drivers</p>
            <h3 style={styles.summaryValue}>{availableDrivers.length}</h3>
          </div>
        </div>

        <div
          className="glass-card td-summary-card"
          style={{ ...styles.summaryCard, cursor: 'pointer' }}
          onClick={() => scrollToSection(pendingRef)}
        >
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(239, 68, 68, 0.10)', color: 'var(--danger)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Pending Assignments</p>
            <h3 style={styles.summaryValue}>{pendingBookings.length}</h3>
          </div>
        </div>
      </div>

      <div ref={pendingRef} className="card td-section-card td-pending-card" style={styles.pendingCard}>
        <div className="td-section-top" style={styles.pendingTop}>
          <div>
            <h3 style={styles.sectionTitle}>Pending Booking Assignments</h3>
            <p style={styles.sectionSub}>
              New bookings will appear here. Select available truck and driver to assign.
            </p>
          </div>

          <div className="td-search-box" style={styles.searchBox}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search booking/customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading && <div style={styles.emptyBox}>Loading data...</div>}

        {!loading && filteredPendingBookings.length === 0 && (
          <div style={styles.emptyBox}>No pending booking assignment</div>
        )}

        {!loading && filteredPendingBookings.length > 0 && (
          <div className="td-booking-grid" style={styles.bookingGrid}>
            {filteredPendingBookings.map((booking) => (
              <motion.div
                key={booking._id}
                className="glass-card td-booking-card"
                style={styles.bookingCard}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={styles.bookingHeader}>
                  <div>
                    <h4 style={styles.bookingId}>{booking.bookingId}</h4>
                    <p style={styles.bookingMeta}>
                      {booking.customerName} • {booking.phone}
                    </p>
                  </div>
                  <span className="badge badge-warning">
                    {normalizeStatus(booking.status)}
                  </span>
                </div>

                <div className="td-booking-info-grid" style={styles.bookingInfoGrid}>
                  <div style={styles.bookingInfo}>
                    <p style={styles.infoLabel}>Route</p>
                    <p style={styles.infoText}>
                      {booking.pickup} → {booking.drop}
                    </p>
                  </div>

                  <div style={styles.bookingInfo}>
                    <p style={styles.infoLabel}>Goods</p>
                    <p style={styles.infoText}>{booking.goods || 'Goods'}</p>
                  </div>

                  <div style={styles.bookingInfo}>
                    <p style={styles.infoLabel}>Amount</p>
                    <p style={styles.infoText}>
                      ₹{Number(booking.payment?.totalWithGST || booking.amount || 0).toLocaleString('en-IN')}
                      {booking.payment?.gstAmount > 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 'normal' }}>
                          (Incl. ₹{booking.payment.gstAmount} GST)
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={styles.bookingInfo}>
                    <p style={styles.infoLabel}>Type</p>
                    <p style={styles.infoText}>{booking.bookingType || 'public'}</p>
                  </div>
                </div>

                <div className="td-assign-panel" style={styles.assignPanel}>
                  <select
                    style={styles.assignSelect}
                    value={assignData[booking._id]?.truckId || ''}
                    onChange={(e) =>
                      handleAssignChange(booking._id, 'truckId', e.target.value)
                    }
                  >
                    <option value="">Select Available Truck</option>
                    {availableTrucks.map((truck) => (
                      <option key={getTruckId(truck)} value={getTruckId(truck)}>
                        {getTruckName(truck)} - {truck.category || truck.truckType || 'Truck'}
                      </option>
                    ))}
                  </select>

                  <select
                    style={styles.assignSelect}
                    value={assignData[booking._id]?.driverId || ''}
                    onChange={(e) =>
                      handleAssignChange(booking._id, 'driverId', e.target.value)
                    }
                  >
                    <option value="">Select Available Driver</option>
                    {availableDrivers.map((driver) => (
                      <option key={getDriverId(driver)} value={getDriverId(driver)}>
                        {getDriverName(driver)} - {driver.phone || driver.mobile || 'No phone'}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-primary"
                    style={styles.assignBookingBtn}
                    onClick={() => handleAssignBooking(booking._id)}
                  >
                    <UserPlus size={16} />
                    Assign Booking
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div ref={totalFleetRef} className="card td-section-card td-fleet-section" style={styles.pendingCard}>
        <div className="td-section-top" style={styles.pendingTop}>
          <div>
            <h3 style={styles.sectionTitle}>Total Fleet Details</h3>
            <p style={styles.sectionSub}>
              All trucks with booking status and truck category images.
            </p>
          </div>
        </div>

        {loading && <div style={styles.emptyBox}>Loading fleet...</div>}

        {!loading && trucks.length === 0 && (
          <div style={styles.emptyBox}>No trucks added yet</div>
        )}

        {!loading && trucks.length > 0 && (
          <div
            className="trucks-grid-mobile"
            style={styles.trucksGrid}>
            {trucks.map((truck) => renderTruckCard(truck, true))}
          </div>
        )}
      </div>

      <div ref={fleetRef} className="td-tabs-wrap" style={styles.tabsWrap}>
        <button
          onClick={() => setActiveView('trucks')}
          style={{
            ...styles.tabBtn,
            ...(activeView === 'trucks' ? styles.activeTabBtn : {}),
          }}
        >
          <Truck size={18} />
          Available Truck Fleet ({availableTrucks.length})
        </button>

        <button
          onClick={() => setActiveView('drivers')}
          style={{
            ...styles.tabBtn,
            ...(activeView === 'drivers' ? styles.activeTabBtn : {}),
          }}
        >
          <Users size={18} />
          Available Drivers ({availableDrivers.length})
        </button>
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeView === 'trucks' ? (
          <div ref={trucksRef} className="td-trucks-grid" style={styles.trucksGrid}>
            {availableTrucks.length === 0 ? (
              <div style={styles.emptyBox}>No available trucks now</div>
            ) : (
              availableTrucks.map((truck) => renderTruckCard(truck, false))
            )}
          </div>
        ) : (
          <div ref={driversRef} className="td-drivers-list" style={styles.driversList}>
            {availableDrivers.length === 0 ? (
              <div style={styles.emptyBox}>No available drivers now</div>
            ) : (
              availableDrivers.map((driver) => (
                <motion.div
                  key={driver.id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="card driver-card"
                  style={styles.driverCard}
                >
                  <div className="td-driver-left" style={styles.driverLeft}>
                    <img
                      className="td-driver-image"
                      src={driver.image}
                      alt={driver.name || getDriverName(driver)}
                      style={styles.driverImage}
                    />
                    <div>
                      <h3 style={styles.driverName}>{driver.name || getDriverName(driver)}</h3>
                      <p style={styles.driverPhone}>
                        <Phone size={14} /> {driver.mobile}
                      </p>
                    </div>
                  </div>

                  <div className="td-driver-center" style={styles.driverCenter}>
                    <div style={styles.driverInfoBox}>
                      <p className="text-muted" style={styles.infoLabel}>Assigned Truck</p>
                      <p style={styles.infoText}>Not Assigned</p>
                    </div>

                    <div style={styles.driverInfoBox}>
                      <p className="text-muted" style={styles.infoLabel}>Current Route</p>
                      <p style={styles.infoText}>Ready for Trip</p>
                    </div>

                    <div style={styles.driverInfoBox}>
                      <p className="text-muted" style={styles.infoLabel}>Status</p>
                      <span className={`badge badge-${getDriverBadge(driver.status)}`}>
                        Available
                      </span>
                    </div>
                  </div>

                  <div className="td-driver-right" style={styles.driverRight}>
                    <div className="td-rating-box" style={styles.ratingBox}>
                      <Star fill="var(--warning)" color="var(--warning)" size={18} />
                      <span>{driver.rating ?? "Not Rated"}</span>

                      <button
                        className="btn"
                        style={styles.deleteBtn}
                        onClick={() => {
                          setDeleteModal({
                            open: true,
                            type: "driver",
                            item: driver,
                          });
                        }}
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
      {selectedTruck && (
        <div className="td-modal-overlay" style={styles.modalOverlay} onClick={() => setSelectedTruck(null)}>
          <div className="truck-details-modal-card" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className="truck-details-modal-header" style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Truck Booking Details</h2>
                <p style={styles.modalSub}>{getTruckName(selectedTruck)}</p>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setSelectedTruck(null)}
              >
                ✕
              </button>
            </div>

            {(() => {
              const assignedBooking = getAssignedBookingForTruck(selectedTruck._id);

              return (
                <>
                  <div style={styles.modalImageWrap}>
                    <img
                      className="truck-details-modal-image"
                      src={selectedTruck.image}
                      alt={getTruckName(selectedTruck)}
                      style={styles.modalImage}
                    />
                  </div>

                  <div className="truck-details-modal-grid" style={styles.modalGrid}>
                    <div style={styles.modalInfoBox}>
                      <p style={styles.infoLabel}>Truck Number</p>
                      <p style={styles.infoText}>
                        {selectedTruck.number ||
                          selectedTruck.vehicleNumber ||
                          selectedTruck.truckNumber ||
                          'No Number'}
                      </p>
                    </div>

                    <div style={styles.modalInfoBox}>
                      <p style={styles.infoLabel}>Truck Type</p>
                      <p style={styles.infoText}>
                        {selectedTruck.category || selectedTruck.truckType || 'Truck'}
                      </p>
                    </div>

                    <div style={styles.modalInfoBox}>
                      <p style={styles.infoLabel}>Capacity</p>
                      <p style={styles.infoText}>
                        {selectedTruck.capacity || 'Not Added'}
                      </p>
                    </div>

                    <div style={styles.modalInfoBox}>
                      <p style={styles.infoLabel}>Location</p>
                      <p style={styles.infoText}>
                        {selectedTruck.location || 'Yard'}
                      </p>
                    </div>
                  </div>

                  {assignedBooking ? (
                    <div style={styles.bookingDetailBox}>
                      <h3 style={styles.bookingDetailTitle}>Assigned Booking</h3>

                      <div className="truck-details-modal-grid" style={styles.modalGrid}>
                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Booking ID</p>
                          <p style={styles.infoText}>{assignedBooking.bookingId}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Tracking OTP</p>
                          <p style={styles.infoText}>{assignedBooking.otp}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Customer</p>
                          <p style={styles.infoText}>{assignedBooking.customerName}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Phone</p>
                          <p style={styles.infoText}>{assignedBooking.phone}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Pickup</p>
                          <p style={styles.infoText}>{assignedBooking.pickup}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Drop</p>
                          <p style={styles.infoText}>{assignedBooking.drop}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Goods</p>
                          <p style={styles.infoText}>{assignedBooking.goods}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Status</p>
                          <p style={styles.infoText}>{assignedBooking.status}</p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Driver Name</p>
                          <p style={styles.infoText}>
                            {getDriverName(assignedBooking.driver)}
                          </p>
                        </div>

                        <div style={styles.modalInfoBox}>
                          <p style={styles.infoLabel}>Driver Mobile</p>
                          <p style={styles.infoText}>
                            {getDriverPhone(assignedBooking.driver)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.noBookingBox}>
                      This truck is currently available. No booking assigned.
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div
          className="td-modal-overlay td-delete-overlay"
          style={styles.modalOverlay}
          onClick={() => {
            setDeleteModal({
              open: false,
              type: "",
              item: null,
            });

            setConfirmDelete(false);
          }}
        >
          <div
            className="td-delete-modal-card"
            style={styles.deleteModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="td-delete-title" style={styles.deleteTitle}>
              Confirm Delete
            </h2>

            <p className="td-delete-text" style={styles.deleteText}>
              You are deleting this {deleteModal.type}.
            </p>

            <div className="td-delete-info" style={styles.deleteInfoBox}>
              <p>
                <strong>Name:</strong>{" "}
                {deleteModal.type === "truck"
                  ? getTruckName(deleteModal.item)
                  : getDriverName(deleteModal.item)}
              </p>

              <p>
                <strong>ID:</strong>{" "}
                {deleteModal.item?._id}
              </p>
            </div>

            <label className="td-delete-check" style={styles.checkboxWrap}>
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) =>
                  setConfirmDelete(e.target.checked)
                }
              />

              I confirm delete permanently
            </label>

            <div className="td-delete-actions" style={styles.deleteActions}>
              <button
                className="btn"
                style={styles.cancelBtn}
                onClick={() => {
                  setDeleteModal({
                    open: false,
                    type: "",
                    item: null,
                  });

                  setConfirmDelete(false);
                }}
              >
                Cancel
              </button>

              <button
                className="btn"
                style={styles.finalDeleteBtn}
                onClick={handleDelete}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{responsiveCss}</style>
    </div>
  );
};

const styles = {
  pageWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },

  summaryCard: {
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderRadius: '20px',
    transition: 'all 0.25s ease',
  },

  summaryIconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryLabel: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.86rem',
    fontWeight: '600',
  },

  summaryValue: {
    margin: '4px 0 0 0',
    color: 'var(--dark-blue)',
    fontSize: '1.5rem',
    fontWeight: '800',
  },

  pendingCard: {
    padding: '22px',
    borderRadius: '24px',
    scrollMarginTop: '100px',
  },

  pendingTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },

  sectionTitle: {
    margin: '0 0 6px',
    color: 'var(--dark-blue)',
    fontWeight: 800,
  },

  sectionSub: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid var(--border-light)',
    padding: '9px 14px',
    borderRadius: '14px',
    background: '#fff',
    minWidth: '260px',
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    background: 'transparent',
  },

  emptyBox: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontWeight: 700,
    background: '#f8fbff',
    borderRadius: '16px',
    border: '1px solid #e8eef6',
  },

  bookingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
    gap: '16px',
  },

  bookingCard: {
    padding: '18px',
    borderRadius: '18px',
    background: '#fff',
  },

  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '14px',
  },

  bookingId: {
    margin: '0 0 5px',
    color: 'var(--dark-blue)',
    fontWeight: 800,
  },

  bookingMeta: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },

  bookingInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '14px',
  },

  bookingInfo: {
    padding: '12px',
    borderRadius: '14px',
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },

  assignPanel: {
    display: 'grid',
    gap: '9px',
  },

  assignSelect: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    outline: 'none',
    background: '#fff',
    color: 'var(--dark-blue)',
    fontWeight: '600',
  },

  assignBookingBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '12px',
    fontWeight: 800,
    padding: '11px 14px',
  },

  tabsWrap: {
    display: 'flex',
    gap: '12px',
    padding: '8px',
    background: '#f5f8fc',
    borderRadius: '18px',
    border: '1px solid var(--border-light)',
    flexWrap: 'wrap',
    scrollMarginTop: '100px',
  },

  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  activeTabBtn: {
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(15, 74, 136, 0.18)',
  },

  trucksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
    alignItems: "start",
  },

  truckCard: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    border: '1px solid rgba(15, 59, 115, 0.08)',
    boxShadow: '0 14px 30px rgba(15, 59, 115, 0.06)',
  },

  truckImageWrap: {
    height: '280px',
    width: '100%',
    position: 'relative',
    background: '#eef4fb',
    overflow: 'hidden',
  },

  truckImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
  },

  imageFallback: {
    position: 'absolute',
    inset: 0,
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '8px',
    color: 'var(--primary-blue)',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #dfeaf6 0%, #edf4fb 100%)',
  },

  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(6,17,31,0.08) 0%, rgba(6,17,31,0.18) 45%, rgba(6,17,31,0.78) 100%)',
  },

  imageTopBar: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    right: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    zIndex: 2,
  },

  healthBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.92)',
    color: 'var(--dark-blue)',
    fontWeight: '700',
    fontSize: '0.78rem',
  },

  imageBottomContent: {
    position: 'absolute',
    left: '18px',
    right: '18px',
    bottom: '18px',
    zIndex: 2,
  },

  truckTitle: {
    margin: '0 0 8px 0',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '800',
  },

  truckNumber: {
    display: 'inline-block',
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.92)',
    color: 'var(--dark-blue)',
    padding: '6px 10px',
    borderRadius: '10px',
    fontSize: '0.85rem',
  },

  truckBody: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    flex: 1,
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },

  infoItem: {
    padding: '14px',
    borderRadius: '16px',
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },

  infoItemFull: {
    gridColumn: '1 / -1',
    padding: '14px',
    borderRadius: '16px',
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },

  infoLabel: {
    margin: 0,
    fontSize: '0.8rem',
    marginBottom: '7px',
    color: 'var(--text-muted)',
  },

  infoText: {
    margin: 0,
    fontWeight: '700',
    color: 'var(--dark-blue)',
  },

  inlineIcon: {
    display: 'inline',
    color: 'var(--primary-blue)',
    verticalAlign: 'middle',
    marginBottom: '2px',
  },

  healthRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  healthText: {
    fontWeight: '800',
  },

  healthBarTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '999px',
    background: '#e4eaf3',
    overflow: 'hidden',
  },

  healthBarFill: {
    height: '100%',
    borderRadius: '999px',
  },

  truckActions: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
  },

  actionBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '14px',
    fontWeight: '700',
  },

  secondaryBtn: {
    width: '48px',
    minWidth: '48px',
    height: '46px',
    borderRadius: '14px',
    backgroundColor: '#f4f8fc',
    color: 'var(--dark-blue)',
    border: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  driversList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    scrollMarginTop: '100px',
  },

  driverCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    borderRadius: '22px',
    border: '1px solid rgba(15, 59, 115, 0.08)',
    boxShadow: '0 12px 24px rgba(15, 59, 115, 0.05)',
    flexWrap: 'wrap',
  },

  driverLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: '240px',
  },

  driverImage: {
    width: '82px',
    height: '82px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #eef4fa',
  },

  driverName: {
    margin: '0 0 6px 0',
    color: 'var(--dark-blue)',
    fontSize: '1.1rem',
    fontWeight: '800',
  },

  driverPhone: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  driverCenter: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '14px',
  },

  driverInfoBox: {
    padding: '14px',
    borderRadius: '16px',
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },

  driverRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-end',
    marginLeft: 'auto',
  },

  ratingBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '800',
    color: 'var(--dark-blue)',
    background: '#fff8e6',
    padding: '10px 12px',
    borderRadius: '12px',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 850,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },

  modalTitle: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontWeight: 900,
  },

  modalSub: {
    margin: '6px 0 0',
    color: 'var(--text-muted)',
    fontWeight: 700,
  },

  closeBtn: {
    border: 'none',
    background: '#f1f5f9',
    color: 'var(--dark-blue)',
    width: 40,
    height: 40,
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 900,
  },

  modalImageWrap: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    background: '#eef4fb',
  },

  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },

  modalInfoBox: {
    padding: 14,
    borderRadius: 16,
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },

  bookingDetailBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    background: '#fff7ed',
    border: '1px solid #fed7aa',
  },

  bookingDetailTitle: {
    margin: '0 0 14px',
    color: '#9a3412',
    fontWeight: 900,
  },

  noBookingBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    background: '#ecfdf5',
    color: '#047857',
    fontWeight: 800,
    textAlign: 'center',
  },

  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  deleteModalCard: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: 24,
  },

  deleteTitle: {
    margin: 0,
    marginBottom: 12,
    color: "#dc2626",
    fontWeight: 900,
  },

  deleteText: {
    color: "var(--text-muted)",
    marginBottom: 18,
  },

  deleteInfoBox: {
    padding: 14,
    borderRadius: 14,
    background: "#f8fafc",
    marginBottom: 18,
  },

  checkboxWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    marginBottom: 20,
  },

  deleteActions: {
    display: "flex",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    background: "#e2e8f0",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontWeight: 700,
  },

  finalDeleteBtn: {
    flex: 1,
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontWeight: 700,
  },
};

const responsiveCss = `
  /* =====================================================
     TRUCKS & DRIVERS - PREMIUM RESPONSIVE
     Desktop styles remain untouched.
  ===================================================== */

  @media (max-width: 900px) {
    .driver-card {
      align-items: flex-start !important;
    }
  }

  /* =====================================================
     LARGE / NORMAL MOBILE
  ===================================================== */
  @media (max-width: 768px) {

    .td-page-wrap {
      width: 100% !important;
      min-width: 0 !important;
      gap: 14px !important;
      overflow-x: hidden !important;
    }

    /* ---------- SUMMARY ---------- */
    .td-summary-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
    }

    .td-summary-card {
      min-width: 0 !important;
      padding: 12px 11px !important;
      gap: 9px !important;
      border-radius: 16px !important;
      background: linear-gradient(145deg, #ffffff 0%, #f7fbff 100%) !important;
      border: 1px solid #e3edf7 !important;
      box-shadow: 0 8px 22px rgba(10, 56, 102, 0.06) !important;
    }

    .td-summary-card > div:first-child {
      width: 38px !important;
      height: 38px !important;
      min-width: 38px !important;
      border-radius: 12px !important;
    }

    .td-summary-card > div:first-child svg {
      width: 18px !important;
      height: 18px !important;
    }

    .td-summary-card p {
      font-size: 9.5px !important;
      line-height: 1.25 !important;
    }

    .td-summary-card h3 {
      margin-top: 3px !important;
      font-size: 18px !important;
      line-height: 1 !important;
    }

    /* ---------- SECTION CARD ---------- */
    .td-section-card {
      width: 100% !important;
      min-width: 0 !important;
      padding: 13px !important;
      border-radius: 18px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      border: 1px solid #e5edf6 !important;
      box-shadow: 0 10px 26px rgba(10, 56, 102, 0.05) !important;
    }

    .td-section-top {
      gap: 8px !important;
      margin-bottom: 11px !important;
    }

    .td-section-top h3 {
      margin-bottom: 4px !important;
      font-size: 17px !important;
      line-height: 1.18 !important;
      letter-spacing: -0.2px !important;
    }

    .td-section-top p {
      font-size: 10.5px !important;
      line-height: 1.42 !important;
    }

    /* ---------- SEARCH ---------- */
    .td-search-box {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 40px !important;
      padding: 7px 10px !important;
      border-radius: 11px !important;
      background: #ffffff !important;
      border: 1px solid #dce7f2 !important;
    }

    .td-search-box input {
      font-size: 11.5px !important;
    }

    /* ---------- BOOKINGS ---------- */
    .td-booking-grid {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }

    .td-booking-card {
      padding: 12px !important;
      border-radius: 15px !important;
      border: 1px solid #e6eef7 !important;
      box-shadow: 0 7px 18px rgba(10, 56, 102, 0.04) !important;
    }

    .td-booking-card h4 {
      font-size: 13.5px !important;
    }

    .td-booking-card .badge {
      padding: 5px 7px !important;
      font-size: 8.5px !important;
    }

    .td-booking-info-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 7px !important;
      margin-bottom: 9px !important;
    }

    .td-booking-info-grid > div {
      min-width: 0 !important;
      padding: 8px !important;
      border-radius: 10px !important;
    }

    .td-booking-info-grid p:first-child {
      margin-bottom: 3px !important;
      font-size: 8.5px !important;
    }

    .td-booking-info-grid p:last-child {
      font-size: 10.5px !important;
      line-height: 1.32 !important;
      overflow-wrap: anywhere !important;
    }

    .td-assign-panel {
      gap: 7px !important;
    }

    .td-assign-panel select,
    .td-assign-panel button {
      min-height: 40px !important;
      padding: 7px 9px !important;
      border-radius: 10px !important;
      font-size: 10.5px !important;
    }

    /* ---------- TABS ---------- */
    .td-tabs-wrap {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
      padding: 5px !important;
      border-radius: 14px !important;
      background: #f3f7fb !important;
    }

    .td-tabs-wrap button {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 40px !important;
      padding: 7px 6px !important;
      gap: 5px !important;
      border-radius: 10px !important;
      font-size: 9.5px !important;
      line-height: 1.2 !important;
      justify-content: center !important;
      text-align: center !important;
    }

    .td-tabs-wrap button svg {
      width: 14px !important;
      height: 14px !important;
      flex-shrink: 0 !important;
    }

    /* ---------- TRUCK GRID ---------- */
    .trucks-grid-mobile,
    .td-trucks-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 11px !important;
    }

    .fleet-card {
      width: 100% !important;
      min-width: 0 !important;
      border-radius: 18px !important;
      border: 1px solid #e2ebf5 !important;
      box-shadow: 0 10px 24px rgba(10, 56, 102, 0.07) !important;
    }

    .td-truck-image-wrap {
      height: 180px !important;
    }

    .fleet-card [style*="imageTopBar"] {
      top: 10px !important;
      left: 10px !important;
      right: 10px !important;
    }

    .fleet-card [style*="imageBottomContent"] {
      left: 13px !important;
      right: 13px !important;
      bottom: 12px !important;
    }

    .fleet-card [style*="truckTitle"] {
      margin-bottom: 5px !important;
      font-size: 16.5px !important;
      line-height: 1.1 !important;
    }

    .td-truck-body {
      padding: 12px !important;
      gap: 12px !important;
    }

    .td-info-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 7px !important;
    }

    .td-info-grid > div {
      min-width: 0 !important;
      padding: 8px !important;
      border-radius: 10px !important;
      background: linear-gradient(145deg, #f9fbfe, #f4f8fc) !important;
    }

    .td-info-grid p {
      overflow-wrap: anywhere !important;
    }

    .td-info-grid .text-muted {
      margin-bottom: 3px !important;
      font-size: 8.5px !important;
    }

    .td-info-grid p:not(.text-muted),
    .td-info-grid span {
      font-size: 10.5px !important;
      line-height: 1.3 !important;
    }

    /* ---------- PREMIUM TRUCK ACTIONS ---------- */
    .td-truck-actions {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
      margin-top: 2px !important;
    }

    .td-truck-actions .btn {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 43px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      padding: 0 10px !important;
      border-radius: 11px !important;
      font-size: 10.5px !important;
      line-height: 1 !important;
      font-weight: 800 !important;
      white-space: nowrap !important;
      transition: transform .15s ease, box-shadow .15s ease, background .15s ease !important;
    }

    .td-view-details-btn {
      color: #0b4f8a !important;
      background: linear-gradient(145deg, #ffffff 0%, #edf5ff 100%) !important;
      border: 1px solid #cfe0f3 !important;
      box-shadow: 0 6px 15px rgba(11, 79, 138, 0.08) !important;
    }

    .td-delete-btn {
      color: #d83846 !important;
      background: linear-gradient(145deg, #fffafa 0%, #fff0f1 100%) !important;
      border: 1px solid #ffd7da !important;
      box-shadow: 0 6px 15px rgba(216, 56, 70, 0.07) !important;
    }

    .td-truck-actions .btn:active {
      transform: scale(.97) !important;
    }

    .td-truck-actions .btn svg {
      width: 14px !important;
      height: 14px !important;
    }

    /* ---------- DRIVERS ---------- */
    .td-drivers-list {
      gap: 9px !important;
    }

    .driver-card {
      width: 100% !important;
      min-width: 0 !important;
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 9px !important;
      padding: 12px !important;
      border-radius: 16px !important;
      border: 1px solid #e4edf6 !important;
      box-shadow: 0 8px 20px rgba(10, 56, 102, 0.05) !important;
    }

    .td-driver-left {
      width: 100% !important;
      min-width: 0 !important;
      gap: 9px !important;
    }

    .td-driver-image {
      width: 52px !important;
      height: 52px !important;
      border-width: 2px !important;
    }

    .td-driver-left h3 {
      margin-bottom: 3px !important;
      font-size: 13.5px !important;
    }

    .td-driver-left p {
      font-size: 9.5px !important;
    }

    .td-driver-center {
      width: 100% !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 6px !important;
    }

    .td-driver-center > div {
      min-width: 0 !important;
      padding: 7px !important;
      border-radius: 9px !important;
    }

    .td-driver-center p {
      font-size: 8.5px !important;
      line-height: 1.25 !important;
      overflow-wrap: anywhere !important;
    }

    .td-driver-right {
      width: 100% !important;
      margin-left: 0 !important;
      align-items: stretch !important;
    }

    .td-rating-box {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: auto 1fr auto !important;
      gap: 6px !important;
      padding: 7px 9px !important;
      border-radius: 10px !important;
      font-size: 9.5px !important;
    }

    .td-rating-box .btn {
      width: auto !important;
      padding: 6px 9px !important;
      border-radius: 8px !important;
      font-size: 9px !important;
    }

    /* =====================================================
       VIEW DETAILS MODAL - COMPACT + SMOOTH
    ===================================================== */
    .td-modal-overlay {
      padding: 12px !important;
      align-items: center !important;
      overflow: hidden !important;
      backdrop-filter: blur(5px) !important;
      -webkit-backdrop-filter: blur(5px) !important;
      animation: tdOverlayIn .16s ease-out both;
    }

    .truck-details-modal-card {
      width: min(100%, 390px) !important;
      max-width: 390px !important;
      max-height: calc(100dvh - 24px) !important;
      padding: 12px !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      scrollbar-width: none !important;
      -webkit-overflow-scrolling: touch !important;
      border-radius: 20px !important;
      box-sizing: border-box !important;
      box-shadow: 0 20px 55px rgba(10, 26, 46, 0.24) !important;
      animation: tdModalIn .18s cubic-bezier(.2,.8,.2,1) both;
      will-change: transform, opacity;
    }

    .truck-details-modal-card::-webkit-scrollbar {
      display: none !important;
    }

    .truck-details-modal-header {
      position: sticky !important;
      top: -12px !important;
      z-index: 3 !important;
      align-items: center !important;
      gap: 8px !important;
      margin-bottom: 9px !important;
      padding: 4px 0 7px !important;
      background: rgba(255,255,255,.96) !important;
      backdrop-filter: blur(10px) !important;
    }

    .truck-details-modal-header h2 {
      margin: 0 !important;
      font-size: 18px !important;
      line-height: 1.1 !important;
      letter-spacing: -.35px !important;
      white-space: nowrap !important;
    }

    .truck-details-modal-header p {
      margin-top: 3px !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
    }

    .truck-details-modal-header button {
      width: 34px !important;
      min-width: 34px !important;
      height: 34px !important;
      padding: 0 !important;
      border-radius: 10px !important;
    }

    .truck-details-modal-card > div:nth-child(2) {
      height: 132px !important;
      min-height: 132px !important;
      margin-bottom: 9px !important;
      border-radius: 13px !important;
    }

    .truck-details-modal-image {
      height: 100% !important;
      object-fit: cover !important;
    }

    .truck-details-modal-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
    }

    .truck-details-modal-grid > div {
      min-width: 0 !important;
      padding: 8px !important;
      border-radius: 10px !important;
    }

    .truck-details-modal-grid p:first-child {
      margin-bottom: 3px !important;
      font-size: 8px !important;
      line-height: 1.15 !important;
    }

    .truck-details-modal-grid p:last-child {
      font-size: 10px !important;
      line-height: 1.22 !important;
      overflow-wrap: anywhere !important;
    }

    /* =====================================================
       DELETE MODAL - COMPACT PREMIUM
    ===================================================== */
    .td-delete-modal-card {
      width: min(100%, 315px) !important;
      max-width: 315px !important;
      padding: 17px 15px !important;
      border-radius: 19px !important;
      box-sizing: border-box !important;
      background: linear-gradient(145deg, #ffffff 0%, #fbfdff 100%) !important;
      border: 1px solid rgba(255,255,255,.75) !important;
      box-shadow: 0 20px 55px rgba(15, 23, 42, 0.22) !important;
      animation: tdModalIn .18s cubic-bezier(.2,.8,.2,1) both;
      will-change: transform, opacity;
    }

    .td-delete-title {
      margin: 0 0 6px !important;
      font-size: 21px !important;
      line-height: 1.08 !important;
      text-align: center !important;
      letter-spacing: -.35px !important;
    }

    .td-delete-text {
      margin: 0 0 11px !important;
      font-size: 11px !important;
      line-height: 1.35 !important;
      text-align: center !important;
    }

    .td-delete-info {
      margin-bottom: 11px !important;
      padding: 10px 11px !important;
      border-radius: 12px !important;
      background: #f7f9fc !important;
      border: 1px solid #e6edf5 !important;
    }

    .td-delete-info p {
      margin: 3px 0 !important;
      font-size: 10px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    .td-delete-check {
      gap: 7px !important;
      margin-bottom: 12px !important;
      align-items: flex-start !important;
      font-size: 10.5px !important;
      line-height: 1.3 !important;
    }

    .td-delete-check input {
      width: 15px !important;
      height: 15px !important;
      margin-top: 0 !important;
      flex-shrink: 0 !important;
      accent-color: #dc2626 !important;
    }

    .td-delete-actions {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }

    .td-delete-actions button {
      min-height: 41px !important;
      padding: 0 9px !important;
      border-radius: 10px !important;
      font-size: 10.5px !important;
      line-height: 1.15 !important;
      font-weight: 800 !important;
      transition: transform .15s ease !important;
    }

    .td-delete-actions button:first-child {
      color: #173b62 !important;
      background: #edf3f8 !important;
    }

    .td-delete-actions button:last-child {
      color: #ffffff !important;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
      box-shadow: 0 7px 15px rgba(220,38,38,.16) !important;
    }

    .td-delete-actions button:active {
      transform: scale(.97) !important;
    }

    @keyframes tdOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes tdModalIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(.975);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  }

  /* =====================================================
     SMALL MOBILE
  ===================================================== */
  @media (max-width: 420px) {

    .td-page-wrap {
      gap: 11px !important;
    }

    .td-summary-grid {
      gap: 7px !important;
    }

    .td-summary-card {
      padding: 10px 9px !important;
      border-radius: 14px !important;
    }

    .td-summary-card > div:first-child {
      width: 34px !important;
      height: 34px !important;
      min-width: 34px !important;
      border-radius: 10px !important;
    }

    .td-summary-card p {
      font-size: 8.5px !important;
    }

    .td-summary-card h3 {
      font-size: 16px !important;
    }

    .td-section-card {
      padding: 11px !important;
      border-radius: 15px !important;
    }

    .td-section-top h3 {
      font-size: 15.5px !important;
    }

    .td-section-top p {
      font-size: 9.5px !important;
    }

    .td-tabs-wrap button {
      min-height: 38px !important;
      padding: 6px 4px !important;
      font-size: 8.5px !important;
    }

    .td-truck-image-wrap {
      height: 158px !important;
    }

    .td-truck-body {
      padding: 10px !important;
      gap: 10px !important;
    }

    .td-info-grid {
      gap: 6px !important;
    }

    .td-info-grid > div {
      padding: 7px !important;
      border-radius: 9px !important;
    }

    .td-info-grid .text-muted {
      font-size: 7.8px !important;
    }

    .td-info-grid p:not(.text-muted),
    .td-info-grid span {
      font-size: 9.5px !important;
    }

    .td-truck-actions {
      gap: 7px !important;
    }

    .td-truck-actions .btn {
      min-height: 41px !important;
      padding: 0 8px !important;
      border-radius: 10px !important;
      font-size: 9.5px !important;
    }

    .td-driver-center {
      grid-template-columns: 1fr 1fr !important;
    }

    .td-driver-center > div:last-child {
      grid-column: 1 / -1 !important;
    }

    .truck-details-modal-card {
      width: 100% !important;
      max-height: calc(100dvh - 18px) !important;
      padding: 10px !important;
      border-radius: 17px !important;
    }

    .truck-details-modal-header {
      top: -10px !important;
    }

    .truck-details-modal-header h2 {
      font-size: 16px !important;
    }

    .truck-details-modal-card > div:nth-child(2) {
      height: 118px !important;
      min-height: 118px !important;
      border-radius: 12px !important;
    }

    .truck-details-modal-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 5px !important;
    }

    .truck-details-modal-grid > div {
      padding: 7px !important;
      border-radius: 9px !important;
    }

    .truck-details-modal-grid p:first-child {
      font-size: 7.5px !important;
    }

    .truck-details-modal-grid p:last-child {
      font-size: 9px !important;
    }

    .td-delete-modal-card {
      max-width: 292px !important;
      padding: 15px 13px !important;
      border-radius: 17px !important;
    }

    .td-delete-title {
      font-size: 19px !important;
    }

    .td-delete-text {
      font-size: 10px !important;
    }

    .td-delete-info p,
    .td-delete-check,
    .td-delete-actions button {
      font-size: 9.5px !important;
    }

    .td-delete-actions button {
      min-height: 39px !important;
    }
  }

  /* =========================================================
     DARK MODE - TRUCK IMAGE BADGES
     Fixes the last white patches on mobile/desktop.
  ========================================================= */

  body[data-theme="dark"] .td-health-badge {
    background:
      rgba(7, 27, 46, 0.88) !important;

    color:
      #dff7ee !important;

    border:
      1px solid rgba(92, 212, 168, 0.20) !important;

    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.24) !important;

    backdrop-filter:
      blur(10px) !important;

    -webkit-backdrop-filter:
      blur(10px) !important;
  }


  body[data-theme="dark"] .td-health-badge svg {
    color:
      #22d3a0 !important;

    stroke:
      #22d3a0 !important;
  }


  body[data-theme="dark"] .td-truck-number-badge {
    background:
      rgba(7, 27, 46, 0.90) !important;

    color:
      #eef6ff !important;

    border:
      1px solid rgba(126, 178, 228, 0.18) !important;

    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.25) !important;

    backdrop-filter:
      blur(10px) !important;

    -webkit-backdrop-filter:
      blur(10px) !important;
  }


  /* Mobile compact polish */

  @media (max-width: 768px) {

    body[data-theme="dark"] .td-health-badge {
      padding:
        6px 9px !important;

      font-size:
        10px !important;
    }


    body[data-theme="dark"] .td-truck-number-badge {
      padding:
        6px 9px !important;

      font-size:
        10px !important;

      border-radius:
        10px !important;
    }

  }

`



export default TrucksAndDrivers;