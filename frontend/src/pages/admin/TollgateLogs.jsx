import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { CreditCard, History, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const TollgateLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTollLogs = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetchWithAuth(`${API_URL}/toll`);

      if (!res.ok) {
        throw new Error(`Toll logs API failed with status ${res.status}`);
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Toll logs fetch error:', error);
      setError('Unable to load toll logs. Please check backend /api/toll route.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTollLogs();
    const timer = setInterval(loadTollLogs, 60000);
    return () => clearInterval(timer);
  }, []);

  const normalizeStatus = (status) => {
    const value = String(status || '').toLowerCase().trim();

    if (value.includes('pending') || value.includes('review')) return 'Pending';
    if (value.includes('failed') || value.includes('reject')) return 'Failed';
    if (value.includes('paid') || value.includes('success') || value === '') return 'Paid';

    return status || 'Paid';
  };

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === 'Pending') {
      return {
        label: 'Pending',
        style: styles.badgeWarning,
      };
    }

    if (normalized === 'Failed') {
      return {
        label: 'Failed',
        style: styles.badgeDanger,
      };
    }

    return {
      label: 'Paid',
      style: styles.badgeSuccess,
    };
  };

  const totalAmount = useMemo(() => {
    return logs.reduce((sum, log) => sum + Number(log.amount || 0), 0);
  }, [logs]);

  const paidAmount = useMemo(() => {
    return logs
      .filter((log) => normalizeStatus(log.status) === 'Paid')
      .reduce((sum, log) => sum + Number(log.amount || 0), 0);
  }, [logs]);

  const pendingAmount = useMemo(() => {
    return logs
      .filter((log) => normalizeStatus(log.status) === 'Pending')
      .reduce((sum, log) => sum + Number(log.amount || 0), 0);
  }, [logs]);

  const paidCount = useMemo(() => {
    return logs.filter((log) => normalizeStatus(log.status) === 'Paid').length;
  }, [logs]);

  const pendingCount = useMemo(() => {
    return logs.filter((log) => normalizeStatus(log.status) === 'Pending').length;
  }, [logs]);

  const getTruckNumber = (log) =>
    log.truck?.number ||
    log.truck?.truckNumber ||
    log.truck?.vehicleNumber ||
    log.truckNumber ||
    log.vehicleNumber ||
    'Not Assigned';

  const getDriverName = (log) =>
    log.driver?.name ||
    log.driver?.driverName ||
    log.driverName ||
    'Driver not assigned';

  const getRoute = (log) => {
    const pickup = log.booking?.pickup || log.pickup || 'Pickup';
    const drop = log.booking?.drop || log.drop || 'Drop';
    return `${pickup} → ${drop}`;
  };

  const getTollgateName = (log) =>
    log.tollgate ||
    log.tollGate ||
    log.tollName ||
    log.name ||
    'Tollgate not added';

  const getTollPlace = (log) =>
    log.place ||
    log.location ||
    log.city ||
    getRoute(log);

  const getCrossingTime = (log) => {
    const dateValue = log.crossingTime || log.paidAt || log.createdAt || log.updatedAt;
    return dateValue ? new Date(dateValue).toLocaleString('en-IN') : 'No time';
  };

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  return (
    <div className="toll-mobile-page">
      <div className="toll-summary-grid" style={styles.summaryGrid}>
        <div className="glass-card toll-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, backgroundColor: 'rgba(15,74,136,0.1)', color: 'var(--primary-blue)' }}>
            <CreditCard size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Toll Amount</p>
            <h3 style={{ ...styles.summaryValue, color: 'var(--primary-blue)' }}>
              {formatMoney(totalAmount)}
            </h3>
            <p style={styles.summarySub}>{logs.length} toll records</p>
          </div>
        </div>

        <div className="glass-card toll-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Paid Toll Amount</p>
            <h3 style={{ ...styles.summaryValue, color: 'var(--success)' }}>
              {formatMoney(paidAmount)}
            </h3>
            <p style={styles.summarySub}>{paidCount} paid records</p>
          </div>
        </div>

        <div className="glass-card toll-summary-card" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <p style={styles.summaryLabel}>Pending / Review Amount</p>
            <h3 style={{ ...styles.summaryValue, color: 'var(--warning)' }}>
              {formatMoney(pendingAmount)}
            </h3>
            <p style={styles.summarySub}>{pendingCount} pending records</p>
          </div>
        </div>
      </div>

      <div className="card toll-history-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="toll-table-header" style={styles.tableHeader}>
          <div style={styles.tableTitleWrap}>
            <History size={20} color="var(--text-muted)" />
            <h3 style={{ margin: 0 }}>Recent Toll Activity</h3>
          </div>

          <button className="toll-refresh-btn" type="button" style={styles.refreshBtn} onClick={loadTollLogs} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <div style={styles.emptyBox}>Loading toll logs...</div>
        ) : logs.length === 0 ? (
          <div style={styles.emptyBox}>No toll logs found. Driver toll entries will appear here.</div>
        ) : (
          <div className="toll-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="toll-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Truck & Driver</th>
                  <th style={styles.th}>Tollgate Details</th>
                  <th style={styles.th}>Crossing Time</th>
                  <th style={styles.th}>Amount Paid</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const statusInfo = getStatusStyle(log.status);

                  return (
                    <motion.tr
                      className="toll-row"
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td className="toll-cell" data-label="Truck & Driver" style={styles.td}>
                        <p style={styles.mainText}>{getTruckNumber(log)}</p>
                        <p style={styles.subText}>{getDriverName(log)}</p>
                      </td>

                      <td className="toll-cell" data-label="Tollgate Details" style={styles.td}>
                        <p style={styles.mainText}>{getTollgateName(log)}</p>
                        <p style={styles.subText}>{getTollPlace(log)}</p>
                      </td>

                      <td className="toll-cell" data-label="Crossing Time" style={styles.td}>{getCrossingTime(log)}</td>

                      <td className="toll-cell toll-amount-cell" data-label="Amount Paid" style={styles.td}>
                        <p style={styles.mainText}>{formatMoney(log.amount)}</p>
                        <p style={styles.subText}>via {log.paymentMethod || log.mode || 'FASTag'}</p>
                      </td>

                      <td className="toll-cell toll-status-cell" data-label="Status" style={styles.td}>
                        <span style={{ ...styles.badge, ...statusInfo.style }}>{statusInfo.label}</span>
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
    .toll-mobile-page {
      width: 100% !important;
      min-width: 0 !important;
    }

    .toll-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
      margin-bottom: 14px !important;
    }

    .toll-summary-card {
      min-width: 0 !important;
      padding: 12px 10px !important;
      gap: 9px !important;
      border-radius: 15px !important;
      box-shadow: 0 8px 20px rgba(15, 59, 115, .06) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .toll-summary-card:last-child {
      grid-column: 1 / -1 !important;
    }

    .toll-summary-card > div:first-child {
      width: 37px !important;
      height: 37px !important;
      min-width: 37px !important;
      padding: 0 !important;
      border-radius: 11px !important;
      display: grid !important;
      place-items: center !important;
    }

    .toll-summary-card > div:first-child svg {
      width: 17px !important;
      height: 17px !important;
    }

    .toll-summary-card p {
      font-size: 8.8px !important;
      line-height: 1.25 !important;
      overflow-wrap: anywhere !important;
    }

    .toll-summary-card h3 {
      margin-top: 3px !important;
      font-size: 16px !important;
      line-height: 1.1 !important;
      overflow-wrap: anywhere !important;
    }

    .toll-summary-card:last-child {
      display: grid !important;
      grid-template-columns: 37px 1fr !important;
      align-items: center !important;
    }

    .toll-history-card {
      border-radius: 18px !important;
      overflow: hidden !important;
      box-shadow: 0 10px 26px rgba(15, 59, 115, .06) !important;
    }

    .toll-table-header {
      padding: 12px 13px !important;
      gap: 8px !important;
    }

    .toll-table-header h3 {
      font-size: 14px !important;
      line-height: 1.2 !important;
      color: #0b315d !important;
    }

    .toll-table-header svg {
      width: 16px !important;
      height: 16px !important;
    }

    .toll-refresh-btn {
      min-height: 36px !important;
      padding: 0 10px !important;
      border-radius: 10px !important;
      gap: 5px !important;
      font-size: 9.5px !important;
      background: linear-gradient(145deg, #fff, #f3f8fd) !important;
      box-shadow: 0 5px 14px rgba(15, 59, 115, .06) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .toll-refresh-btn svg {
      width: 13px !important;
      height: 13px !important;
    }

    .toll-history-card > div[style*="error"] {
      margin: 10px !important;
      padding: 10px !important;
      border-radius: 11px !important;
      font-size: 10px !important;
    }

    .toll-table-wrap {
      overflow: visible !important;
      padding: 9px !important;
      background: #f7faff !important;
    }

    .toll-table {
      width: 100% !important;
      min-width: 0 !important;
      display: block !important;
      border-collapse: separate !important;
    }

    .toll-table thead {
      display: none !important;
    }

    .toll-table tbody {
      width: 100% !important;
      display: grid !important;
      gap: 9px !important;
    }

    .toll-row {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 7px !important;
      padding: 10px !important;
      border: 1px solid #e3ebf5 !important;
      border-radius: 15px !important;
      background: #fff !important;
      box-shadow: 0 6px 16px rgba(15, 59, 115, .05) !important;
      animation: tollCardIn .24s ease both !important;
    }

    .toll-cell {
      min-width: 0 !important;
      display: block !important;
      padding: 8px !important;
      border: 1px solid #e8eef6 !important;
      border-radius: 10px !important;
      background: #f9fbfe !important;
      font-size: 9px !important;
      line-height: 1.35 !important;
      overflow-wrap: anywhere !important;
    }

    .toll-cell::before {
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

    .toll-cell p:first-of-type {
      margin-bottom: 3px !important;
      font-size: 10px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    .toll-cell p:last-of-type {
      font-size: 8.5px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    .toll-amount-cell {
      background: #f2fbf7 !important;
      border-color: #d9f2e6 !important;
    }

    .toll-amount-cell p:first-of-type {
      color: #05845e !important;
      font-size: 11px !important;
    }

    .toll-status-cell {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      justify-content: center !important;
    }

    .toll-status-cell span {
      padding: 5px 8px !important;
      font-size: 8px !important;
    }

    .toll-refresh-btn:active,
    .toll-summary-card:active {
      transform: scale(.97) !important;
    }

    @keyframes tollCardIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }

  @media (max-width: 420px) {
    .toll-summary-grid {
      gap: 7px !important;
      margin-bottom: 12px !important;
    }

    .toll-summary-card {
      padding: 10px 9px !important;
    }

    .toll-summary-card > div:first-child {
      width: 34px !important;
      height: 34px !important;
      min-width: 34px !important;
    }

    .toll-summary-card h3 {
      font-size: 14px !important;
    }

    .toll-table-header {
      padding: 10px 11px !important;
    }

    .toll-table-header h3 {
      font-size: 13px !important;
    }

    .toll-row {
      gap: 6px !important;
      padding: 8px !important;
      border-radius: 13px !important;
    }

    .toll-cell {
      padding: 7px !important;
      border-radius: 9px !important;
    }

    .toll-cell::before {
      font-size: 7px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toll-row,
    .toll-refresh-btn,
    .toll-summary-card {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const styles = {
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  summaryCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrap: {
    padding: '16px',
    borderRadius: '50%',
  },
  summaryLabel: {
    margin: 0,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  summaryValue: {
    margin: 0,
    fontSize: '1.75rem',
  },
  summarySub: {
    margin: '4px 0 0',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  tableHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tableTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  refreshBtn: {
    border: '1px solid var(--border-light)',
    background: '#fff',
    color: 'var(--dark-blue)',
    padding: '10px 14px',
    borderRadius: '999px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  errorBox: {
    margin: '18px 24px 0',
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(239,68,68,0.08)',
    color: '#b91c1c',
    fontWeight: 700,
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
  },
  th: {
    padding: '16px 24px',
    backgroundColor: 'var(--bg-soft)',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  td: {
    padding: '16px 24px',
  },
  mainText: {
    margin: '0 0 4px 0',
    fontWeight: '700',
    color: 'var(--dark-blue)',
  },
  subText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 800,
    border: '1px solid transparent',
  },
  badgeSuccess: {
    background: 'rgba(16,185,129,0.10)',
    color: '#047857',
    borderColor: 'rgba(16,185,129,0.20)',
  },
  badgeWarning: {
    background: 'rgba(245,158,11,0.12)',
    color: '#b45309',
    borderColor: 'rgba(245,158,11,0.24)',
  },
  badgeDanger: {
    background: 'rgba(239,68,68,0.10)',
    color: '#b91c1c',
    borderColor: 'rgba(239,68,68,0.22)',
  },
};

export default TollgateLogs;