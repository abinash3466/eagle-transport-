import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  Search,
  Filter,
  MapPin,
  Truck,
  Package,
  CircleDollarSign,
} from 'lucide-react';

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
  const [busyActions, setBusyActions] = useState({});

  const tabs = ['All', 'Live', 'Pending', 'Delivered'];
  const GST_PERCENTAGE = 5;

  const getMongoId = (booking) => booking?._id || booking?.id || null;

  const setActionBusy = (key, value) => {
    setBusyActions((prev) => ({ ...prev, [key]: value }));
  };

  const isActionBusy = (key) => Boolean(busyActions[key]);

  const openBookingReport = async (booking) => {
    const bookingMongoId = getMongoId(booking);

    if (!bookingMongoId) {
      alert('Booking ID not found');
      return;
    }

    const popup = window.open('', '_blank');

    try {
      const response = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/invoice`);

      if (!response.ok) {
        const message = await response.text().catch(() => 'Unable to open invoice');
        throw new Error(message || 'Unable to open invoice');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (popup) {
        popup.location.href = url;
      } else {
        window.open(url, '_blank');
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (popup) popup.close();
      console.error('Invoice open error:', error);
      alert(error.message || 'Unable to open invoice');
    }
  };

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const [bookingRes, truckRes, driverRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/bookings`),
        fetchWithAuth(`${API_URL}/trucks`),
        fetchWithAuth(`${API_URL}/drivers`),
      ]);

      const responses = [
        ['bookings', bookingRes],
        ['trucks', truckRes],
        ['drivers', driverRes],
      ];

      for (const [name, response] of responses) {
        if (!response.ok) {
          throw new Error(`${name} request failed (${response.status})`);
        }
      }

      const [bookingData, truckData, driverData] = await Promise.all([
        bookingRes.json(),
        truckRes.json(),
        driverRes.json(),
      ]);

      if (!Array.isArray(bookingData) || !Array.isArray(truckData) || !Array.isArray(driverData)) {
        throw new Error('Unexpected dashboard response format');
      }

      setBookings(bookingData);
      setTrucks(truckData);
      setDrivers(driverData);
    } catch (error) {
      console.error('Live bookings fetch error:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData({ silent: true });
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const getBookingId = (booking) => booking.bookingId || booking.id || booking._id;
  const getCustomer = (booking) => booking.customerName || booking.customer || 'Unknown Customer';
  const getMobile = (booking) => booking.phone || booking.mobile || 'N/A';
  const getPickup = (booking) => booking.pickup || booking.pickupLocation || 'N/A';
  const getDrop = (booking) => booking.drop || booking.dropLocation || 'N/A';
  const getGoods = (booking) => booking.goods || booking.goodsType || 'Goods';
  const getAmount = (booking) => booking.amount != null
    ? `₹${Number(booking.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    : 'Not Added';

  const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
  const getBaseAmount = (booking) => roundMoney(booking?.amount || 0);

  const getGstPercentage = (booking) => {
    const saved = Number(booking?.payment?.gstPercentage);
    return Number.isFinite(saved) ? saved : GST_PERCENTAGE;
  };

  const getGstAmount = (booking) => {
    const baseAmount = getBaseAmount(booking);
    const percentage = getGstPercentage(booking);
    const saved = Number(booking?.payment?.gstAmount);

    if (percentage === 0) return 0;
    if (Number.isFinite(saved) && saved > 0) return roundMoney(saved);
    return roundMoney((baseAmount * percentage) / 100);
  };

  const getInvoiceTotal = (booking) => {
    const saved = Number(booking?.payment?.totalWithGST);
    if (Number.isFinite(saved) && saved > 0) return roundMoney(saved);
    return roundMoney(getBaseAmount(booking) + getGstAmount(booking));
  };

  const getCollectedAmount = (booking) => roundMoney(booking?.payment?.advanceAmount || 0);

  const getOutstandingAmount = (booking) => {
    const saved = Number(booking?.payment?.balanceAmount);
    if (Number.isFinite(saved) && saved >= 0) return roundMoney(saved);
    return roundMoney(Math.max(getInvoiceTotal(booking) - getCollectedAmount(booking), 0));
  };

  const formatMoney = (value) =>
    `₹${roundMoney(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

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
    const value = String(status || '').trim().toLowerCase();
    const map = {
      booked: 'Booked',
      pending: 'Booked',
      dispatched: 'Dispatched',
      assigned: 'Dispatched',
      'in transit': 'In Transit',
      transit: 'In Transit',
      'on route': 'In Transit',
      delivered: 'Delivered',
    };

    return map[value] || 'Booked';
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
    const actionKey = `assign:${bookingMongoId}`;
    if (isActionBusy(actionKey)) return;
    const selected = assignData[bookingMongoId];

    if (!selected?.truckId || !selected?.driverId) {
      alert('Please select truck and driver');
      return;
    }

    try {
      setActionBusy(actionKey, true);
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
      fetchData({ silent: true });
    } catch (error) {
      console.error('Assign error:', error);
      alert('Server error while assigning');
    } finally {
      setActionBusy(actionKey, false);
    }
  };

  const handleTripAction = async (booking) => {
    const bookingMongoId = getMongoId(booking);
    if (!bookingMongoId) return;
    const status = normalizeStatus(booking.status);
    const endpoint = status === 'Dispatched' ? 'start-trip' : status === 'In Transit' ? 'end-trip' : null;

    if (!endpoint) return;

    const actionLabel = status === 'Dispatched' ? 'start trip' : 'complete trip';
    const actionKey = `trip:${bookingMongoId}`;
    if (isActionBusy(actionKey)) return;
    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

    try {
      setActionBusy(actionKey, true);
      const res = await fetchWithAuth(`${API_URL}/bookings/${bookingMongoId}/${endpoint}`, {
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
      fetchData({ silent: true });
    } catch (error) {
      console.error('Trip action error:', error);
      alert(`Server error while trying to ${actionLabel}`);
    } finally {
      setActionBusy(actionKey, false);
    }
  };

  const handlePaymentUpdate = async (bookingMongoId) => {
    const actionKey = `payment:${bookingMongoId}`;
    if (isActionBusy(actionKey)) return;
    const booking = bookings.find((item) => getMongoId(item) === bookingMongoId);
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
      setActionBusy(actionKey, true);
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
      fetchData({ silent: true });
    } catch (error) {
      console.error('Payment update error:', error);
      alert('Server error while updating payment');
    } finally {
      setActionBusy(actionKey, false);
    }
  };

  const handleLocationUpdate = async (bookingMongoId) => {
    const actionKey = `location:${bookingMongoId}`;
    if (isActionBusy(actionKey)) return;
    const currentLocation = locationData[bookingMongoId];

    if (!currentLocation) {
      alert('Please enter current location');
      return;
    }

    try {
      setActionBusy(actionKey, true);
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
      fetchData({ silent: true });
    } catch (error) {
      console.error('Location update error:', error);
      alert('Server error while updating location');
    } finally {
      setActionBusy(actionKey, false);
    }
  };

  const renderActionPanel = (booking) => {
    const bookingMongoId = getMongoId(booking);
    const status = normalizeStatus(booking.status);
    const availableTrucks = trucks.filter((truck) => String(truck.status || '').toLowerCase() === 'idle');
    const availableDrivers = drivers.filter((driver) => String(driver.status || '').toLowerCase() === 'available');
    const invoiceTotal = getInvoiceTotal(booking);
    const collected = getCollectedAmount(booking);
    const outstanding = getOutstandingAmount(booking);

    return (
      <div className="lb-action-panel" style={styles.actionPanel}>
        {!isBookingAssigned(booking) && status === 'Booked' && (
          <div className="lb-action-section lb-assign-section">
            <p style={styles.actionTitle}>Assign Truck & Driver</p>
            <select style={styles.assignSelect} value={assignData[bookingMongoId]?.truckId || ''} onChange={(e) => handleAssignChange(bookingMongoId, 'truckId', e.target.value)}>
              <option value="">Select Available Truck</option>
              {availableTrucks.map((truck) => (
                <option key={truck._id} value={truck._id}>{getTruckName(truck)} {truck.category ? `- ${truck.category}` : ''}</option>
              ))}
            </select>
            <select style={styles.assignSelect} value={assignData[bookingMongoId]?.driverId || ''} onChange={(e) => handleAssignChange(bookingMongoId, 'driverId', e.target.value)}>
              <option value="">Select Available Driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>{getDriverName(driver)} {driver.phone ? `- ${driver.phone}` : ''}</option>
              ))}
            </select>
            <button style={styles.assignBtn} disabled={isActionBusy(`assign:${bookingMongoId}`)} onClick={() => handleAssign(bookingMongoId)}>{isActionBusy(`assign:${bookingMongoId}`) ? 'Assigning...' : 'Assign'}</button>
          </div>
        )}

        <div className="lb-action-section lb-trip-section">
          <div className="lb-section-head">
            <p style={styles.actionTitle}>Trip Status</p>
          </div>

          <div className="lb-trip-content" style={styles.statusBtnWrap}>
            <span className="lb-status-pill" style={{ ...styles.statusBtn, ...styles.statusBtnActive, cursor: 'default' }}>
              {status}
            </span>

            {status === 'Booked' && !isBookingAssigned(booking) && (
              <span className="lb-trip-note" style={styles.subText}>
                Assign a truck and driver to continue.
              </span>
            )}

            {status === 'Dispatched' && (
              <button className="lb-trip-btn" style={styles.assignBtn} disabled={isActionBusy(`trip:${bookingMongoId}`)} onClick={() => handleTripAction(booking)}>
                Start Trip
              </button>
            )}

            {status === 'In Transit' && (
              <button className="lb-trip-btn" style={styles.locationBtn} disabled={isActionBusy(`trip:${bookingMongoId}`)} onClick={() => handleTripAction(booking)}>
                Complete Trip
              </button>
            )}

            {status === 'Delivered' && (
              <span className="lb-trip-note lb-trip-note-success" style={{ ...styles.subText, color: '#047857', fontWeight: 700 }}>
                Trip completed
              </span>
            )}
          </div>
        </div>

        <div className="lb-action-section lb-payment-section">
          <div className="lb-section-head">
            <p style={styles.actionTitle}>Payment Details</p>
            <span className={`lb-mini-payment-badge ${String(booking.payment?.paymentStatus || 'Pending').toLowerCase() === 'paid' ? 'is-paid' : 'is-pending'}`}>
              {booking.payment?.paymentStatus || 'Pending'}
            </span>
          </div>

          <div className="lb-payment-summary lb-payment-calculation" style={styles.paymentSummaryBox}>
            <div className="lb-calc-flow">
              <div className="lb-calc-box">
                <span>Base Freight</span>
                <strong>{formatMoney(getBaseAmount(booking))}</strong>
              </div>

              <span className="lb-calc-symbol" aria-hidden="true">+</span>

              <div className="lb-calc-box">
                <span>GST ({getGstPercentage(booking)}%)</span>
                <strong>{formatMoney(getGstAmount(booking))}</strong>
              </div>

              <span className="lb-calc-symbol lb-calc-equals" aria-hidden="true">=</span>

              <div className="lb-calc-box lb-calc-total">
                <span>Invoice Total</span>
                <strong>{formatMoney(invoiceTotal)}</strong>
              </div>
            </div>

            <div className="lb-collection-line">
              <div className="lb-collection-item">
                <span>Collected</span>
                <strong>{formatMoney(collected)}</strong>
              </div>

              <div className="lb-collection-divider" aria-hidden="true" />

              <div className="lb-collection-item lb-balance-item">
                <span>Balance Due</span>
                <strong className={outstanding <= 0.01 ? 'is-clear' : 'is-due'}>
                  {formatMoney(outstanding)}
                </strong>
              </div>
            </div>
          </div>

          {outstanding > 0.01 ? (
            <div className="lb-payment-form">
              <select style={styles.assignSelect} value={paymentData[bookingMongoId]?.paymentMode || booking.payment?.paymentMode || 'Cash'} onChange={(e) => handlePaymentChange(bookingMongoId, 'paymentMode', e.target.value)}>
                <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Credit</option>
              </select>
              <input style={styles.assignSelect} type="number" min="0" max={outstanding} step="0.01" placeholder="Amount Received Now" value={paymentData[bookingMongoId]?.receivedAmount || ''} onChange={(e) => handlePaymentChange(bookingMongoId, 'receivedAmount', e.target.value)} />
              <button className="lb-payment-btn" style={styles.paymentBtn} disabled={isActionBusy(`payment:${bookingMongoId}`)} onClick={() => handlePaymentUpdate(bookingMongoId)}>{isActionBusy(`payment:${bookingMongoId}`) ? 'Recording...' : 'Record Payment'}</button>
            </div>
          ) : (
            <div className="lb-payment-success" style={{ ...styles.subText, color: '#047857', fontWeight: 800 }}>
              ✓ Payment fully collected
            </div>
          )}
        </div>

        {status !== 'Delivered' && (
          <div className="lb-action-section lb-location-section">
            <p style={styles.actionTitle}>Current Location</p>
            <input style={styles.assignSelect} placeholder="Eg: Madurai Bypass" value={locationData[bookingMongoId] ?? booking.currentLocation ?? ''} onChange={(e) => setLocationData((prev) => ({ ...prev, [bookingMongoId]: e.target.value }))} />
            <button style={styles.locationBtn} disabled={isActionBusy(`location:${bookingMongoId}`)} onClick={() => handleLocationUpdate(bookingMongoId)}>{isActionBusy(`location:${bookingMongoId}`) ? 'Updating...' : 'Update Location'}</button>
          </div>
        )}

        <div className="lb-action-section lb-history-section">
          <div className="lb-section-head">
            <p style={styles.actionTitle}>Status History</p>
          </div>
          <div className="lb-history-box" style={styles.historyBox}>
            {(booking.statusHistory || []).length === 0 ? <p style={styles.subText}>No history yet</p> : (
              booking.statusHistory.map((item, index) => (
                <div key={index} className="lb-history-item" style={styles.historyItem}>
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

        <button className="lb-refresh-btn" style={styles.topRefreshBtn} onClick={() => fetchData()}>
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
                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Route</p>
                    <p style={styles.infoValue}>
                      <MapPin size={14} style={styles.inlineIcon} />
                      {getPickup(booking)} → {getDrop(booking)}
                    </p>
                  </div>

                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Goods</p>
                    <p style={styles.infoValue}>{getGoods(booking)}</p>
                  </div>

                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Truck</p>
                    <p style={styles.infoValue}>{getTruckText(booking)}</p>
                  </div>

                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Driver</p>
                    <p style={styles.infoValue}>{getDriverText(booking)}</p>
                  </div>

                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Amount</p>
                    <p style={styles.infoValue}>{getAmount(booking)}</p>
                  </div>

                  <div className="lb-info-item" style={styles.infoItem}>
                    <p style={styles.infoLabel}>Payment</p>
                    <p style={styles.infoValue}>
                      {booking.payment?.paymentStatus || 'Pending'} | {booking.payment?.paymentMode || 'Cash'}
                    </p>
                  </div>

                  <div className="lb-info-item lb-info-item--full" style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
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
     LIVE BOOKINGS - CLEAN RESPONSIVE THEME
     Single source of truth. No duplicate override blocks.
  ========================================================= */

  .lb-page,
  .lb-booking-card,
  .lb-bookings-shell,
  .lb-action-panel,
  .lb-action-section,
  .lb-info-item,
  .lb-summary-card,
  .lb-map-card {
    box-sizing: border-box;
  }

  .lb-action-panel button:disabled,
  .lb-action-panel input:disabled,
  .lb-action-panel select:disabled {
    opacity: .58 !important;
    cursor: not-allowed !important;
    transform: none !important;
  }

  /* ---------- DARK MODE ---------- */
  body[data-theme="dark"] .lb-booking-card,
  body[data-theme="dark"] .lb-bookings-shell,
  body[data-theme="dark"] .lb-map-card,
  body[data-theme="dark"] .lb-summary-card {
    background: #0d2238 !important;
    border-color: rgba(132,174,214,.14) !important;
    color: #eaf3fc !important;
  }

  body[data-theme="dark"] .lb-topbar {
    background: #0d2238 !important;
    border-bottom-color: rgba(132,174,214,.12) !important;
  }

  body[data-theme="dark"] .lb-page-title,
  body[data-theme="dark"] .lb-booking-top h3,
  body[data-theme="dark"] .lb-map-header h3 {
    color: #f4f8fd !important;
  }

  body[data-theme="dark"] .lb-page-sub,
  body[data-theme="dark"] .lb-booking-top p,
  body[data-theme="dark"] .lb-map-header p {
    color: #91a8bf !important;
  }

  body[data-theme="dark"] .lb-info-item {
    background: #102840 !important;
    border-color: rgba(132,174,214,.13) !important;
  }

  body[data-theme="dark"] .lb-info-item p:first-child { color: #829bb3 !important; }
  body[data-theme="dark"] .lb-info-item p:last-child { color: #eef6ff !important; }

  body[data-theme="dark"] .lb-search-box {
    background: #102840 !important;
    border-color: rgba(132,174,214,.14) !important;
  }

  body[data-theme="dark"] .lb-search-box input {
    color: #eef6ff !important;
    background: transparent !important;
  }

  body[data-theme="dark"] .lb-search-box input::placeholder { color: #7d94aa !important; }

  /* ---------- COMPACT OPERATIONS PANEL ---------- */
  .lb-action-panel {
    display: grid !important;
    grid-template-columns: .78fr 1.08fr 1fr !important;
    align-items: start !important;
    gap: 10px !important;
    padding: 10px !important;
    border-radius: 18px !important;
  }

  .lb-action-panel > .lb-action-section {
    min-width: 0 !important;
    min-height: 0 !important;
    height: auto !important;
    padding: 12px !important;
    border-radius: 15px !important;
  }

  body[data-theme="dark"] .lb-action-panel {
    background: linear-gradient(145deg,#081d31,#0a2238) !important;
    border: 1px solid rgba(123,169,212,.10) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.018),0 10px 24px rgba(0,0,0,.12) !important;
  }

  body[data-theme="dark"] .lb-action-panel > .lb-action-section {
    background: linear-gradient(180deg,rgba(16,45,73,.88),rgba(11,35,58,.88)) !important;
    border: 1px solid rgba(127,174,217,.085) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.018) !important;
    color: #dce9f6 !important;
  }

  .lb-section-head {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    min-width: 0 !important;
    margin-bottom: 9px !important;
  }

  .lb-section-head > p,
  .lb-action-section > p:first-child {
    margin: 0 !important;
    font-size: .90rem !important;
    line-height: 1.15 !important;
    font-weight: 800 !important;
  }

  body[data-theme="dark"] .lb-section-head > p,
  body[data-theme="dark"] .lb-action-section > p:first-child { color: #f4f8fd !important; }

  .lb-trip-content {
    display: flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }

  body[data-theme="dark"] .lb-status-pill {
    padding: 7px 11px !important;
    border-radius: 999px !important;
    background: rgba(255,122,0,.10) !important;
    border: 1px solid rgba(255,142,42,.24) !important;
    color: #ff9b42 !important;
    font-size: .74rem !important;
    font-weight: 800 !important;
  }

  body[data-theme="dark"] .lb-trip-note {
    margin: 0 !important;
    color: #90a7bd !important;
    font-size: .75rem !important;
    line-height: 1.35 !important;
  }

  body[data-theme="dark"] .lb-trip-note-success { color: #1fc98d !important; }

  .lb-mini-payment-badge {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 25px !important;
    padding: 0 8px !important;
    border-radius: 999px !important;
    font-size: .65rem !important;
    font-weight: 800 !important;
  }

  body[data-theme="dark"] .lb-mini-payment-badge.is-paid {
    color: #2bd49b !important;
    background: rgba(16,185,129,.10) !important;
    border: 1px solid rgba(16,185,129,.15) !important;
  }

  body[data-theme="dark"] .lb-mini-payment-badge.is-pending {
    color: #ffc071 !important;
    background: rgba(245,158,11,.10) !important;
    border: 1px solid rgba(245,158,11,.15) !important;
  }

  .lb-payment-summary {
    display: grid !important;
    grid-template-columns: repeat(2,minmax(0,1fr)) !important;
    gap: 7px !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .lb-pay-item {
    min-width: 0 !important;
    min-height: 48px !important;
    padding: 8px 9px !important;
    border-radius: 11px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    gap: 3px !important;
  }

  body[data-theme="dark"] .lb-pay-item {
    background: rgba(7,27,45,.48) !important;
    border: 1px solid rgba(127,170,211,.05) !important;
  }

  .lb-pay-item span { font-size: .63rem !important; font-weight: 700 !important; line-height: 1.1 !important; }
  .lb-pay-item strong { font-size: .78rem !important; font-weight: 800 !important; line-height: 1.2 !important; white-space: nowrap !important; }
  body[data-theme="dark"] .lb-pay-item span { color: #829ab1 !important; }
  body[data-theme="dark"] .lb-pay-item strong { color: #f3f8fd !important; }

  body[data-theme="dark"] .lb-pay-item-total {
    background: linear-gradient(135deg,rgba(22,78,133,.26),rgba(7,27,45,.52)) !important;
    border-color: rgba(80,154,220,.12) !important;
  }
  body[data-theme="dark"] .lb-pay-item-total strong { color: #84c9ff !important; }

  .lb-pay-item-wide {
    grid-column: 1 / -1 !important;
    min-height: 42px !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }
  body[data-theme="dark"] .lb-pay-outstanding { color: #ffbd70 !important; }

  /* =========================================================
     PAYMENT CALCULATION - OWNER FRIENDLY
     Base + GST = Invoice Total / Collected / Balance Due
     Light + Dark / Desktop + Mobile
  ========================================================= */

  .lb-payment-calculation {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  .lb-calc-flow {
    display: grid !important;
    grid-template-columns: minmax(0,1fr) 24px minmax(0,1fr) 24px minmax(0,1.08fr) !important;
    align-items: stretch !important;
    gap: 6px !important;
  }

  .lb-calc-box {
    min-width: 0 !important;
    min-height: 58px !important;
    padding: 9px 10px !important;
    border-radius: 12px !important;
    border: 1px solid #e1e9f3 !important;
    background: #ffffff !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    gap: 4px !important;
  }

  .lb-calc-box span,
  .lb-collection-item span {
    color: #64748b !important;
    font-size: .64rem !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
  }

  .lb-calc-box strong,
  .lb-collection-item strong {
    color: #0b315d !important;
    font-size: .82rem !important;
    font-weight: 900 !important;
    line-height: 1.15 !important;
    white-space: nowrap !important;
  }

  .lb-calc-total {
    background: linear-gradient(145deg,#eff7ff,#f8fbff) !important;
    border-color: #cfe3f7 !important;
  }

  .lb-calc-total strong {
    color: #0f5ea8 !important;
  }

  .lb-calc-symbol {
    display: grid !important;
    place-items: center !important;
    color: #7890a8 !important;
    font-size: 1.02rem !important;
    font-weight: 900 !important;
  }

  .lb-calc-equals {
    color: #0f5ea8 !important;
  }

  .lb-collection-line {
    margin-top: 8px !important;
    padding: 9px 10px !important;
    border-radius: 12px !important;
    border: 1px solid #e1e9f3 !important;
    background: #f8fbff !important;
    display: grid !important;
    grid-template-columns: 1fr 1px 1fr !important;
    align-items: center !important;
    gap: 12px !important;
  }

  .lb-collection-item {
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
  }

  .lb-collection-divider {
    width: 1px !important;
    height: 28px !important;
    background: #dce6f1 !important;
  }

  .lb-balance-item strong.is-clear {
    color: #059669 !important;
  }

  .lb-balance-item strong.is-due {
    color: #d97706 !important;
  }

  body[data-theme="dark"] .lb-calc-box {
    background: rgba(7,27,45,.55) !important;
    border-color: rgba(127,170,211,.08) !important;
  }

  body[data-theme="dark"] .lb-calc-box span,
  body[data-theme="dark"] .lb-collection-item span {
    color: #8199b0 !important;
  }

  body[data-theme="dark"] .lb-calc-box strong,
  body[data-theme="dark"] .lb-collection-item strong {
    color: #f3f8fd !important;
  }

  body[data-theme="dark"] .lb-calc-total {
    background: linear-gradient(145deg,rgba(20,76,128,.28),rgba(7,27,45,.58)) !important;
    border-color: rgba(79,153,220,.16) !important;
  }

  body[data-theme="dark"] .lb-calc-total strong,
  body[data-theme="dark"] .lb-calc-equals {
    color: #84c9ff !important;
  }

  body[data-theme="dark"] .lb-calc-symbol {
    color: #718aa2 !important;
  }

  body[data-theme="dark"] .lb-collection-line {
    background: rgba(7,27,45,.38) !important;
    border-color: rgba(127,170,211,.07) !important;
  }

  body[data-theme="dark"] .lb-collection-divider {
    background: rgba(127,170,211,.10) !important;
  }

  body[data-theme="dark"] .lb-balance-item strong.is-clear {
    color: #27d49b !important;
  }

  body[data-theme="dark"] .lb-balance-item strong.is-due {
    color: #ffbd70 !important;
  }

  @media (max-width: 1100px) {
    .lb-calc-flow {
      grid-template-columns: minmax(0,1fr) 18px minmax(0,1fr) !important;
    }
    .lb-calc-equals {
      display: none !important;
    }
    .lb-calc-total {
      grid-column: 1 / -1 !important;
      min-height: 48px !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
  }

  @media (max-width: 768px) {
    .lb-calc-flow {
      grid-template-columns: minmax(0,1fr) 18px minmax(0,1fr) !important;
      gap: 5px !important;
    }
    .lb-calc-box {
      min-height: 50px !important;
      padding: 8px !important;
      border-radius: 10px !important;
    }
    .lb-calc-box span,
    .lb-collection-item span {
      font-size: .58rem !important;
    }
    .lb-calc-box strong,
    .lb-collection-item strong {
      font-size: .72rem !important;
    }
    .lb-calc-symbol {
      font-size: .88rem !important;
    }
    .lb-collection-line {
      margin-top: 6px !important;
      padding: 8px !important;
      border-radius: 10px !important;
      gap: 8px !important;
    }
  }

  @media (max-width: 420px) {
    .lb-map-card {
      padding:10px !important;
      border-radius:15px !important;
    }

    .lb-map-header h3 {
      font-size:15px !important;
    }

    .lb-map-header p {
      max-width:205px !important;
      font-size:9px !important;
    }

    .lb-map-card > div[style*="padding: 34px"],
    .lb-map-card > div[style*="padding:34px"] {
      padding:18px 12px !important;
      border-radius:13px !important;
      font-size:11px !important;
    }

    .lb-map-box {
      height:132px !important;
    }
    .lb-calc-flow {
      grid-template-columns: 1fr !important;
    }
    .lb-calc-symbol {
      display: none !important;
    }
    .lb-calc-box,
    .lb-calc-total {
      min-height: 42px !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    .lb-calc-total {
      grid-column: auto !important;
    }
    .lb-collection-line {
      grid-template-columns: 1fr !important;
      gap: 6px !important;
    }
    .lb-collection-divider {
      width: 100% !important;
      height: 1px !important;
    }
  }

  body[data-theme="dark"] .lb-payment-success {
    width: fit-content !important;
    margin: 8px 0 0 !important;
    padding: 6px 9px !important;
    border-radius: 999px !important;
    background: rgba(16,185,129,.08) !important;
    border: 1px solid rgba(16,185,129,.12) !important;
    color: #23ca90 !important;
    font-size: .66rem !important;
    line-height: 1 !important;
  }

  .lb-payment-form { margin-top: 8px !important; }

  body[data-theme="dark"] .lb-action-panel select,
  body[data-theme="dark"] .lb-action-panel input {
    background: #0d2741 !important;
    color: #edf6ff !important;
    border-color: rgba(132,174,214,.16) !important;
  }
  body[data-theme="dark"] .lb-action-panel select option { background: #0d2741 !important; color: #edf6ff !important; }

  /* Status history deliberately expands: no nested scrollbar. */
  .lb-history-section,
  .lb-history-box {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .lb-history-box {
    display: grid !important;
    gap: 6px !important;
    padding-right: 0 !important;
    scrollbar-width: none !important;
  }
  .lb-history-box::-webkit-scrollbar { display: none !important; }

  .lb-history-item {
    height: auto !important;
    min-height: 0 !important;
    padding: 8px 9px !important;
    border-radius: 11px !important;
    gap: 3px !important;
  }

  body[data-theme="dark"] .lb-history-item {
    background: rgba(7,27,45,.46) !important;
    border: 1px solid rgba(127,170,211,.055) !important;
    box-shadow: none !important;
  }
  body[data-theme="dark"] .lb-history-item strong { color:#f4f8fd !important; font-size:.75rem !important; }
  body[data-theme="dark"] .lb-history-item span { color:#8da5bb !important; font-size:.68rem !important; line-height:1.25 !important; }
  body[data-theme="dark"] .lb-history-item small { color:#6f879e !important; font-size:.60rem !important; line-height:1.2 !important; }

  /* ---------- TABLET ---------- */
  @media (max-width: 1100px) {
    .lb-action-panel { grid-template-columns: 1fr 1fr !important; }
    .lb-history-section { grid-column: 1 / -1 !important; }
  }

  /* ---------- MOBILE ---------- */
  @media (max-width: 768px) {
    .lb-page { width:100% !important; min-width:0 !important; gap:14px !important; overflow-x:hidden !important; }
    .lb-header-row { display:grid !important; grid-template-columns:1fr auto !important; gap:10px !important; align-items:center !important; }
    .lb-page-title { font-size:22px !important; line-height:1.08 !important; }
    .lb-page-sub { margin-top:4px !important; max-width:245px !important; font-size:10.5px !important; line-height:1.35 !important; }
    .lb-refresh-btn { min-width:42px !important; min-height:42px !important; padding:0 11px !important; border-radius:12px !important; font-size:0 !important; }
    .lb-refresh-btn::after { content:"↻"; font-size:20px; font-weight:900; }

    .lb-map-card {
      width:100% !important;
      min-width:0 !important;
      padding:11px !important;
      border-radius:16px !important;
      overflow:hidden !important;
    }

    .lb-map-header {
      display:grid !important;
      grid-template-columns:minmax(0,1fr) auto !important;
      align-items:start !important;
      gap:8px !important;
      margin-bottom:10px !important;
    }

    .lb-map-header h3 {
      margin:0 !important;
      font-size:16px !important;
      line-height:1.15 !important;
      letter-spacing:-0.2px !important;
    }

    .lb-map-header p {
      margin:4px 0 0 !important;
      max-width:230px !important;
      font-size:9.5px !important;
      line-height:1.35 !important;
    }

    .lb-map-header .badge {
      align-self:start !important;
      padding:6px 9px !important;
      border-radius:999px !important;
      font-size:9px !important;
      line-height:1 !important;
      white-space:nowrap !important;
    }

    .lb-map-card > div[style*="padding: 34px"],
    .lb-map-card > div[style*="padding:34px"] {
      min-height:0 !important;
      padding:22px 14px !important;
      border-radius:14px !important;
      font-size:12px !important;
      line-height:1.45 !important;
    }

    body[data-theme="dark"] .lb-map-card > div[style*="padding: 34px"],
    body[data-theme="dark"] .lb-map-card > div[style*="padding:34px"] {
      color:#d7e5f2 !important;
      background:#102840 !important;
      border-color:rgba(132,174,214,.13) !important;
    }

    .lb-map-grid {
      grid-template-columns:1fr !important;
      gap:8px !important;
    }

    .lb-map-box {
      height:145px !important;
    }

    .lb-summary-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:9px !important; }
    .lb-summary-card { padding:12px 10px !important; gap:9px !important; border-radius:15px !important; }
    .lb-summary-card > div:first-child { width:36px !important; height:36px !important; min-width:36px !important; border-radius:11px !important; }
    .lb-summary-card p { font-size:9px !important; }
    .lb-summary-card h4 { margin-top:3px !important; font-size:17px !important; }

    .lb-topbar { display:grid !important; grid-template-columns:1fr !important; gap:9px !important; padding:12px !important; }
    .lb-tabs { width:100% !important; display:grid !important; grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:5px !important; }
    .lb-tabs button { width:100% !important; min-height:36px !important; padding:6px 3px !important; border-radius:9px !important; font-size:9px !important; }
    .lb-search-box { width:100% !important; min-height:39px !important; padding:7px 10px !important; border-radius:11px !important; }
    .lb-search-box input { min-width:0 !important; font-size:11px !important; }

    .lb-card-list { padding:10px !important; gap:10px !important; }
    .lb-booking-card { width:100% !important; min-width:0 !important; padding:13px !important; border-radius:16px !important; }
    .lb-booking-top { display:grid !important; grid-template-columns:minmax(0,1fr) auto !important; gap:8px !important; align-items:start !important; margin-bottom:11px !important; }
    .lb-booking-top h3 { font-size:14px !important; }
    .lb-booking-top p { font-size:9.5px !important; line-height:1.35 !important; overflow-wrap:anywhere !important; }
    .lb-pdf-btn { grid-column:1 / -1 !important; justify-self:start !important; margin-top:0 !important; min-height:34px !important; padding:0 11px !important; border-radius:9px !important; font-size:9.5px !important; }

    .lb-info-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:7px !important; margin-bottom:10px !important; }
    .lb-info-grid > div { min-width:0 !important; padding:9px !important; border-radius:11px !important; }
    .lb-info-grid p:first-child { margin-bottom:3px !important; font-size:8.5px !important; }
    .lb-info-grid p:last-child { font-size:10px !important; line-height:1.35 !important; overflow-wrap:anywhere !important; }

    .lb-action-panel { grid-template-columns:1fr !important; gap:8px !important; padding:8px !important; border-radius:15px !important; }
    .lb-action-panel > .lb-action-section { padding:10px !important; border-radius:13px !important; }
    .lb-section-head { margin-bottom:7px !important; }
    .lb-section-head > p,.lb-action-section > p:first-child { font-size:.82rem !important; }
    .lb-pay-item { min-height:43px !important; padding:7px 8px !important; }
    .lb-pay-item span { font-size:.58rem !important; }
    .lb-pay-item strong { font-size:.72rem !important; }
    .lb-history-item { padding:8px !important; border-radius:9px !important; }
    .lb-action-panel select,.lb-action-panel input,.lb-action-panel button { min-height:39px !important; border-radius:9px !important; font-size:10px !important; }
  }

  @media (max-width: 420px) {
    .lb-page { gap:11px !important; }
    .lb-payment-summary { grid-template-columns:1fr 1fr !important; }
    .lb-pay-item-wide { grid-column:1 / -1 !important; }
    .lb-status-pill { padding:6px 9px !important; font-size:.68rem !important; }
    .lb-trip-note { font-size:.68rem !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .lb-booking-card,.lb-summary-card,.lb-map-item { animation:none !important; }
    .lb-action-panel button,.lb-tabs button,.lb-refresh-btn,.lb-pdf-btn { transition:none !important; }
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