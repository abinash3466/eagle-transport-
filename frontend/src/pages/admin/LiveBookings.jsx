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

const API_URL = import.meta.env.VITE_API_URL;

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
  const GST_PERCENTAGE = 5;

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
  const getBaseAmount = (booking) => Number(booking?.amount || 0);
  const getGstAmount = (booking) => {
    const saved = Number(booking?.payment?.gstAmount || 0);
    return saved > 0 ? saved : (getBaseAmount(booking) * GST_PERCENTAGE) / 100;
  };
  const getInvoiceTotal = (booking) => {
    const saved = Number(booking?.payment?.totalWithGST || 0);
    return saved > 0 ? saved : getBaseAmount(booking) + getGstAmount(booking);
  };
  const getCollectedAmount = (booking) => Number(booking?.payment?.advanceAmount || 0);
  const getOutstandingAmount = (booking) => Math.max(getInvoiceTotal(booking) - getCollectedAmount(booking), 0);
  const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

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
    setPaymentData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
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

      if (!res.ok || !data.success) {
        alert(data.message || 'Assign failed');
        return;
      }

      alert('Truck and Driver assigned successfully');
      setAssignData((prev) => ({ ...prev, [bookingMongoId]: {} }));
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      alert('Server error while assigning');
    }
  };

  const handleTripAction = async (booking) => {
    const status = normalizeStatus(booking.status);
    const endpoint = status === 'Dispatched' ? 'start-trip' : status === 'In Transit' ? 'end-trip' : null;

    if (!endpoint) return;

    const actionLabel = status === 'Dispatched' ? 'start trip' : 'complete trip';
    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${booking._id}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status === 'In Transit' ? { remarks: 'Trip completed by owner' } : {}),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || `Unable to ${actionLabel}`);
        return;
      }

      alert(status === 'Dispatched' ? 'Trip started successfully' : 'Trip completed successfully');
      fetchData();
    } catch (error) {
      console.error('Trip action error:', error);
      alert(`Server error while trying to ${actionLabel}`);
    }
  };

  const handlePaymentUpdate = async (bookingMongoId) => {
    const booking = bookings.find((item) => item._id === bookingMongoId);
    const selected = paymentData[bookingMongoId] || {};
    const receivedAmount = Number(selected.receivedAmount || 0);
    const outstanding = getOutstandingAmount(booking);

    if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
      alert('Enter an amount greater than 0');
      return;
    }

    if (receivedAmount > outstanding + 0.01) {
      alert(`Maximum receivable amount is ${formatMoney(outstanding)}`);
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMode: selected.paymentMode || booking?.payment?.paymentMode || 'Cash',
          receivedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Payment update failed');
        return;
      }

      alert('Payment recorded successfully');
      setPaymentData((prev) => ({
        ...prev,
        [bookingMongoId]: { paymentMode: data.booking?.payment?.paymentMode || 'Cash', receivedAmount: '' },
      }));
      fetchData();
    } catch (error) {
      console.error('Payment update error:', error);
      alert('Server error while updating payment');
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

  const renderActionPanel = (booking) => {
    const status = normalizeStatus(booking.status);
    const availableTrucks = trucks.filter((truck) => String(truck.status || 'idle').toLowerCase() === 'idle');
    const availableDrivers = drivers.filter((driver) => String(driver.status || 'available').toLowerCase() === 'available');
    const invoiceTotal = getInvoiceTotal(booking);
    const collected = getCollectedAmount(booking);
    const outstanding = getOutstandingAmount(booking);

    return (
      <div className="lb-action-panel" style={styles.actionPanel}>
        {!isBookingAssigned(booking) && status === 'Booked' && (
          <div>
            <p style={styles.actionTitle}>Assign Truck & Driver</p>
            <select style={styles.assignSelect} value={assignData[booking._id]?.truckId || ''} onChange={(e) => handleAssignChange(booking._id, 'truckId', e.target.value)}>
              <option value="">Select Available Truck</option>
              {availableTrucks.map((truck) => (
                <option key={truck._id} value={truck._id}>{getTruckName(truck)} {truck.category ? `- ${truck.category}` : ''}</option>
              ))}
            </select>
            <select style={styles.assignSelect} value={assignData[booking._id]?.driverId || ''} onChange={(e) => handleAssignChange(booking._id, 'driverId', e.target.value)}>
              <option value="">Select Available Driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>{getDriverName(driver)} {driver.phone ? `- ${driver.phone}` : ''}</option>
              ))}
            </select>
            <button style={styles.assignBtn} onClick={() => handleAssign(booking._id)}>Assign</button>
          </div>
        )}

        <div>
          <p style={styles.actionTitle}>Trip Status</p>
          <div style={styles.statusBtnWrap}>
            <span style={{ ...styles.statusBtn, ...styles.statusBtnActive, cursor: 'default' }}>{status}</span>
            {status === 'Booked' && !isBookingAssigned(booking) && <span style={styles.subText}>Assign a truck and driver to continue.</span>}
            {status === 'Dispatched' && <button style={styles.assignBtn} onClick={() => handleTripAction(booking)}>Start Trip</button>}
            {status === 'In Transit' && <button style={styles.locationBtn} onClick={() => handleTripAction(booking)}>Complete Trip</button>}
            {status === 'Delivered' && <span style={{ ...styles.subText, color: '#047857', fontWeight: 700 }}>Trip completed</span>}
          </div>
        </div>

        <div>
          <p style={styles.actionTitle}>Payment Details</p>
          <div className="lb-payment-summary" style={styles.paymentSummaryBox}>
            <span>Base Freight <strong>{formatMoney(getBaseAmount(booking))}</strong></span>
            <span>GST ({GST_PERCENTAGE}%) <strong>{formatMoney(getGstAmount(booking))}</strong></span>
            <span>Invoice Total <strong>{formatMoney(invoiceTotal)}</strong></span>
            <span>Collected <strong>{formatMoney(collected)}</strong></span>
            <span>Outstanding <strong>{formatMoney(outstanding)}</strong></span>
            <span>Status <strong>{booking.payment?.paymentStatus || 'Pending'}</strong></span>
          </div>

          {outstanding > 0.01 ? (
            <>
              <select style={styles.assignSelect} value={paymentData[booking._id]?.paymentMode || booking.payment?.paymentMode || 'Cash'} onChange={(e) => handlePaymentChange(booking._id, 'paymentMode', e.target.value)}>
                <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Credit</option>
              </select>
              <input style={styles.assignSelect} type="number" min="0" max={outstanding} step="0.01" placeholder="Amount Received Now" value={paymentData[booking._id]?.receivedAmount || ''} onChange={(e) => handlePaymentChange(booking._id, 'receivedAmount', e.target.value)} />
              <button style={styles.paymentBtn} onClick={() => handlePaymentUpdate(booking._id)}>Record Payment</button>
            </>
          ) : (
            <div style={{ ...styles.subText, color: '#047857', fontWeight: 800 }}>Payment fully collected</div>
          )}
        </div>

        {status !== 'Delivered' && (
          <div>
            <p style={styles.actionTitle}>Current Location</p>
            <input style={styles.assignSelect} placeholder="Eg: Madurai Bypass" value={locationData[booking._id] ?? booking.currentLocation ?? ''} onChange={(e) => setLocationData((prev) => ({ ...prev, [booking._id]: e.target.value }))} />
            <button style={styles.locationBtn} onClick={() => handleLocationUpdate(booking._id)}>Update Location</button>
          </div>
        )}

        <div>
          <p style={styles.actionTitle}>Status History</p>
          <div className="lb-history-box" style={styles.historyBox}>
            {(booking.statusHistory || []).length === 0 ? <p style={styles.subText}>No history yet</p> : (
              booking.statusHistory.map((item, index) => (
                <div key={index} style={styles.historyItem}>
                  <strong>{item.status}</strong><span>{item.note || '-'}</span>
                  <small>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'No date'}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lb-page" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 🔥 TOP HEADER */}
      <div className="lb-header-row" style={styles.headerRow}>
        <div>
          <h1 className="lb-page-title" style={styles.pageTitle}>Live Bookings</h1>
          <p className="lb-page-sub" style={styles.pageSub}>
            Manage and monitor Eagle Transport operations from this section.
          </p>
        </div>

        <button className="lb-refresh-btn" style={styles.topRefreshBtn} onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>
      <div className="card lb-map-card" style={styles.liveMapCard}>
        <div className="lb-map-header" style={styles.liveMapHeader}>
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
          <div className="lb-map-grid" style={styles.liveMapGrid}>
            {liveMapBookings.map((booking) => {
              const currentLocationText =
                booking?.liveLocation?.lat && booking?.liveLocation?.lng
                  ? `${booking.liveLocation.lat}, ${booking.liveLocation.lng}`
                  : booking?.currentLocation || booking?.pickup || 'India';

              const mapQuery = encodeURIComponent(currentLocationText);

              return (
                <div className="lb-map-item" key={booking._id || booking.bookingId} style={styles.liveMapItem}>

                  {/* MAP */}
                  <div className="lb-map-box" style={styles.mapBox}>
                    <iframe
                      title={`map-${booking._id}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`}
                    />
                  </div>

                  {/* ROUTE PANEL */}
                  <div className="lb-route-panel" style={styles.routeMiniPanel}>
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

      <div className="lb-summary-grid" style={styles.summaryGrid}>
        <div className="glass-card lb-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, background: 'rgba(15, 74, 136, 0.10)', color: 'var(--primary-blue)' }}>
            <Package size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Bookings</p>
            <h4 style={styles.summaryValue}>{summary.total}</h4>
          </div>
        </div>

        <div className="glass-card lb-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, background: 'rgba(16, 185, 129, 0.10)', color: 'var(--success)' }}>
            <Truck size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Live Shipments</p>
            <h4 style={styles.summaryValue}>{summary.live}</h4>
          </div>
        </div>

        <div className="glass-card lb-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, background: 'rgba(245, 158, 11, 0.10)', color: 'var(--warning)' }}>
            <Filter size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Pending</p>
            <h4 style={styles.summaryValue}>{summary.pending}</h4>
          </div>
        </div>

        <div className="glass-card lb-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.summaryIconWrap, background: 'rgba(59, 130, 246, 0.10)', color: 'var(--info)' }}>
            <CircleDollarSign size={22} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Delivered</p>
            <h4 style={styles.summaryValue}>{summary.delivered}</h4>
          </div>
        </div>
      </div>

      <div className="card lb-bookings-shell" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
        <div className="lb-topbar" style={styles.topBar}>
          <div className="lb-tabs" style={styles.tabWrap}>
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

          <div className="lb-top-actions" style={styles.topActions}>
            <div className="lb-search-box" style={styles.searchBox}>
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
          <div className="lb-card-list" style={styles.cardList}>
            {filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking._id || booking.bookingId}
                className="glass-card lb-booking-card"
                style={styles.bookingCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="lb-booking-top" style={styles.bookingTop}>
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
                    className="lb-pdf-btn"
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

                <div className="lb-info-grid" style={styles.infoGrid}>
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
      <style>{liveBookingsMobileCss}</style>
    </div>
  );
};



const liveBookingsMobileCss = `
  /* =========================================================
     LIVE BOOKINGS - PREMIUM MOBILE RESPONSIVE
     Desktop/laptop styles remain untouched.
  ========================================================= */

  @media (max-width: 768px) {
    .lb-page {
      width: 100% !important;
      min-width: 0 !important;
      gap: 14px !important;
      overflow-x: hidden !important;
    }

    /* ---------- PAGE HEADER ---------- */
    .lb-header-row {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 2px 2px 0 !important;
    }

    .lb-page-title {
      font-size: 22px !important;
      line-height: 1.08 !important;
      letter-spacing: -0.45px !important;
    }

    .lb-page-sub {
      margin-top: 4px !important;
      max-width: 245px !important;
      font-size: 10.5px !important;
      line-height: 1.35 !important;
    }

    .lb-refresh-btn {
      min-width: 42px !important;
      min-height: 42px !important;
      padding: 0 11px !important;
      border-radius: 12px !important;
      font-size: 0 !important;
      box-shadow: 0 8px 18px rgba(255, 122, 0, 0.18) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .lb-refresh-btn::after {
      content: "↻";
      font-size: 20px;
      line-height: 1;
      font-weight: 900;
    }

    .lb-refresh-btn:active {
      transform: scale(.94) !important;
    }

    /* ---------- LIVE MAP ---------- */
    .lb-map-card {
      width: 100% !important;
      min-width: 0 !important;
      padding: 14px !important;
      border-radius: 19px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      border: 1px solid rgba(15, 74, 136, .08) !important;
      box-shadow: 0 10px 26px rgba(15, 59, 115, .07) !important;
    }

    .lb-map-header {
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      align-items: start !important;
      gap: 9px !important;
      margin-bottom: 12px !important;
    }

    .lb-map-header h3 {
      font-size: 16px !important;
      line-height: 1.2 !important;
    }

    .lb-map-header p {
      margin-top: 4px !important;
      font-size: 9.5px !important;
      line-height: 1.35 !important;
      max-width: 240px !important;
    }

    .lb-map-header .badge {
      padding: 5px 8px !important;
      border-radius: 999px !important;
      font-size: 9px !important;
      white-space: nowrap !important;
    }

    .lb-map-grid {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }

    .lb-map-item {
      width: 100% !important;
      min-width: 0 !important;
      border-radius: 15px !important;
      box-shadow: 0 8px 20px rgba(15, 59, 115, .06) !important;
      animation: lbCardEnter .28s ease both;
    }

    .lb-map-box {
      height: 170px !important;
    }

    .lb-route-panel {
      padding: 12px !important;
    }

    .lb-route-panel > div:first-child {
      gap: 8px !important;
      margin-bottom: 11px !important;
    }

    .lb-route-panel h4 {
      font-size: 12.5px !important;
    }

    .lb-route-panel p {
      font-size: 9.5px !important;
      line-height: 1.35 !important;
      overflow-wrap: anywhere !important;
    }

    .lb-route-panel .badge {
      font-size: 8.5px !important;
      padding: 5px 7px !important;
      white-space: nowrap !important;
    }

    /* ---------- SUMMARY ---------- */
    .lb-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
    }

    .lb-summary-card {
      min-width: 0 !important;
      padding: 12px 10px !important;
      gap: 9px !important;
      border-radius: 15px !important;
      border: 1px solid rgba(15, 74, 136, .07) !important;
      box-shadow: 0 7px 18px rgba(15, 59, 115, .055) !important;
      animation: lbCardEnter .30s ease both;
    }

    .lb-summary-card > div:first-child {
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      border-radius: 11px !important;
    }

    .lb-summary-card > div:first-child svg {
      width: 17px !important;
      height: 17px !important;
    }

    .lb-summary-card p {
      font-size: 9px !important;
      line-height: 1.2 !important;
    }

    .lb-summary-card h4 {
      margin-top: 3px !important;
      font-size: 17px !important;
      line-height: 1 !important;
    }

    /* ---------- FILTER / SEARCH ---------- */
    .lb-bookings-shell {
      width: 100% !important;
      min-width: 0 !important;
      border-radius: 18px !important;
      box-shadow: 0 10px 26px rgba(15, 59, 115, .06) !important;
    }

    .lb-topbar {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 9px !important;
      padding: 12px !important;
      box-sizing: border-box !important;
    }

    .lb-tabs {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 5px !important;
    }

    .lb-tabs button {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 36px !important;
      padding: 6px 3px !important;
      border-radius: 9px !important;
      font-size: 9px !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      transition: transform .16s ease, box-shadow .16s ease, background .16s ease !important;
    }

    .lb-tabs button:active {
      transform: scale(.96) !important;
    }

    .lb-top-actions,
    .lb-search-box {
      width: 100% !important;
      min-width: 0 !important;
    }

    .lb-search-box {
      min-height: 39px !important;
      padding: 7px 10px !important;
      border-radius: 11px !important;
      background: #f9fbfe !important;
    }

    .lb-search-box input {
      min-width: 0 !important;
      font-size: 11px !important;
    }

    /* ---------- BOOKING CARDS ---------- */
    .lb-card-list {
      padding: 10px !important;
      gap: 10px !important;
    }

    .lb-booking-card {
      width: 100% !important;
      min-width: 0 !important;
      padding: 13px !important;
      border-radius: 16px !important;
      box-sizing: border-box !important;
      border: 1px solid #e7eef7 !important;
      box-shadow: 0 8px 20px rgba(15, 59, 115, .055) !important;
      animation: lbCardEnter .30s ease both;
    }

    .lb-booking-top {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 8px !important;
      align-items: start !important;
      margin-bottom: 11px !important;
    }

    .lb-booking-top > div {
      min-width: 0 !important;
    }

    .lb-booking-top h3 {
      font-size: 14px !important;
      line-height: 1.15 !important;
    }

    .lb-booking-top p {
      font-size: 9.5px !important;
      line-height: 1.35 !important;
      overflow-wrap: anywhere !important;
    }

    .lb-booking-top > .badge {
      padding: 5px 7px !important;
      font-size: 8.5px !important;
      white-space: nowrap !important;
    }

    .lb-pdf-btn {
      grid-column: 1 / -1 !important;
      justify-self: start !important;
      margin-top: 0 !important;
      min-height: 34px !important;
      padding: 0 11px !important;
      border-radius: 9px !important;
      font-size: 9.5px !important;
      box-shadow: 0 6px 14px rgba(255, 122, 0, .14) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .lb-pdf-btn:active {
      transform: scale(.96) !important;
    }

    /* ---------- INFO GRID ---------- */
    .lb-info-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 7px !important;
      margin-bottom: 10px !important;
    }

    .lb-info-grid > div {
      min-width: 0 !important;
      padding: 9px !important;
      border-radius: 11px !important;
      background: linear-gradient(145deg, #f9fbfe, #f4f8fd) !important;
    }

    .lb-info-grid p:first-child {
      margin-bottom: 3px !important;
      font-size: 8.5px !important;
    }

    .lb-info-grid p:last-child {
      font-size: 10px !important;
      line-height: 1.35 !important;
      overflow-wrap: anywhere !important;
    }

    /* ---------- OPERATIONS PANEL ---------- */
    .lb-action-panel {
      width: 100% !important;
      grid-template-columns: 1fr !important;
      gap: 8px !important;
      padding: 9px !important;
      border-radius: 13px !important;
      box-sizing: border-box !important;
      background: linear-gradient(145deg, #f8fbff 0%, #f3f7fc 100%) !important;
    }

    .lb-action-panel > div {
      width: 100% !important;
      min-width: 0 !important;
      padding: 10px !important;
      border-radius: 11px !important;
      background: rgba(255,255,255,.82) !important;
      border: 1px solid #e6edf6 !important;
      box-sizing: border-box !important;
    }

    .lb-action-panel > div > p:first-child {
      margin-bottom: 7px !important;
      font-size: 10px !important;
      letter-spacing: .05px !important;
    }

    .lb-action-panel select,
    .lb-action-panel input {
      min-height: 39px !important;
      padding: 7px 9px !important;
      margin-bottom: 6px !important;
      border-radius: 9px !important;
      font-size: 10px !important;
      box-sizing: border-box !important;
    }

    .lb-action-panel button {
      min-height: 39px !important;
      padding: 7px 10px !important;
      border-radius: 9px !important;
      font-size: 10px !important;
      transition: transform .15s ease, box-shadow .15s ease, filter .15s ease !important;
    }

    .lb-action-panel button:active {
      transform: scale(.975) !important;
    }

    .lb-payment-summary {
      gap: 5px !important;
      padding: 9px !important;
      margin-bottom: 7px !important;
      border-radius: 9px !important;
      font-size: 9.5px !important;
    }

    .lb-payment-summary span {
      display: flex !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    .lb-history-box {
      max-height: 135px !important;
      gap: 6px !important;
    }

    .lb-history-box > div {
      padding: 8px !important;
      border-radius: 9px !important;
      font-size: 9px !important;
    }

    /* ---------- EMPTY STATES ---------- */
    .lb-bookings-shell > div[style*="textAlign"] {
      padding: 20px 12px !important;
      font-size: 11px !important;
    }

    /* ---------- MOTION ---------- */
    @keyframes lbCardEnter {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .lb-map-item,
      .lb-summary-card,
      .lb-booking-card {
        animation: none !important;
      }

      .lb-tabs button,
      .lb-refresh-btn,
      .lb-pdf-btn,
      .lb-action-panel button {
        transition: none !important;
      }
    }
  }

  /* =========================================================
     SMALL MOBILE - 420px AND BELOW
  ========================================================= */
  @media (max-width: 420px) {
    .lb-page {
      gap: 11px !important;
    }

    .lb-header-row {
      gap: 7px !important;
    }

    .lb-page-title {
      font-size: 20px !important;
    }

    .lb-page-sub {
      max-width: 215px !important;
      font-size: 9.5px !important;
    }

    .lb-refresh-btn {
      min-width: 38px !important;
      min-height: 38px !important;
      padding: 0 9px !important;
      border-radius: 11px !important;
    }

    .lb-map-card {
      padding: 11px !important;
      border-radius: 17px !important;
    }

    .lb-map-header h3 {
      font-size: 14.5px !important;
    }

    .lb-map-header p {
      max-width: 205px !important;
      font-size: 8.8px !important;
    }

    .lb-map-box {
      height: 145px !important;
    }

    .lb-route-panel {
      padding: 10px !important;
    }

    .lb-summary-grid {
      gap: 7px !important;
    }

    .lb-summary-card {
      padding: 10px 8px !important;
      gap: 7px !important;
      border-radius: 13px !important;
    }

    .lb-summary-card > div:first-child {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      border-radius: 10px !important;
    }

    .lb-summary-card p {
      font-size: 8.3px !important;
    }

    .lb-summary-card h4 {
      font-size: 15px !important;
    }

    .lb-topbar {
      padding: 9px !important;
      gap: 7px !important;
    }

    .lb-tabs {
      gap: 4px !important;
    }

    .lb-tabs button {
      min-height: 33px !important;
      padding: 5px 2px !important;
      border-radius: 8px !important;
      font-size: 8.2px !important;
    }

    .lb-search-box {
      min-height: 37px !important;
    }

    .lb-card-list {
      padding: 8px !important;
      gap: 8px !important;
    }

    .lb-booking-card {
      padding: 11px !important;
      border-radius: 14px !important;
    }

    .lb-booking-top h3 {
      font-size: 13px !important;
    }

    .lb-booking-top p {
      font-size: 8.8px !important;
    }

    .lb-info-grid {
      gap: 5px !important;
    }

    .lb-info-grid > div {
      padding: 8px !important;
      border-radius: 10px !important;
    }

    .lb-info-grid p:first-child {
      font-size: 8px !important;
    }

    .lb-info-grid p:last-child {
      font-size: 9.3px !important;
    }

    .lb-action-panel {
      padding: 7px !important;
      gap: 7px !important;
    }

    .lb-action-panel > div {
      padding: 8px !important;
      border-radius: 10px !important;
    }

    .lb-action-panel select,
    .lb-action-panel input,
    .lb-action-panel button {
      min-height: 37px !important;
      font-size: 9.5px !important;
    }

    .lb-payment-summary {
      font-size: 8.8px !important;
    }
  }
`;


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
  paymentSummaryBox: {
    display: 'grid',
    gap: 8,
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    background: '#f8fbff',
    border: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    color: 'var(--dark-blue)',
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