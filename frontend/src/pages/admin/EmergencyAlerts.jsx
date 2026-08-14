import React, {
  useEffect,
  useState,
} from 'react';
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { motion } from 'framer-motion';

import {
  AlertTriangle,
  Clock,
  Info,
  CheckCircle,
  Wrench,
  X,
  MapPin,
  Truck,
  User,
  Download,
  IndianRupee,
  FileText,
  CalendarClock,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const EmergencyAlerts = () => {
  const [alerts, setAlerts] =
    useState([]);

  const [serviceHistory, setServiceHistory] =
    useState([]);

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [resolveModal, setResolveModal] =
    useState(null);

  const [serviceData, setServiceData] =
    useState({
      workshop: '',
      amount: '',
      mechanic: '',
      notes: '',
    });

  const loadAlerts = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/issues`);

      const data = await res.json();

      const activeIssues =
        Array.isArray(data)
          ? data.filter(
            (item) =>
              item.status !==
              'Resolved'
          )
          : [];

      const resolvedIssues =
        Array.isArray(data)
          ? data.filter(
            (item) =>
              item.status ===
              'Resolved'
          )
          : [];

      setAlerts(activeIssues);

      setServiceHistory(
        resolvedIssues
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getPriorityColor = (
    severity
  ) => {
    const value = String(
      severity || ''
    ).toLowerCase();

    if (value.includes('high'))
      return '#ef4444';

    if (value.includes('medium'))
      return '#f59e0b';

    return '#3b82f6';
  };

  const getTruckNumber = (
    alert
  ) =>
    alert?.truck?.truckNumber ||
    alert?.truck?.number ||
    alert?.truck?.vehicleNumber ||
    'N/A';

  const getDriverName = (
    alert
  ) =>
    alert?.driver?.name ||
    alert?.driver?.driverName ||
    'N/A';

  const handleResolve = async (
    issueId
  ) => {
    try {
      const payload = {
        workshop:
          serviceData.workshop,

        amount: Number(
          serviceData.amount
        ),

        mechanic:
          serviceData.mechanic,

        notes:
          serviceData.notes,

        invoiceNumber:
          'INV-' +
          Math.floor(
            100000 +
            Math.random() *
            900000
          ),

        resolvedAt:
          new Date(),

        nextServiceDate:
          new Date(
            Date.now() +
            30 *
            24 *
            60 *
            60 *
            1000
          ),
      };

      const res = await fetchWithAuth(
        `${API_URL}/issues/${issueId}/resolve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
          'Resolve failed'
        );

        return;
      }

      alert(
        'Issue resolved successfully ✅'
      );

      setResolveModal(null);

      setServiceData({
        workshop: '',
        amount: '',
        mechanic: '',
        notes: '',
      });

      loadAlerts();
    } catch (error) {
      console.log(error);

      alert(
        'Resolve failed'
      );
    }
  };

  const downloadMonthlyPDF =
    () => {
      const rows =
        serviceHistory
          .map(
            (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.issueType}</td>
          <td>${item.truck
                ?.truckNumber ||
              'N/A'
              }</td>
          <td>${item.driver?.name ||
              'N/A'
              }</td>
          <td>${item.serviceDetails
                ?.workshop || ''
              }</td>
          <td>₹${item.serviceDetails
                ?.amount || 0
              }</td>
          <td>
            ${item.createdAt
                ? new Date(
                  item.createdAt
                ).toLocaleDateString()
                : ''
              }
          </td>
          <td>
            ${item
                .serviceDetails
                ?.resolvedAt
                ? new Date(
                  item
                    .serviceDetails
                    .resolvedAt
                ).toLocaleDateString()
                : ''
              }
          </td>
        </tr>
      `
          )
          .join('');

      const html = `
      <html>
        <head>
          <title>
            Monthly Service Report
          </title>

          <style>
            body{
              font-family:Arial;
              padding:30px;
            }

            h1{
              color:#0f172a;
            }

            table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            }

            th,td{
              border:1px solid #ddd;
              padding:12px;
              text-align:left;
            }

            th{
              background:#0f172a;
              color:white;
            }
          </style>
        </head>

        <body>
          <h1>
            Eagle Transport
          </h1>

          <p>
            Monthly Vehicle Service History
          </p>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Issue</th>
                <th>Truck</th>
                <th>Driver</th>
                <th>Workshop</th>
                <th>Amount</th>
                <th>Issue Date</th>
                <th>Resolved Date</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

      const win = window.open(
        '',
        '',
        'width=1200,height=800'
      );

      win.document.write(html);

      win.document.close();

      win.print();
    };

  return (
    <>
      <div
        className="ea-header"
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h1
            className="ea-title"
            style={{
              margin: 0,
              fontSize: '2rem',
            }}
          >
            Emergency Alerts
          </h1>

          <p
            style={{
              color: '#64748b',
            }}
          >
            Live truck emergency
            issues & service
            management
          </p>
        </div>

        <button
          className="ea-download-btn"
          onClick={
            downloadMonthlyPDF
          }
          style={{
            background:
              '#0f172a',
            color: '#fff',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <Download size={18} />
          Download Monthly PDF
        </button>
      </div>

      <div
        className="ea-alert-list"
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {alerts.length === 0 ? (
          <div
            className="ea-empty"
            style={{
              background: '#fff',
              padding: '45px',
              borderRadius: '24px',
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            ✅ No Active Emergency
            Alerts
          </div>
        ) : (
          alerts.map(
            (alert, idx) => {
              const color =
                getPriorityColor(
                  alert.severity
                );

              return (
                <motion.div
                  className="ea-alert-card"
                  key={
                    alert._id
                  }
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      idx * 0.05,
                  }}
                  style={{
                    background:
                      '#fff',
                    borderRadius:
                      '24px',
                    padding: '24px',
                    borderLeft: `8px solid ${color}`,
                  }}
                >
                  <div
                    className="ea-alert-row"
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      gap: '20px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div
                      className="ea-alert-content"
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        className="ea-alert-heading"
                        style={{
                          display:
                            'flex',
                          gap: '12px',
                          alignItems:
                            'center',
                          marginBottom:
                            '12px',
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <AlertTriangle
                          color={
                            color
                          }
                        />

                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {
                            alert.issueType
                          }
                        </h3>

                        <span
                          style={{
                            background:
                              color,
                            color:
                              '#fff',
                            padding:
                              '6px 12px',
                            borderRadius:
                              '999px',
                            fontSize:
                              '12px',
                          }}
                        >
                          {
                            alert.severity
                          }
                        </span>
                      </div>

                      <p className="ea-description">
                        {
                          alert.description
                        }
                      </p>

                      <div
                        className="ea-meta"
                        style={{
                          display:
                            'flex',
                          gap: '16px',
                          flexWrap:
                            'wrap',
                          color:
                            '#64748b',
                        }}
                      >
                        <span>
                          <Truck
                            size={
                              14
                            }
                          />{' '}
                          {getTruckNumber(
                            alert
                          )}
                        </span>

                        <span>
                          <User
                            size={
                              14
                            }
                          />{' '}
                          {getDriverName(
                            alert
                          )}
                        </span>

                        <span>
                          <MapPin
                            size={
                              14
                            }
                          />{' '}
                          {
                            alert.location
                          }
                        </span>

                        <span>
                          <Clock
                            size={
                              14
                            }
                          />{' '}
                          {new Date(
                            alert.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className="ea-actions"
                      style={{
                        display:
                          'flex',
                        gap: '12px',
                        alignItems:
                          'center',
                      }}
                    >
                      <button
                        className="ea-resolve-action"
                        onClick={() =>
                          setResolveModal(
                            alert
                          )
                        }
                        style={{
                          border:
                            'none',
                          background:
                            'linear-gradient(135deg,#16a34a,#15803d)',
                          color:
                            '#fff',
                          padding:
                            '12px 18px',
                          borderRadius:
                            '14px',
                          fontWeight: 700,
                          cursor:
                            'pointer',
                        }}
                      >
                        Resolve
                      </button>

                      <button
                        className="ea-details-action"
                        onClick={() =>
                          setSelectedAlert(
                            alert
                          )
                        }
                        style={{
                          border:
                            '1px solid #dbe4ee',
                          background:
                            '#fff',
                          padding:
                            '12px 18px',
                          borderRadius:
                            '14px',
                          fontWeight: 700,
                          cursor:
                            'pointer',
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }
          )
        )}
      </div>

      {resolveModal && (
        <div
          className="ea-modal-overlay"
          style={styles.overlay}
        >
          <div
            className="ea-modal"
            style={styles.modal}
          >
            <div
              className="ea-modal-header"
              style={
                styles.modalHeader
              }
            >
              <h2>
                Complete Service
              </h2>

              <button
                className="ea-close-btn"
                onClick={() =>
                  setResolveModal(
                    null
                  )
                }
                style={
                  styles.closeBtn
                }
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="ea-form-grid"
              style={styles.formGrid}
            >
              <input
                placeholder="Workshop Name"
                value={
                  serviceData.workshop
                }
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    workshop:
                      e.target
                        .value,
                  })
                }
                className="ea-input"
                style={
                  styles.input
                }
              />

              <input
                className="ea-input"
                placeholder="Service Amount"
                type="number"
                value={
                  serviceData.amount
                }
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    amount:
                      e.target
                        .value,
                  })
                }
                style={
                  styles.input
                }
              />

              <input
                className="ea-input"
                placeholder="Mechanic Name"
                value={
                  serviceData.mechanic
                }
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    mechanic:
                      e.target
                        .value,
                  })
                }
                style={
                  styles.input
                }
              />

              <textarea
                rows={4}
                placeholder="Repair Notes"
                value={
                  serviceData.notes
                }
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    notes:
                      e.target
                        .value,
                  })
                }
                className="ea-input"
                style={
                  styles.input
                }
              />
            </div>

            <button
              className="ea-complete-btn"
              onClick={() =>
                handleResolve(
                  resolveModal._id
                )
              }
              style={
                styles.resolveBtn
              }
            >
              <CheckCircle
                size={18}
              />
              Complete Service
            </button>
          </div>
        </div>
      )}

      <style>{mobileCss}</style>
    </>
  );
};


const mobileCss = `
  @media (max-width: 768px) {
    .ea-header {
      align-items: flex-start !important;
      margin-bottom: 14px !important;
      gap: 10px !important;
    }

    .ea-title {
      font-size: 22px !important;
      line-height: 1.1 !important;
      letter-spacing: -0.45px !important;
      color: #0b315d !important;
    }

    .ea-header p {
      margin: 5px 0 0 !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
      max-width: 240px !important;
    }

    .ea-download-btn {
      min-height: 39px !important;
      padding: 0 12px !important;
      border-radius: 11px !important;
      gap: 6px !important;
      font-size: 10.5px !important;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .ea-download-btn svg {
      width: 15px !important;
      height: 15px !important;
    }

    .ea-alert-list {
      gap: 10px !important;
    }

    .ea-empty {
      padding: 24px 14px !important;
      border-radius: 17px !important;
      font-size: 12px !important;
      box-shadow: 0 8px 22px rgba(15, 59, 115, .06) !important;
    }

    .ea-alert-card {
      padding: 14px !important;
      border-radius: 18px !important;
      border-left-width: 5px !important;
      box-shadow: 0 10px 24px rgba(15, 59, 115, .07) !important;
      overflow: hidden !important;
    }

    .ea-alert-row {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }

    .ea-alert-content {
      min-width: 0 !important;
    }

    .ea-alert-heading {
      display: grid !important;
      grid-template-columns: auto 1fr auto !important;
      gap: 8px !important;
      margin-bottom: 8px !important;
      align-items: center !important;
    }

    .ea-alert-heading > svg {
      width: 18px !important;
      height: 18px !important;
    }

    .ea-alert-heading h3 {
      min-width: 0 !important;
      font-size: 14px !important;
      line-height: 1.25 !important;
      color: #0b315d !important;
      overflow-wrap: anywhere !important;
    }

    .ea-alert-heading span {
      padding: 5px 8px !important;
      font-size: 8.5px !important;
      font-weight: 800 !important;
    }

    .ea-description {
      margin: 0 0 10px !important;
      font-size: 11px !important;
      line-height: 1.45 !important;
      color: #536a86 !important;
    }

    .ea-meta {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 7px !important;
      color: #64748b !important;
    }

    .ea-meta span {
      min-width: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 7px 8px !important;
      border-radius: 10px !important;
      background: #f7faff !important;
      border: 1px solid #e7eef7 !important;
      font-size: 9px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    .ea-meta svg {
      flex-shrink: 0 !important;
      width: 12px !important;
      height: 12px !important;
      color: #0f5b9e !important;
    }

    .ea-actions {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }

    .ea-actions button {
      width: 100% !important;
      min-height: 40px !important;
      padding: 0 10px !important;
      border-radius: 11px !important;
      font-size: 10.5px !important;
      box-shadow: 0 6px 16px rgba(15, 59, 115, .08) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }

    .ea-details-action {
      color: #0b4f8a !important;
      border-color: #d3e3f4 !important;
      background: linear-gradient(145deg, #fff, #f2f7fd) !important;
    }

    .ea-modal-overlay {
      padding: 14px !important;
      background: rgba(3, 16, 31, .58) !important;
      backdrop-filter: blur(3px) !important;
      -webkit-backdrop-filter: blur(3px) !important;
    }

    .ea-modal {
      width: min(100%, 340px) !important;
      max-width: 340px !important;
      max-height: calc(100dvh - 28px) !important;
      overflow-y: auto !important;
      padding: 17px !important;
      border-radius: 20px !important;
      box-shadow: 0 22px 55px rgba(2, 20, 40, .24) !important;
      animation: eaModalIn .2s ease-out both !important;
      scrollbar-width: none !important;
    }

    .ea-modal::-webkit-scrollbar { display: none !important; }

    .ea-modal-header {
      align-items: center !important;
      margin-bottom: 13px !important;
    }

    .ea-modal-header h2 {
      margin: 0 !important;
      font-size: 18px !important;
      line-height: 1.1 !important;
      color: #0b315d !important;
    }

    .ea-close-btn {
      width: 34px !important;
      height: 34px !important;
      border-radius: 10px !important;
      display: grid !important;
      place-items: center !important;
      padding: 0 !important;
    }

    .ea-form-grid {
      gap: 9px !important;
    }

    .ea-input {
      min-height: 42px !important;
      padding: 10px 11px !important;
      border-radius: 11px !important;
      font-size: 11px !important;
      box-sizing: border-box !important;
      background: #fbfdff !important;
      transition: border-color .16s ease, box-shadow .16s ease !important;
    }

    textarea.ea-input {
      min-height: 82px !important;
      resize: vertical !important;
    }

    .ea-input:focus {
      border-color: #4c90cf !important;
      box-shadow: 0 0 0 3px rgba(15, 91, 158, .08) !important;
    }

    .ea-complete-btn {
      margin-top: 12px !important;
      min-height: 43px !important;
      padding: 0 12px !important;
      border-radius: 12px !important;
      font-size: 11px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 7px !important;
      box-shadow: 0 9px 20px rgba(21, 128, 61, .16) !important;
    }

    .ea-download-btn:active,
    .ea-actions button:active,
    .ea-complete-btn:active {
      transform: scale(.97) !important;
    }

    @keyframes eaModalIn {
      from { opacity: 0; transform: translateY(8px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  }

  @media (max-width: 420px) {
    .ea-header {
      margin-bottom: 12px !important;
    }

    .ea-title {
      font-size: 20px !important;
    }

    .ea-download-btn {
      width: 100% !important;
      justify-content: center !important;
    }

    .ea-alert-card {
      padding: 12px !important;
      border-radius: 16px !important;
    }

    .ea-meta {
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
    }

    .ea-meta span {
      padding: 6px 7px !important;
      font-size: 8.5px !important;
    }

    .ea-actions button {
      min-height: 38px !important;
      font-size: 10px !important;
    }

    .ea-modal {
      max-width: 310px !important;
      padding: 15px !important;
      border-radius: 18px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ea-modal,
    .ea-download-btn,
    .ea-actions button,
    .ea-complete-btn {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'center',
    zIndex: 9999,
  },

  modal: {
    width: '100%',
    maxWidth: '700px',
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
  },

  modalHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    marginBottom: '20px',
  },

  closeBtn: {
    border: 'none',
    background: '#f1f5f9',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  formGrid: {
    display: 'grid',
    gap: '16px',
  },

  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border:
      '1px solid #dbe4ee',
    outline: 'none',
  },

  resolveBtn: {
    marginTop: '20px',
    width: '100%',
    border: 'none',
    background:
      'linear-gradient(135deg,#16a34a,#15803d)',
    color: '#fff',
    padding: '16px',
    borderRadius: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default EmergencyAlerts;