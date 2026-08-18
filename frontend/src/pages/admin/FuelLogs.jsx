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

const API_URL = import.meta.env.VITE_API_URL;

const FuelLogs = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [downloadingReport, setDownloadingReport] = useState('');

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



  const downloadReport = async (format) => {
    try {
      setDownloadingReport(format);
      setError('');

      const res = await fetchWithAuth(
        `${API_URL}/bookings/reports/fuel.${format}`
      );

      if (!res.ok) {
        throw new Error(`Fuel ${format.toUpperCase()} download failed: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `Eagle_Transport_Fuel_Report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Fuel report download error:', err);
      setError(`Unable to download fuel ${format.toUpperCase()} report.`);
    } finally {
      setDownloadingReport('');
    }
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
    <div className="fuel-mobile-page" style={styles.pageWrap}>
      <motion.div
        className="card fuel-hero"
        style={styles.heroCard}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="fuel-hero-badge" style={styles.heroBadge}>Fuel Management</div>
          <h2 className="fuel-hero-title" style={styles.heroTitle}>Diesel, KM & Mileage Report</h2>
          <p className="fuel-hero-text" style={styles.heroText}>
            Track diesel consumption, trip kilometers, fuel expenses, and truck-wise mileage from backend fuel records.
          </p>
        </div>

        <div className="fuel-hero-actions" style={styles.heroActions}>
          <button
            type="button"
            className="fuel-refresh-btn"
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

          <button
            type="button"
            className="fuel-export-btn"
            style={styles.exportBtn}
            onClick={() => downloadReport('pdf')}
            disabled={Boolean(downloadingReport)}
          >
            {downloadingReport === 'pdf' ? 'Downloading...' : '📄 Fuel PDF'}
          </button>

          <button
            type="button"
            className="fuel-export-btn"
            style={styles.exportBtn}
            onClick={() => downloadReport('csv')}
            disabled={Boolean(downloadingReport)}
          >
            {downloadingReport === 'csv' ? 'Downloading...' : '📊 Fuel CSV'}
          </button>
        </div>
      </motion.div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="fuel-summary-grid" style={styles.summaryGrid}>
        <motion.div className="glass-card fuel-summary-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
            <Fuel size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Diesel</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.totalLiters)} L</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card fuel-summary-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
            <IndianRupee size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Fuel Cost</p>
            <h3 style={styles.summaryValue}>{formatMoney(summary.totalAmount)}</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card fuel-summary-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(37,99,235,0.12)', color: 'var(--primary-blue)' }}>
            <Truck size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total KM</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.totalKm)} km</h3>
          </div>
        </motion.div>

        <motion.div className="glass-card fuel-summary-card" style={styles.summaryCard} whileHover={{ y: -4 }}>
          <div style={{ ...styles.iconWrap, background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
            <Gauge size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Avg Mileage</p>
            <h3 style={styles.summaryValue}>{formatNumber(summary.avgMileage, 2)} km/L</h3>
          </div>
        </motion.div>
      </div>

      <div className="card fuel-insight-card" style={styles.insightCard}>
        <div className="fuel-insight-item" style={styles.insightItem}>
          <span style={styles.insightLabel}>Total Fuel Entries</span>
          <strong>{summary.totalEntries}</strong>
        </div>

        <div className="fuel-insight-item" style={styles.insightItem}>
          <span style={styles.insightLabel}>Latest Entry</span>
          <strong>
            {summary.latestEntry?.createdAt
              ? new Date(summary.latestEntry.createdAt).toLocaleString('en-IN')
              : 'No entry yet'}
          </strong>
        </div>

        <div className="fuel-insight-item" style={styles.insightItem}>
          <span style={styles.insightLabel}>Latest Truck</span>
          <strong>{summary.latestEntry ? getTruckNumber(summary.latestEntry) : 'Not available'}</strong>
        </div>
      </div>

      <div className="card fuel-history-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="fuel-table-header" style={styles.tableHeader}>
          <div style={styles.tableHeaderTitle}>
            <Fuel size={20} color="var(--text-muted)" />
            <h3 style={{ margin: 0 }}>Fuel Log History</h3>
          </div>

          <span style={styles.autoRefreshText}>Auto refresh: 2 min</span>
        </div>

        {loading ? (
          <div className="fuel-empty-box" style={styles.emptyBox}>Loading fuel logs...</div>
        ) : fuelLogs.length === 0 ? (
          <div className="fuel-empty-box" style={styles.emptyBox}>No fuel logs found. Driver fuel entries will appear here.</div>
        ) : (
          <div className="fuel-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="fuel-table" style={styles.table}>
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
                      className="fuel-row"
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.035 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td className="fuel-cell" data-label="Truck & Driver" style={styles.td}>
                        <p style={styles.mainText}>
                          <Truck size={15} /> {getTruckNumber(log)}
                        </p>
                        <p style={styles.subText}>
                          <User size={14} /> {getDriverName(log)}
                        </p>
                      </td>

                      <td className="fuel-cell" data-label="Fuel Details" style={styles.td}>
                        <p style={styles.mainText}>{formatNumber(liters)} L Diesel</p>
                        <p style={styles.subText}>
                          {log.pumpName || log.fuelStation || 'Fuel station not added'}
                        </p>
                      </td>

                      <td className="fuel-cell" data-label="KM & Mileage" style={styles.td}>
                        <p style={styles.mainText}>{formatNumber(km)} km</p>
                        <p style={styles.subText}>
                          Mileage: {mileage ? `${formatNumber(mileage, 2)} km/L` : 'Not calculated'}
                        </p>
                      </td>

                      <td className="fuel-cell" data-label="Location / Route" style={styles.td}>
                        <p style={styles.mainText}>
                          <MapPin size={15} /> {log.place || log.location || 'Place not added'}
                        </p>
                        <p style={styles.subText}>{getBookingRoute(log)}</p>
                      </td>

                      <td className="fuel-cell" data-label="Date" style={styles.td}>
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

                      <td className="fuel-cell fuel-amount-cell" data-label="Amount" style={styles.td}>
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

      <style>{mobileCss}</style>
    </div>
  );
};


const mobileCss = `
  @media (max-width: 768px) {
    .fuel-mobile-page {
      gap: 14px !important;
      width: 100% !important;
      min-width: 0 !important;
    }

    .fuel-hero {
      padding: 18px !important;
      border-radius: 20px !important;
      gap: 14px !important;
      align-items: flex-start !important;
      box-shadow: 0 14px 32px rgba(13, 45, 82, .18) !important;
      overflow: hidden !important;
    }

    .fuel-hero > div:first-child {
      min-width: 0 !important;
    }

    .fuel-hero-badge {
      padding: 6px 10px !important;
      margin-bottom: 9px !important;
      font-size: 9.5px !important;
      letter-spacing: .2px !important;
    }

    .fuel-hero-title {
      font-size: 22px !important;
      line-height: 1.12 !important;
      letter-spacing: -.45px !important;
    }

    .fuel-hero-text {
      margin-top: 7px !important;
      max-width: 100% !important;
      font-size: 11px !important;
      line-height: 1.5 !important;
    }

    .fuel-hero-actions {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1.2fr 1fr 1fr !important;
      gap: 7px !important;
      justify-content: stretch !important;
    }

    .fuel-refresh-btn,
    .fuel-export-btn {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 39px !important;
      padding: 0 8px !important;
      border-radius: 11px !important;
      justify-content: center !important;
      gap: 5px !important;
      font-size: 9.5px !important;
      white-space: nowrap !important;
      box-shadow: 0 7px 16px rgba(0, 0, 0, .10) !important;
      transition: transform .16s ease, background .16s ease !important;
    }

    .fuel-refresh-btn svg {
      width: 14px !important;
      height: 14px !important;
    }

    .fuel-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
    }

    .fuel-summary-card {
      min-width: 0 !important;
      padding: 12px 10px !important;
      gap: 9px !important;
      border-radius: 15px !important;
      box-shadow: 0 8px 20px rgba(15, 59, 115, .06) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .fuel-summary-card > div:first-child {
      width: 37px !important;
      height: 37px !important;
      min-width: 37px !important;
      padding: 0 !important;
      border-radius: 11px !important;
    }

    .fuel-summary-card > div:first-child svg {
      width: 17px !important;
      height: 17px !important;
    }

    .fuel-summary-card p {
      font-size: 9px !important;
      line-height: 1.25 !important;
    }

    .fuel-summary-card h3 {
      margin-top: 3px !important;
      font-size: 16px !important;
      line-height: 1.1 !important;
      overflow-wrap: anywhere !important;
    }

    .fuel-insight-card {
      padding: 10px !important;
      border-radius: 17px !important;
      grid-template-columns: 1fr !important;
      gap: 7px !important;
    }

    .fuel-insight-item {
      padding: 10px 11px !important;
      border-radius: 11px !important;
      gap: 3px !important;
    }

    .fuel-insight-item span {
      font-size: 9px !important;
    }

    .fuel-insight-item strong {
      font-size: 11px !important;
      line-height: 1.35 !important;
      overflow-wrap: anywhere !important;
    }

    .fuel-history-card {
      border-radius: 18px !important;
      overflow: hidden !important;
      box-shadow: 0 10px 26px rgba(15, 59, 115, .06) !important;
    }

    .fuel-table-header {
      padding: 12px 13px !important;
      gap: 8px !important;
    }

    .fuel-table-header h3 {
      font-size: 14px !important;
      color: #0b315d !important;
    }

    .fuel-table-header svg {
      width: 16px !important;
      height: 16px !important;
    }

    .fuel-table-header > span {
      padding: 5px 7px !important;
      font-size: 8.5px !important;
    }

    .fuel-empty-box {
      min-height: 108px !important;
      padding: 20px 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      font-size: 12px !important;
      line-height: 1.45 !important;
      border-top: 1px solid var(--border-light) !important;
      box-sizing: border-box !important;
    }

    body[data-theme="dark"] .fuel-empty-box,
    html[data-theme="dark"] .fuel-empty-box {
      color: #9db2c7 !important;
      background: #0d2741 !important;
      border-top-color: rgba(132, 174, 214, 0.12) !important;
    }

    .fuel-table-wrap {
      overflow: visible !important;
      padding: 9px !important;
      background: #f7faff !important;
    }

    .fuel-table {
      width: 100% !important;
      min-width: 0 !important;
      display: block !important;
      border-collapse: separate !important;
    }

    .fuel-table thead {
      display: none !important;
    }

    .fuel-table tbody {
      width: 100% !important;
      display: grid !important;
      gap: 9px !important;
    }

    .fuel-row {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 7px !important;
      padding: 10px !important;
      border: 1px solid #e3ebf5 !important;
      border-radius: 15px !important;
      background: #fff !important;
      box-shadow: 0 6px 16px rgba(15, 59, 115, .05) !important;
      animation: fuelCardIn .25s ease both !important;
    }

    .fuel-cell {
      display: block !important;
      min-width: 0 !important;
      padding: 8px !important;
      border: 1px solid #e8eef6 !important;
      border-radius: 10px !important;
      background: #f9fbfe !important;
      vertical-align: top !important;
    }

    .fuel-cell::before {
      content: attr(data-label);
      display: block;
      margin-bottom: 4px;
      color: #73849a;
      font-size: 7.5px;
      line-height: 1.1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .fuel-cell p {
      min-width: 0 !important;
      overflow-wrap: anywhere !important;
    }

    .fuel-cell p:first-of-type {
      margin-bottom: 3px !important;
      font-size: 10px !important;
      line-height: 1.3 !important;
    }

    .fuel-cell p:last-of-type {
      font-size: 8.5px !important;
      line-height: 1.3 !important;
    }

    .fuel-cell svg {
      width: 11px !important;
      height: 11px !important;
      flex-shrink: 0 !important;
    }

    .fuel-amount-cell {
      background: #f2fbf7 !important;
      border-color: #d9f2e6 !important;
    }

    .fuel-amount-cell p:first-of-type {
      color: #05845e !important;
      font-size: 11px !important;
    }

    .fuel-refresh-btn:active,
    .fuel-export-btn:active,
    .fuel-summary-card:active {
      transform: scale(.97) !important;
    }

    @keyframes fuelCardIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }

  @media (max-width: 420px) {
    .fuel-history-card {
      border-radius: 16px !important;
    }

    .fuel-table-header {
      padding: 10px 11px !important;
    }

    .fuel-table-header h3 {
      font-size: 13px !important;
    }

    .fuel-table-header > span {
      padding: 4px 6px !important;
      font-size: 8px !important;
    }

    .fuel-empty-box {
      min-height: 92px !important;
      padding: 16px 13px !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
    }
    .fuel-mobile-page {
      gap: 12px !important;
    }

    .fuel-hero {
      padding: 15px !important;
      border-radius: 18px !important;
    }

    .fuel-hero-title {
      font-size: 20px !important;
    }

    .fuel-hero-actions {
      grid-template-columns: 1fr 1fr !important;
    }

    .fuel-refresh-btn {
      grid-column: 1 / -1 !important;
    }

    .fuel-refresh-btn,
    .fuel-export-btn {
      min-height: 38px !important;
      font-size: 9px !important;
    }

    .fuel-summary-grid {
      gap: 7px !important;
    }

    .fuel-summary-card {
      padding: 10px 9px !important;
    }

    .fuel-summary-card > div:first-child {
      width: 34px !important;
      height: 34px !important;
      min-width: 34px !important;
    }

    .fuel-summary-card h3 {
      font-size: 14px !important;
    }

    .fuel-row {
      gap: 6px !important;
      padding: 8px !important;
      border-radius: 13px !important;
    }

    .fuel-cell {
      padding: 7px !important;
      border-radius: 9px !important;
    }

    .fuel-cell::before {
      font-size: 7px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fuel-row,
    .fuel-refresh-btn,
    .fuel-export-btn,
    .fuel-summary-card {
      animation: none !important;
      transition: none !important;
    }
  }
`;

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