import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  Search,
  Filter,
  MapPin,
  Truck,
  Phone,
  Package,
  CircleDollarSign,
} from 'lucide-react';

const authHeader = () => {

  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

};

const API_URL = 'http://localhost:5000/api';

const LiveBookings = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignData, setAssignData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [locationData, setLocationData] = useState({});
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'Live', 'Pending', 'Delivered'];
  const statusOptions = ['Booked', 'Dispatched', 'In Transit', 'Delivered'];

  const openBookingReport = (booking) => {
  const bookingMongoId = booking?._id || booking?.id;

  if (!bookingMongoId) {
    alert('Booking ID not found');
    return;
  }

  window.open(`${API_URL}/bookings/${bookingMongoId}/invoice`, '_blank');
};

  const fetchData = async () => {
    try {
      setLoading(true);

      const [bookingRes, truckRes, driverRes] = await Promise.all([
        fetch(
          `${API_URL}/bookings`,
          {
            headers: authHeader(),
          }
        ),
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
        )
      ]);

      const bookingData = await bookingRes.json();
      const truckData = await truckRes.json();
      const driverData = await driverRes.json();

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setTrucks(Array.isArray(truckData) ? truckData : []);
      setDrivers(Array.isArray(driverData) ? driverData : []);
    } catch (error) {
      console.error('Live bookings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchData();

  const interval = setInterval(() => {
    fetchData();
  }, 120000);

  return () => clearInterval(interval);
}, []);

  const getBookingId = (booking) => booking.bookingId || booking.id || booking._id;
  const getCustomer = (booking) => booking.customerName || booking.customer || 'Unknown Customer';
  const getMobile = (booking) => booking.phone || booking.mobile || 'N/A';
  const getPickup = (booking) => booking.pickup || booking.pickupLocation || 'N/A';
  const getDrop = (booking) => booking.drop || booking.dropLocation || 'N/A';
  const getGoods = (booking) => booking.goods || booking.goodsType || 'Goods';
  const getAmount = (booking) => booking.amount ? `₹${Number(booking.amount).toLocaleString('en-IN')}` : 'Not Added';

  const getDriverName = (driver) =>
    driver?.driverName || driver?.name || driver?.fullName || 'Driver';

  const getTruckName = (truck) =>
  truck?.name ||
  truck?.truckName ||
  truck?.number ||
  truck?.truckNumber ||
  truck?.vehicleNumber ||
  'Unassigned';

const getTruckText = (booking) => {
  const truck = booking.truck || booking.assignedTruck;

  if (!truck) return 'Unassigned';

  const name =
    truck.name ||
    truck.truckName ||
    truck.number ||
    truck.truckNumber ||
    truck.vehicleNumber ||
    'Truck';

  const type =
    truck.category ||
    truck.truckType ||
    truck.type ||
    '';

  return type ? `${name} • ${type}` : name;
};

const getDriverText = (booking) => {
  const driver = booking.driver || booking.assignedDriver;

  if (!driver) return 'Unassigned';

  const name = driver.driverName || driver.name || driver.fullName || 'Driver';
  const phone = driver.phone || driver.mobile || driver.mobileNumber || 'No phone';

  return `${name} • ${phone}`;
};

const isBookingAssigned = (booking) => {
  const hasTruck = Boolean(
    booking.truck?._id ||
    booking.truck?.id ||
    booking.truck ||
    booking.assignedTruck?._id ||
    booking.assignedTruck?.id ||
    booking.assignedTruck
  );

  const hasDriver = Boolean(
    booking.driver?._id ||
    booking.driver?.id ||
    booking.driver ||
    booking.assignedDriver?._id ||
    booking.assignedDriver?.id ||
    booking.assignedDriver
  );

  return hasTruck && hasDriver;
};

  const normalizeStatus = (status) => {
    const s = (status || '').toLowerCase();

    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('route') || s.includes('transit')) return 'In Transit';
    if (s.includes('dispatch') || s.includes('assign')) return 'Dispatched';
    if (s.includes('pending') || s.includes('book')) return 'Booked';

    return status || 'Booked';
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (activeTab === 'Live') {
      result = result.filter((item) => {
        const status = normalizeStatus(item.status);
        return status === 'Dispatched' || status === 'In Transit';
      });
    } else if (activeTab === 'Pending') {
      result = result.filter((item) => normalizeStatus(item.status) === 'Booked');
    } else if (activeTab === 'Delivered') {
      result = result.filter((item) => normalizeStatus(item.status) === 'Delivered');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      result = result.filter((item) =>
        String(getBookingId(item)).toLowerCase().includes(q) ||
        getCustomer(item).toLowerCase().includes(q) ||
        String(getMobile(item)).includes(q)
      );
    }

    return result;
  }, [activeTab, searchTerm, bookings]);

  const summary = {
    total: bookings.length,
    live: bookings.filter((b) => {
      const status = normalizeStatus(b.status);
      return status === 'Dispatched' || status === 'In Transit';
    }).length,
    pending: bookings.filter((b) => normalizeStatus(b.status) === 'Booked').length,
    delivered: bookings.filter((b) => normalizeStatus(b.status) === 'Delivered').length,
  };
  const liveMapBookings = useMemo(() => {
  return bookings.filter((booking) => {
    const status = normalizeStatus(booking.status);
    return status === 'Dispatched' || status === 'In Transit';
  });
}, [bookings]);

  const getStatusClass = (status) => {
    const s = normalizeStatus(status);

    if (s === 'In Transit' || s === 'Dispatched') return 'info';
    if (s === 'Delivered') return 'success';
    return 'warning';
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

  const handlePaymentChange = (id, field, value) => {
  setPaymentData((prev) => {
    const booking = bookings.find((b) => b._id === id);
    const total = Number(booking?.amount || 0);

    const oldAdvance = Number(booking?.payment?.advanceAmount || 0);
    const existing = prev[id] || {};

    const updated = {
      ...existing,
      [field]: value,
    };

    const advanceAmount = Number(updated.advanceAmount ?? oldAdvance);
    const balanceReceived = Number(updated.balanceReceived || 0);

    let totalPaid = advanceAmount + balanceReceived;
    if (totalPaid > total) totalPaid = total;

    const balanceAmount = Math.max(total - totalPaid, 0);

    updated.balanceAmount = balanceAmount;
    updated.totalPaid = totalPaid;

    if (totalPaid <= 0) {
      updated.paymentStatus = "Pending";
    } else if (totalPaid < total) {
      updated.paymentStatus = "Partial";
    } else {
      updated.paymentStatus = "Paid";
    }

    return {
      ...prev,
      [id]: updated,
    };
  });
};

  const handleAssign = async (bookingMongoId) => {
    const selected = assignData[bookingMongoId];

    if (!selected?.truckId || !selected?.driverId) {
      alert('Please select truck and driver');
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Assign failed');
        return;
      }

      alert('Truck and Driver assigned successfully');
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      alert('Server error while assigning');
    }
  };

  const handleStatusUpdate = async (bookingMongoId, status) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: `Owner updated status to ${status}`,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Status update failed');
        return;
      }

      alert(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      alert('Server error while updating status');
    }
  };

const handlePaymentUpdate = async (bookingMongoId) => {
  const booking = bookings.find((item) => item._id === bookingMongoId);
  const selected = paymentData[bookingMongoId] || {};

  const totalAmount = Number(booking?.amount || 0);
  const oldAdvance = Number(booking?.payment?.advanceAmount || 0);

  const advanceAmount = Number(selected.advanceAmount ?? oldAdvance);
  const balanceReceived = Number(selected.balanceReceived || 0);

  let totalPaid = advanceAmount + balanceReceived;
  if (totalPaid > totalAmount) totalPaid = totalAmount;

  const balanceAmount = Math.max(totalAmount - totalPaid, 0);

  let paymentStatus = "Pending";
  if (totalPaid <= 0) paymentStatus = "Pending";
  else if (totalPaid < totalAmount) paymentStatus = "Partial";
  else paymentStatus = "Paid";

  try {
    const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/payment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMode: selected.paymentMode || booking?.payment?.paymentMode || "Cash",
        advanceAmount: totalPaid,
        balanceAmount,
        paymentStatus,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Payment update failed");
      return;
    }

    alert("Payment updated successfully");
    fetchData();
  } catch (error) {
    console.error("Payment update error:", error);
    alert("Server error while updating payment");
  }
};

  const handleLocationUpdate = async (bookingMongoId) => {
    const currentLocation = locationData[bookingMongoId];

    if (!currentLocation) {
      alert('Please enter current location');
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLocation }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Location update failed');
        return;
      }

      alert('Location updated successfully');
      fetchData();
    } catch (error) {
      console.error('Location update error:', error);
      alert('Server error while updating location');
    }
  };

  const renderActionPanel = (booking) => (
  <div style={styles.actionPanel}>
    {!isBookingAssigned(booking) && (
      <div>
        <p style={styles.actionTitle}>Assign Truck & Driver</p>

        <select
          style={styles.assignSelect}
          value={assignData[booking._id]?.truckId || ''}
          onChange={(e) => handleAssignChange(booking._id, 'truckId', e.target.value)}
        >
          <option value="">Select Truck</option>
          {trucks.map((truck) => (
            <option key={truck._id} value={truck._id}>
              {getTruckName(truck)} {truck.category ? `- ${truck.category}` : ''}
            </option>
          ))}
        </select>

        <select
          style={styles.assignSelect}
          value={assignData[booking._id]?.driverId || ''}
          onChange={(e) => handleAssignChange(booking._id, 'driverId', e.target.value)}
        >
          <option value="">Select Driver</option>
          {drivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {getDriverName(driver)} {driver.phone ? `- ${driver.phone}` : ''}
            </option>
          ))}
        </select>

        <button style={styles.assignBtn} onClick={() => handleAssign(booking._id)}>
          Assign
        </button>
      </div>
    )}

    <div>
      <p style={styles.actionTitle}>Update Status</p>
      <div style={styles.statusBtnWrap}>
        {statusOptions.map((status) => (
          <button
            key={status}
            style={{
              ...styles.statusBtn,
              ...(normalizeStatus(booking.status) === status ? styles.statusBtnActive : {}),
            }}
            onClick={() => handleStatusUpdate(booking._id, status)}
          >
            {status}
          </button>
        ))}
      </div>
    </div>

    <div>
      <p style={styles.actionTitle}>Payment Details</p>

      <select
        style={styles.assignSelect}
        value={paymentData[booking._id]?.paymentMode || booking.payment?.paymentMode || 'Cash'}
        onChange={(e) => handlePaymentChange(booking._id, 'paymentMode', e.target.value)}
      >
        <option>Cash</option>
        <option>UPI</option>
        <option>Bank Transfer</option>
        <option>Credit</option>
      </select>

      <input
        style={styles.assignSelect}
        type="number"
        placeholder="Advance Amount"
        value={paymentData[booking._id]?.advanceAmount ?? booking.payment?.advanceAmount ?? ''}
        onChange={(e) => handlePaymentChange(booking._id, 'advanceAmount', e.target.value)}
      />
      <input
        style={styles.assignSelect}
        type="number"
        placeholder="Balance Payment Received"
        value={paymentData[booking._id]?.balanceReceived || ""}
        onChange={(e) =>
        handlePaymentChange(booking._id, "balanceReceived", e.target.value)
        }
      />
      <input
        style={styles.assignSelect}
          type="number"
          placeholder="Balance Amount"
          value={paymentData[booking._id]?.balanceAmount ?? booking.payment?.balanceAmount ?? 0}
          disabled
      />

      <select
        style={styles.assignSelect}
        value={paymentData[booking._id]?.paymentStatus || booking.payment?.paymentStatus || 'Pending'}
        onChange={(e) => handlePaymentChange(booking._id, 'paymentStatus', e.target.value)}
      >
        <option>Pending</option>
        <option>Partial</option>
        <option>Paid</option>
      </select>

      <button style={styles.paymentBtn} onClick={() => handlePaymentUpdate(booking._id)}>
        Update Payment
      </button>
    </div>

    <div>
      <p style={styles.actionTitle}>Current Location</p>

      <input
        style={styles.assignSelect}
        placeholder="Eg: Madurai Bypass"
        value={locationData[booking._id] ?? booking.currentLocation ?? ''}
        onChange={(e) =>
          setLocationData((prev) => ({
            ...prev,
            [booking._id]: e.target.value,
          }))
        }
      />

      <button style={styles.locationBtn} onClick={() => handleLocationUpdate(booking._id)}>
        Update Location
      </button>
    </div>

    <div>
      <p style={styles.actionTitle}>Status History</p>

      <div style={styles.historyBox}>
        {(booking.statusHistory || []).length === 0 ? (
          <p style={styles.subText}>No history yet</p>
        ) : (
          booking.statusHistory.map((item, index) => (
            <div key={index} style={styles.historyItem}>
              <strong>{item.status}</strong>
              <span>{item.note || '-'}</span>
              <small>
                {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'No date'}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 🔥 TOP HEADER */}
    <div style={styles.headerRow}>
      <div>
        <h1 style={styles.pageTitle}>Live Bookings</h1>
        <p style={styles.pageSub}>
          Manage and monitor Eagle Transport operations from this section.
        </p>
      </div>

      <button style={styles.topRefreshBtn} onClick={fetchData}>
        🔄 Refresh
      </button>
    </div>
      <div className="card" style={styles.liveMapCard}>
  <div style={styles.liveMapHeader}>
    <div>
      <h3 style={styles.liveMapTitle}>Live Fleet Tracking Map</h3>
      <p style={styles.liveMapSub}>
        Auto-refresh every 2 minuts • Current location, pickup and drop route overview
      </p>
    </div>

    <span className="badge badge-info">
      {liveMapBookings.length} Live
    </span>
  </div>

  {liveMapBookings.length === 0 ? (
    <div style={styles.liveMapEmpty}>
      No live trucks currently on route
    </div>
  ) : (
    <div style={styles.liveMapGrid}>
  {liveMapBookings.map((booking) => {
    const currentLocationText =
      booking?.liveLocation?.lat && booking?.liveLocation?.lng
        ? `${booking.liveLocation.lat}, ${booking.liveLocation.lng}`
        : booking?.currentLocation || booking?.pickup || 'India';

    const mapQuery = encodeURIComponent(currentLocationText);

    return (
      <div key={booking._id || booking.bookingId} style={styles.liveMapItem}>
        
        {/* MAP */}
        <div style={styles.mapBox}>
          <iframe
            title={`map-${booking._id}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`}
          />
        </div>

        {/* ROUTE PANEL */}
        <div style={styles.routeMiniPanel}>
          <div style={styles.routeMiniTop}>
            <div>
              <h4 style={styles.routeMiniTitle}>
                {getBookingId(booking)}
              </h4>
              <p style={styles.routeMiniSub}>
                {getTruckText(booking)} • {getDriverText(booking)}
              </p>
            </div>

            <span className={`badge badge-${getStatusClass(booking.status)}`}>
              {normalizeStatus(booking.status)}
            </span>
          </div>

          <div style={styles.routeLineBox}>
            <div style={styles.routePoint}>
              <span style={styles.pickupDot}></span>
              <p><b>Pickup:</b> {getPickup(booking)}</p>
            </div>

            <div style={styles.routeConnector}></div>

            <div style={styles.routePoint}>
              <span style={styles.currentDot}></span>
              <p><b>Current:</b> {currentLocationText}</p>
            </div>

            <div style={styles.routeConnector}></div>

            <div style={styles.routePoint}>
              <span style={styles.dropDot}></span>
              <p><b>Drop:</b> {getDrop(booking)}</p>
            </div>
          </div>
        </div>

      </div>
    );
  })}
</div>
  )}
</div>

      <div style={styles.summaryGrid}>
        <div className="glass-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(15, 74, 136, 0.10)', color: 'var(--primary-blue)' }}>
            <Package size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Bookings</p>
            <h4 style={styles.summaryValue}>{summary.total}</h4>
          </div>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(16, 185, 129, 0.10)', color: 'var(--success)' }}>
            <Truck size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Live Shipments</p>
            <h4 style={styles.summaryValue}>{summary.live}</h4>
          </div>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(245, 158, 11, 0.10)', color: 'var(--warning)' }}>
            <Filter size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Pending</p>
            <h4 style={styles.summaryValue}>{summary.pending}</h4>
          </div>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, backgroundColor: 'rgba(59, 130, 246, 0.10)', color: 'var(--info)' }}>
            <CircleDollarSign size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Delivered</p>
            <h4 style={styles.summaryValue}>{summary.delivered}</h4>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
        <div style={styles.topBar}>
          <div style={styles.tabWrap}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab ? styles.activeTabBtn : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.topActions}>
            <div style={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search ID or Customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div style={styles.emptyBox}>Loading live bookings...</div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div style={styles.emptyBox}>No bookings found</div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div style={styles.cardList}>
            {filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking._id || booking.bookingId}
                className="glass-card"
                style={styles.bookingCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div style={styles.bookingTop}>
                  <div>
                    <h3 style={styles.bookingTitle}>{getBookingId(booking)}</h3>
                    <p style={styles.subText}>
                      {getCustomer(booking)} ({getMobile(booking)})
                    </p>
                    <p style={styles.subText}>
                      Type: {booking.bookingType || 'public'} | OTP: {booking.otp || 'N/A'}
                    </p>
                  </div>

                  <span className={`badge badge-${getStatusClass(booking.status)}`}>
                    {normalizeStatus(booking.status)}
                  </span>

                  <button
                    style={{
                      marginTop: '10px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff7a00',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                      onClick={() => openBookingReport(booking)}
                      >
                       PDF Report
                  </button>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Route</p>
                    <p style={styles.infoValue}>
                      <MapPin size={14} style={styles.inlineIcon} />
                      {getPickup(booking)} → {getDrop(booking)}
                    </p>
                  </div>

                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Goods</p>
                    <p style={styles.infoValue}>{getGoods(booking)}</p>
                  </div>

                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Truck</p>
                    <p style={styles.infoValue}>{getTruckText(booking)}</p>
                  </div>

                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Driver</p>
                    <p style={styles.infoValue}>{getDriverText(booking)}</p>
                  </div>

                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Amount</p>
                    <p style={styles.infoValue}>{getAmount(booking)}</p>
                  </div>

                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Payment</p>
                    <p style={styles.infoValue}>
                      {booking.payment?.paymentStatus || 'Pending'} | {booking.payment?.paymentMode || 'Cash'}
                    </p>
                  </div>

                  <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                    <p style={styles.infoLabel}>Current Location</p>
                    <p style={styles.infoValue}>{booking.currentLocation || 'Not updated yet'}</p>
                  </div>
                </div>

                {renderActionPanel(booking)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const styles = {
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '18px',
  },
  summaryCard: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderRadius: '20px',
  },
  summaryIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.84rem',
    fontWeight: '600',
  },
  summaryValue: {
    margin: '4px 0 0 0',
    color: 'var(--dark-blue)',
    fontSize: '1.35rem',
    fontWeight: '800',
  },
  topBar: {
    padding: '22px 24px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  tabWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '9px 16px',
    borderRadius: '999px',
    fontWeight: '700',
    border: 'none',
    backgroundColor: 'var(--bg-soft)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  activeTabBtn: {
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(15, 74, 136, 0.16)',
  },

  topActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
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
    padding: '28px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontWeight: 700,
  },
  cardList: {
    padding: 22,
    display: 'grid',
    gap: 18,
  },
  bookingCard: {
    padding: 22,
    borderRadius: 22,
    background: '#fff',
  },
  bookingTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  bookingTitle: {
    margin: '0 0 6px',
    color: 'var(--dark-blue)',
    fontWeight: 800,
  },
  subText: {
    margin: '3px 0',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12,
    marginBottom: 18,
  },
  infoItem: {
    padding: 14,
    borderRadius: 16,
    background: '#f8fbff',
    border: '1px solid #e8eef6',
  },
  infoLabel: {
    margin: '0 0 6px',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  infoValue: {
    margin: 0,
    color: 'var(--dark-blue)',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  inlineIcon: {
    display: 'inline',
    marginRight: 5,
    verticalAlign: 'middle',
    color: 'var(--primary-blue)',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    background: '#f9fbff',
    border: '1px solid #e8eef6',
  },
  actionTitle: {
    margin: '0 0 10px',
    color: 'var(--dark-blue)',
    fontWeight: 800,
    fontSize: '0.9rem',
  },
  assignSelect: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid var(--border-light)',
    outline: 'none',
    background: '#fff',
    color: 'var(--dark-blue)',
    fontWeight: 600,
    marginBottom: 8,
  },
  assignBtn: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  paymentBtn: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  locationBtn: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#0f766e',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  statusBtnWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid #dbe4ef',
    background: '#fff',
    color: 'var(--dark-blue)',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.78rem',
  },
  statusBtnActive: {
    background: '#fff7ed',
    color: '#c2410c',
    borderColor: '#fed7aa',
  },
  historyBox: {
    maxHeight: 170,
    overflowY: 'auto',
    display: 'grid',
    gap: 8,
  },
  historyItem: {
    padding: 10,
    borderRadius: 12,
    background: '#fff',
    border: '1px solid #e8eef6',
    display: 'grid',
    gap: 4,
    fontSize: '0.8rem',
    color: 'var(--dark-blue)',
  },

  liveMapCard: {
  padding: '24px',
  borderRadius: '24px',
  overflow: 'hidden',
},

liveMapHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '18px',
},

liveMapTitle: {
  margin: 0,
  color: 'var(--dark-blue)',
  fontWeight: '800',
},

liveMapSub: {
  margin: '6px 0 0 0',
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
},

liveMapEmpty: {
  padding: '34px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  background: '#f8fbff',
  borderRadius: '18px',
  border: '1px solid var(--border-light)',
},

liveMapGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '18px',
},

liveMapItem: {
  border: '1px solid var(--border-light)',
  borderRadius: '22px',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: '0 10px 24px rgba(15, 59, 115, 0.06)',
},

mapBox: {
  height: '260px',
  background: '#eef4fb',
},

routeMiniPanel: {
  padding: '18px',
},

routeMiniTop: {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '16px',
},

routeMiniTitle: {
  margin: 0,
  color: 'var(--dark-blue)',
  fontWeight: '800',
},

routeMiniSub: {
  margin: '5px 0 0 0',
  color: 'var(--text-muted)',
  fontSize: '0.86rem',
},

routeLineBox: {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
},

routePoint: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'var(--dark-blue)',
  fontSize: '0.9rem',
},

pickupDot: {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'var(--success)',
  minWidth: '12px',
},

currentDot: {
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  background: 'var(--accent-orange)',
  minWidth: '14px',
  boxShadow: '0 0 0 6px rgba(255, 140, 26, 0.15)',
},

dropDot: {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'var(--danger)',
  minWidth: '12px',
},

routeConnector: {
  width: '2px',
  height: '18px',
  background: 'var(--border-light)',
  marginLeft: '6px',
},
headerRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
},

pageTitle: {
  margin: 0,
  fontSize: "28px",
  fontWeight: "900",
  color: "var(--dark-blue)",
},

pageSub: {
  margin: "6px 0 0 0",
  color: "var(--text-muted)",
},

topRefreshBtn: {
  background: "linear-gradient(135deg, #ff7a00, #ff9a2f)",
  border: "none",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "999px",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 10px 20px rgba(255,122,0,0.25)",
},
};

export default LiveBookings;