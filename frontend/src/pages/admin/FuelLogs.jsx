import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  Fuel,
  Gauge,
  IndianRupee,
  RefreshCw,
  Truck,
  User,
  MapPin,
  CalendarDays,
  AlertCircle,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const FuelLogs = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFuelLogs = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      setError('');

      const res = await fetchWithAuth(`${API_URL}/fuel`);

      if (!res.ok) {
        throw new Error(`Fuel logs fetch failed: ${res.status}`);
      }

      const data = await res.json();
      setFuelLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fuel logs fetch error:', err);
      setError('Unable to load fuel logs. Please check backend /api/fuel route.');
      setFuelLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFuelLogs();

    // Auto refresh every 2 minutes
    const timer = setInterval(() => {
      loadFuelLogs();
    }, 120000);

    return () => clearInterval(timer);
  }, []);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const formatNumber = (value, digits = 1) =>
    Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: digits,
    });

  const getTruckNumber = (log) =>
    log.truck?.number ||
    log.truck?.truckNumber ||
    log.truck?.vehicleNumber ||
    log.truckNumber ||
    'Not Assigned';

  const getDriverName = (log) =>
    log.driver?.name ||
    log.driver?.driverName ||
    log.driverName ||
    'Driver not assigned';

  const getBookingRoute = (log) => {
    const pickup = log.booking?.pickup || log.pickup || '';
    const drop = log.booking?.drop || log.drop || '';

    if (pickup && drop) return `${pickup} → ${drop}`;
    if (pickup) return pickup;
    if (drop) return drop;

    return log.place || log.location || 'Location not added';
  };

  const getLiters = (log) =>
    Number(log.liters || log.fuelLiters || log.dieselLiters || 0);

  const getAmount = (log) =>
    Number(log.amount || log.totalAmount || log.fuelAmount || 0);

  const getKm = (log) =>
    Number(log.km || log.kilometers || log.distanceKm || log.tripKm || 0);

  const getMileage = (log) => {
    const km = getKm(log);
    const liters = getLiters(log);

    if (!km || !liters) return 0;
    return km / liters;
  };

  const summary = useMemo(() => {
    const totalLiters = fuelLogs.reduce((sum, log) => sum + getLiters(log), 0);
    const totalAmount = fuelLogs.reduce((sum, log) => sum + getAmount(log), 0);
    const totalKm = fuelLogs.reduce((sum, log) => sum + getKm(log), 0);
    const avgMileage = totalLiters > 0 ? totalKm / totalLiters : 0;

    const latestEntry = fuelLogs.length
      ? fuelLogs
          .slice()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0]
      : null;

    return {
      totalLiters,
      totalAmount,
      totalKm,
      avgMileage,
      totalEntries: fuelLogs.length,
      latestEntry,
    };
  }, [fuelLogs]);

  return (
  <div style={styles.pageWrap}>
    <motion.div
      className="card"
      style={styles.heroCard}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <div style={styles.heroBadge}>Fuel Management</div>
        <h2 style={styles.heroTitle}>Diesel, KM & Mileage Report</h2>
        <p style={styles.heroText}>
          Track diesel consumption, trip kilometers, fuel expenses, and truck-wise mileage from backend fuel records.
        </p>
      </div>

      <div style={styles.heroActions}>
        <button
          type="button"
          style={styles.refreshBtn}
          onClick={() => loadFuelLogs(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={18}
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>

        <a
          href="http://localhost:5000/api/bookings/reports/fuel.pdf"
          target="_blank"
          rel="noreferrer"
          style={styles.exportBtn}
        >
          📄 Fuel PDF
        </a>

        <a
          href="http://localhost:5000/api/bookings/reports/fuel.csv"
          style={styles.exportBtn}
        >
          📊 Fuel CSV
        </a>
      </div>
    </motion.div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div style={styles.summaryGrid}>
        <motion.div className="glass-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
            <Fuel size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Diesel</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.totalLiters)} L</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
            <IndianRupee size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Fuel Cost</p>
            <h3 style={styles.summaryValue}>{formatMoney(summary.totalAmount)}</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(37,99,235,0.12)', color: 'var(--primary-blue)' }}>
            <Truck size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total KM</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.totalKm)} km</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
            <Gauge size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Avg Mileage</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.avgMileage, 2)} km/L</h3>
          </div>
        </motion.div>
      </div>

      <div className="card" style={styles.insightCard}>
        <div style={styles.insightItem}>
          <span style={styles.insightLabel}>Total Fuel Entries</span>
          <strong>{summary.totalEntries}</strong>
        </div>

        <div style={styles.insightItem}>
          <span style={styles.insightLabel}>Latest Entry</span>
          <strong>
            {summary.latestEntry?.createdAt
              ? new Date(summary.latestEntry.createdAt).toLocaleString('en-IN')
              : 'No entry yet'}
          </strong>
        </div>

        <div style={styles.insightItem}>
          <span style={styles.insightLabel}>Latest Truck</span>
          <strong>{summary.latestEntry ? getTruckNumber(summary.latestEntry) : 'Not available'}</strong>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={styles.tableHeader}>
          <div style={styles.tableHeaderTitle}>
            <Fuel size={20} color="var(--text-muted)" />
            <h3 style={{ margin: 0 }}>Fuel Log History</h3>
          </div>

          <span style={styles.autoRefreshText}>Auto refresh: 2 min</span>
        </div>

        {loading ? (
          <div style={styles.emptyBox}>Loading fuel logs...</div>
        ) : fuelLogs.length === 0 ? (
          <div style={styles.emptyBox}>No fuel logs found. Driver fuel entries will appear here.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Truck & Driver</th>
                  <th style={styles.th}>Fuel Details</th>
                  <th style={styles.th}>KM & Mileage</th>
                  <th style={styles.th}>Location / Route</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {fuelLogs.map((log, idx) => {
                  const liters = getLiters(log);
                  const amount = getAmount(log);
                  const km = getKm(log);
                  const mileage = getMileage(log);

                  return (
                    <motion.tr
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.035 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td style={styles.td}>
                        <p style={styles.mainText}>
                          <Truck size={15} /> {getTruckNumber(log)}
                        </p>
                        <p style={styles.subText}>
                          <User size={14} /> {getDriverName(log)}
                        </p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>{formatNumber(liters)} L Diesel</p>
                        <p style={styles.subText}>
                          {log.pumpName || log.fuelStation || 'Fuel station not added'}
                        </p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>{formatNumber(km)} km</p>
                        <p style={styles.subText}>
                          Mileage: {mileage ? `${formatNumber(mileage, 2)} km/L` : 'Not calculated'}
                        </p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>
                          <MapPin size={15} /> {log.place || log.location || 'Place not added'}
                        </p>
                        <p style={styles.subText}>{getBookingRoute(log)}</p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>
                          <CalendarDays size={15} />
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleDateString('en-IN')
                            : 'No date'}
                        </p>
                        <p style={styles.subText}>
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleTimeString('en-IN')
                            : 'No time'}
                        </p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.amountText}>{formatMoney(amount)}</p>
                        <p style={styles.subText}>
                          {log.paymentMethod || log.mode || 'Cash / FASTag'}
                        </p>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heroCard: {
    padding: '28px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #0d2d52 0%, #123c6d 55%, #1f5da1 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    fontWeight: '800',
    fontSize: '0.82rem',
    marginBottom: '14px',
  },
  heroTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 900,
  },
  heroText: {
    margin: '10px 0 0',
    color: 'rgba(255,255,255,0.84)',
    maxWidth: '760px',
    lineHeight: 1.7,
  },
  refreshBtn: {
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: '999px',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorBox: {
    padding: '14px 18px',
    borderRadius: '16px',
    background: 'rgba(239,68,68,0.08)',
    color: 'var(--danger)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '20px',
  },
  summaryCard: {
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderRadius: '22px',
  },
  iconWrap: {
    width: '58px',
    height: '58px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryLabel: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  summaryValue: {
    margin: '6px 0 0',
    fontSize: '1.65rem',
    color: 'var(--dark-blue)',
    fontWeight: 900,
  },
  insightCard: {
    padding: '18px',
    borderRadius: '22px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  insightItem: {
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(15,74,136,0.04)',
    border: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: 'var(--dark-blue)',
  },
  insightLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.84rem',
    fontWeight: 700,
  },
  tableHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
  },
  tableHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  autoRefreshText: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(15,74,136,0.08)',
    color: 'var(--primary-blue)',
    fontWeight: 800,
    fontSize: '0.8rem',
  },

  exportBtn: {
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.14)",
    color: "#0400ff",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
},
  emptyBox: {
    padding: '34px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontWeight: 700,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    minWidth: '980px',
  },
  th: {
    padding: '16px 24px',
    backgroundColor: 'var(--bg-soft)',
    color: 'var(--text-muted)',
    fontWeight: '700',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'top',
  },
  mainText: {
    margin: '0 0 5px 0',
    fontWeight: '800',
    color: 'var(--dark-blue)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  subText: {
    margin: 0,
    fontSize: '0.84rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  amountText: {
    margin: '0 0 5px 0',
    fontWeight: '900',
    color: 'var(--success)',
    fontSize: '1rem',
  },

  heroActions: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "12px",
  flexWrap: "wrap",
},

exportBtn: {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: "999px",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
},
};

export default FuelLogs;
