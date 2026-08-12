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
    <div>
      <div style={styles.summaryGrid}>
        <div className="glass-card" style={styles.summaryCard}>
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

        <div className="glass-card" style={styles.summaryCard}>
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

        <div className="glass-card" style={styles.summaryCard}>
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitleWrap}>
            <History size={20} color="var(--text-muted)" />
            <h3 style={{ margin: 0 }}>Recent Toll Activity</h3>
          </div>

          <button type="button" style={styles.refreshBtn} onClick={loadTollLogs} disabled={loading}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
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
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td style={styles.td}>
                        <p style={styles.mainText}>{getTruckNumber(log)}</p>
                        <p style={styles.subText}>{getDriverName(log)}</p>
                      </td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>{getTollgateName(log)}</p>
                        <p style={styles.subText}>{getTollPlace(log)}</p>
                      </td>

                      <td style={styles.td}>{getCrossingTime(log)}</td>

                      <td style={styles.td}>
                        <p style={styles.mainText}>{formatMoney(log.amount)}</p>
                        <p style={styles.subText}>via {log.paymentMethod || log.mode || 'FASTag'}</p>
                      </td>

                      <td style={styles.td}>
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
    </div>
  );
};

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
