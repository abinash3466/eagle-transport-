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
      const res = await fetch(
        'http://localhost:5000/api/issues'
      );

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

      const res = await fetch(
        `http://localhost:5000/api/issues/${issueId}/resolve`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload
          ),
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
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {alerts.length === 0 ? (
          <div
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
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
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

                      <p>
                        {
                          alert.description
                        }
                      </p>

                      <div
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
                      style={{
                        display:
                          'flex',
                        gap: '12px',
                        alignItems:
                          'center',
                      }}
                    >
                      <button
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
          style={styles.overlay}
        >
          <div
            style={styles.modal}
          >
            <div
              style={
                styles.modalHeader
              }
            >
              <h2>
                Complete Service
              </h2>

              <button
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
                style={
                  styles.input
                }
              />

              <input
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
                style={
                  styles.input
                }
              />
            </div>

            <button
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
    </>
  );
};

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