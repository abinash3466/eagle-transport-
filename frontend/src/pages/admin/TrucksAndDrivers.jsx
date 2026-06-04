import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTrucks, getDrivers } from '../../api/api';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { authHeader } from "../../utils/authHeader";
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Settings,
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
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const TrucksAndDrivers = () => {
  const [activeView, setActiveView] = useState('trucks');
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
        rating: driver.rating || 4.5,
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
        <div style={styles.truckImageWrap}>
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

            <span style={styles.healthBadge}>
              {truck.health === 'Good' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {truck.health}
            </span>
          </div>

          <div style={styles.imageBottomContent}>
            <h3 style={styles.truckTitle}>{truck.name || getTruckName(truck)}</h3>
            <span style={styles.truckNumber}>
              {truck.number || truck.vehicleNumber || truck.truckNumber || 'No Number'}
            </span>
          </div>
        </div>

        <div style={styles.truckBody}>
          <div style={styles.infoGrid}>
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

          <div style={styles.truckActions}>
            <button
                className="btn btn-outline"
                style={styles.actionBtn}
                onClick={() => setSelectedTruck(truck)}
      >
                <Eye size={17} />
                    View Details
                </button>

            <button className="btn" style={styles.secondaryBtn}>
              <Settings size={18} />
            </button>

            <button
              className="btn"
              style={styles.deleteBtn}
              onClick={() => {
                setDeleteModal({
                  open: true,
                  type: "truck",
                  item: truck,
                });
              }}
            >
              Delete
            </button>

          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={styles.pageWrap}>
      <div style={styles.summaryGrid}>
        <div
          className="glass-card"
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
          className="glass-card"
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
          className="glass-card"
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
          className="glass-card"
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

      <div ref={pendingRef} className="card" style={styles.pendingCard}>
        <div style={styles.pendingTop}>
          <div>
            <h3 style={styles.sectionTitle}>Pending Booking Assignments</h3>
            <p style={styles.sectionSub}>
              New bookings will appear here. Select available truck and driver to assign.
            </p>
          </div>

          <div style={styles.searchBox}>
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
          <div style={styles.bookingGrid}>
            {filteredPendingBookings.map((booking) => (
              <motion.div
                key={booking._id}
                className="glass-card"
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

                <div style={styles.bookingInfoGrid}>
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
                      ₹{Number(booking.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div style={styles.bookingInfo}>
                    <p style={styles.infoLabel}>Type</p>
                    <p style={styles.infoText}>{booking.bookingType || 'public'}</p>
                  </div>
                </div>

                <div style={styles.assignPanel}>
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

      <div ref={totalFleetRef} className="card" style={styles.pendingCard}>
        <div style={styles.pendingTop}>
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
          <div style={styles.trucksGrid}>
            {trucks.map((truck) => renderTruckCard(truck, true))}
          </div>
        )}
      </div>

      <div ref={fleetRef} style={styles.tabsWrap}>
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
          <div ref={trucksRef} style={styles.trucksGrid}>
            {availableTrucks.length === 0 ? (
              <div style={styles.emptyBox}>No available trucks now</div>
            ) : (
              availableTrucks.map((truck) => renderTruckCard(truck, false))
            )}
          </div>
        ) : (
          <div ref={driversRef} style={styles.driversList}>
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
                  <div style={styles.driverLeft}>
                    <img
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

                  <div style={styles.driverCenter}>
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

                  <div style={styles.driverRight}>
                    <div style={styles.ratingBox}>
                      <Star fill="var(--warning)" color="var(--warning)" size={18} />
                      <span>{driver.rating}</span>

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
        <div style={styles.modalOverlay} onClick={() => setSelectedTruck(null)}>
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
            style={styles.deleteModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.deleteTitle}>
              Confirm Delete
            </h2>

            <p style={styles.deleteText}>
              You are deleting this {deleteModal.type}.
            </p>

            <div style={styles.deleteInfoBox}>
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

            <label style={styles.checkboxWrap}>
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) =>
                  setConfirmDelete(e.target.checked)
                }
              />

              I confirm delete permanently
            </label>

            <div style={styles.deleteActions}>
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    scrollMarginTop: '100px',
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
  @media (max-width: 900px) {
    .driver-card {
      align-items: flex-start !important;
    }
  }

  @media (max-width: 768px) {
    .fleet-card .btn,
    .driver-card .btn {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 640px) {
    .fleet-card,
    .driver-card {
      border-radius: 18px !important;
    }
  }
      @media (max-width: 768px) {
    div[style*="modalOverlay"] {
      align-items: flex-start !important;
      padding: 12px !important;
      overflow-y: auto !important;
    }
  }

  @media (max-width: 640px) {
    .truck-details-modal-card {
      max-height: 92vh !important;
      border-radius: 18px !important;
      padding: 16px !important;
    }

    .truck-details-modal-image {
      height: 180px !important;
    }

    .truck-details-modal-grid {
      grid-template-columns: 1fr !important;
    }

    .truck-details-modal-header {
      align-items: flex-start !important;
    }
  }
`;


export default TrucksAndDrivers;