import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { authHeader } from "../../utils/authHeader";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  CreditCard,
  RefreshCw,
  Search,
  IndianRupee,
  Wallet,
  BadgeIndianRupee,
  Fuel,
  Wrench,
  Receipt,
  User,
  FileText,
  CheckCircle2,
  Download,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const GST_PERCENTAGE = 5;

const PaymentManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [tollLogs, setTollLogs] = useState([]);
  

  const [paymentData, setPaymentData] = useState({});
  const [salaryData, setSalaryData] = useState({});

  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [activeFilter, setActiveFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [
        bookingsRes,
        issuesRes,
        fuelRes,
        tollRes,
        driversRes,
        expensesRes,
      ] = await Promise.all([
        fetch(
          `${API_URL}/bookings`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/issues`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/fuel`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/toll`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/drivers`,
          {
            headers: authHeader(),
          }
        ),

        fetch(
          `${API_URL}/expenses`,
          {
            headers: authHeader(),
          }
        ),
      ]);

      const expensesData = await expensesRes.json();
      const bookingsData = await bookingsRes.json();
      const issuesData = await issuesRes.json();
      const fuelData = await fuelRes.json();
      const tollData = await tollRes.json();
      const driversData = await driversRes.json();

      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : []
      );

      setIssues(
        Array.isArray(issuesData)
          ? issuesData
          : []
      );

      setFuelLogs(
        Array.isArray(fuelData)
          ? fuelData
          : []
      );

      setTollLogs(
        Array.isArray(tollData)
          ? tollData
          : []
      );

      setDrivers(
        Array.isArray(driversData)
          ? driversData
          : []
      );

      setExpenses(
        Array.isArray(expensesData)
          ? expensesData
          : []
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const timer = setInterval(
      loadAllData,
      120000
    );

    return () => clearInterval(timer);
  }, []);

  const formatMoney = (amount) =>
    `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;

  const getPaid = (booking) =>
    Number(
      booking.payment?.advanceAmount || 0
    );

  const getBaseAmount = (booking) =>
    Number(booking.amount || 0);

  const getGSTAmount = (booking) =>
    (getBaseAmount(booking) * GST_PERCENTAGE) / 100;

  const getTotal = (booking) =>
    getBaseAmount(booking) +
    getGSTAmount(booking);

  const getBalance = (booking) => {
    const total = getTotal(booking);

    const paid = Number(
      booking.payment?.advanceAmount || 0
    );

    return Math.max(total - paid, 0);
  };

  const totalRevenue = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking.amount || 0),
    0
  );

  const totalCollected = bookings.reduce(
    (sum, booking) =>
      sum +
      Number(
        booking.payment?.advanceAmount || 0
      ),
    0
  );

  const pendingBalance = bookings.reduce(
    (sum, booking) =>
      sum + getBalance(booking),
    0
  );

  const serviceExpense = issues.reduce(
    (sum, issue) =>
      sum +
      Number(
        issue.serviceDetails?.amount || 0
      ),
    0
  );

  const fuelExpense = fuelLogs.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const tollExpense = tollLogs.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const driverSalaryExpense =
    expenses
      .filter(
        (e) =>
          e.type ===
          "Driver Salary"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

  const otherExpense =
    expenses
      .filter(
        (e) => e.type === "Other"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  const totalExpense =
    serviceExpense +
    fuelExpense +
    tollExpense +
    driverSalaryExpense +
    otherExpense;

  const netRevenue =
    totalCollected - totalExpense;

  const totalGSTCollected = bookings.reduce(
    (sum, booking) =>
      sum + getGSTAmount(booking),
    0
  );

  const totalTrips = bookings.length;

  const paidTrips = bookings.filter(
    (b) =>
      b.payment?.paymentStatus === "Paid"
  ).length;

  const pendingTrips = bookings.filter(
    (b) =>
      b.payment?.paymentStatus !== "Paid"
  ).length;

  const averageRevenue =
    totalTrips > 0
      ? totalRevenue / totalTrips
      : 0;

  const profitMargin =
    totalRevenue > 0
      ? (
        (netRevenue / totalRevenue) *
        100
      ).toFixed(1)
      : 0;

  const collectionRate =
    totalRevenue > 0
      ? (
        (totalCollected /
          totalRevenue) *
        100
      ).toFixed(1)
      : 0;

  const summary = useMemo(() => {
    return {
      totalRevenue,
      totalCollected,
      pendingBalance,
      serviceExpense,
      fuelExpense,
      tollExpense,
      driverSalaryExpense,
      otherExpense,
      netRevenue,
      totalGSTCollected,
      totalTrips,
      paidTrips,
      pendingTrips,
      averageRevenue,
      profitMargin,
      collectionRate,
    };
  }, [
    totalRevenue,
    totalCollected,
    pendingBalance,
    serviceExpense,
    fuelExpense,
    tollExpense,
    driverSalaryExpense,
    otherExpense,
    netRevenue,
    totalGSTCollected,
    totalTrips,
    paidTrips,
    pendingTrips,
    averageRevenue,
    profitMargin,
    collectionRate,
  ]);

  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    if (activeFilter !== "All") {
      data = data.filter(
        (b) =>
          (b.payment?.paymentStatus ||
            "Pending") === activeFilter
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      data = data.filter(
        (b) =>
          String(
            b.bookingId || ""
          ).toLowerCase().includes(q) ||
          String(
            b.customerName || ""
          ).toLowerCase().includes(q) ||
          String(
            b.phone || ""
          ).includes(q)
      );
    }

    return data;
  }, [
    bookings,
    activeFilter,
    searchTerm,
  ]);

  const handlePaymentChange = (
    id,
    field,
    value
  ) => {
    setPaymentData((prev) => {
      const booking = bookings.find(
        (b) => b._id === id
      );

      const total = getTotal(booking);

      const oldPaid = Number(
        booking?.payment?.advanceAmount ||
        0
      );

      const existing = prev[id] || {};

      const updated = {
        ...existing,
        [field]: value,
      };

      const oldAdvance = Number(
        updated.advanceAmount ?? oldPaid
      );

      const balanceReceived = Number(
        updated.balanceReceived || 0
      );

      let totalPaid =
        oldAdvance + balanceReceived;

      if (totalPaid > total)
        totalPaid = total;

      const balanceAmount = Math.max(
        total - totalPaid,
        0
      );

      updated.totalPaid = totalPaid;

      updated.balanceAmount =
        balanceAmount;

      if (totalPaid <= 0)
        updated.paymentStatus =
          "Pending";
      else if (totalPaid < total)
        updated.paymentStatus =
          "Partial";
      else
        updated.paymentStatus = "Paid";

      return {
        ...prev,
        [id]: updated,
      };
    });
  };


  const calculateGST = (amount) => {
    const baseAmount = Number(amount || 0);

    const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;

    const totalWithGST = baseAmount + gstAmount;

    return {
      baseAmount,
      gstPercentage: GST_PERCENTAGE,
      gstAmount,
      totalWithGST,
    };
  };

  const downloadGSTInvoice = (booking) => {
    const gst =
      calculateGST(booking.amount);

    const html = `
    <html>
      <head>
        <title>GST Invoice</title>
      </head>

      <body style="font-family:Arial;padding:40px;">
        <h1>Eagle Transport</h1>

        <p>
          Professional GST Invoice
        </p>

        <hr />

        <h2>Customer Details</h2>

        <p>
          <strong>Name:</strong>
          ${booking.customerName || "Customer"}
        </p>

        <p>
          <strong>Phone:</strong>
          ${booking.phone}
        </p>

        <p>
          <strong>Booking ID:</strong>
          ${booking.bookingId}
        </p>

        <hr />

        <h2>Transport Charges</h2>

        <table
          border="1"
          cellpadding="10"
          cellspacing="0"
          width="100%"
        >
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>Transport Charge</td>
            <td>
              ₹${gst.baseAmount.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td>GST (5%)</td>
            <td>
              ₹${gst.gstAmount.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td>
              <strong>Total</strong>
            </td>

            <td>
              <strong>
                ₹${gst.totalWithGST.toLocaleString()}
              </strong>
            </td>
          </tr>
        </table>

        <br />

        <p>
          GSTIN:
          33ABCDE1234F1Z5
        </p>

        <p>
          Invoice Date:
          ${new Date().toLocaleDateString()}
        </p>

        <p>
          Thank you for choosing
          Eagle Transport.
        </p>
      </body>
    </html>
  `;

    const win = window.open(
      "",
      "",
      "width=900,height=700"
    );

    win.document.write(html);

    win.document.close();

    win.print();
  };

  const updatePayment = async (
    bookingId
  ) => {
    const booking = bookings.find(
      (b) => b._id === bookingId
    );

    const selected =
      paymentData[bookingId] || {};

    const total = getTotal(booking);

    const oldPaid = Number(
      booking?.payment?.advanceAmount ||
      0
    );

    const receivedNow = Number(
      selected.balanceReceived || 0
    );

    let totalPaid = Number(
      selected.totalPaid ??
      oldPaid + receivedNow
    );

    if (totalPaid > total)
      totalPaid = total;

    const balanceAmount = Math.max(
      total - totalPaid,
      0
    );

    let paymentStatus = "Pending";

    if (totalPaid <= 0)
      paymentStatus = "Pending";
    else if (totalPaid < total)
      paymentStatus = "Partial";
    else paymentStatus = "Paid";

    try {
      const res = await fetchWithAuth(
        `${API_URL}/bookings/${bookingId}/payment`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            paymentMode:
              selected.paymentMode ||
              booking?.payment
                ?.paymentMode ||
              "Cash",

            advanceAmount: totalPaid,

            balanceAmount,

            paymentStatus,

            gstPercentage: GST_PERCENTAGE,

            gstAmount: getGSTAmount(booking),

            totalWithGST: total,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(
          data.message ||
          "Payment update failed"
        );

        return;
      }

      alert(
        "Payment updated successfully ✅"
      );

      setPaymentData((prev) => ({
        ...prev,
        [bookingId]: {},
      }));

      loadAllData();
    } catch (error) {
      console.error(error);

      alert(
        "Server error while updating payment"
      );

      setSalaryPayments((prev) => {
        const updated = {
          ...prev,

          [driverId]:
            Number(prev[driverId] || 0) +
            Number(amount),
        };

        localStorage.setItem(
          "salaryPayments",
          JSON.stringify(updated)
        );

        return updated;
      });
    }
  };

  const saveOtherExpense = async () => {
    const amount = Number(
      salaryData.otherExpense || 0
    );

    const existing = Number(
      localStorage.getItem(
        "otherExpense"
      ) || 0
    );

    const total = existing + amount;

    await fetchWithAuth(
      `${API_URL}/expenses`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          title:
            salaryData.expenseName,

          amount,

          type: "Other",
        }),
      }
    );

    alert(
      "Other expense added successfully ✅"
    );

    loadAllData();
  };

  const getDriverTrips = (driverId) => {
    return bookings.filter((booking) => {
      return (
        booking.driverId?._id === driverId ||
        booking.driverId === driverId ||

        booking.assignedDriver?._id === driverId ||
        booking.assignedDriver === driverId ||

        booking.driver?._id === driverId ||
        booking.driver === driverId ||

        booking.driverDetails?._id === driverId ||

        booking.driverData?._id === driverId
      );
    });
  };

  const calculateDriverSalary = (
    driverId
  ) => {

    const trips =
      getDriverTrips(driverId);

    const autoSalary =
      trips.reduce((sum, trip) => {

        const tripAmount = Number(
          trip.amount || 0
        );

        return (
          sum + tripAmount * 0.14
        );

      }, 0);

    const paidSalary =
      expenses
        .filter(
          (e) =>
            e.type ===
            "Driver Salary" &&
            e.title?.includes(driverId)
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        );

    return {
      autoSalary,
      totalSalary:
        autoSalary,
      paidSalary,
      pendingSalary:
        autoSalary - paidSalary,
      trips,
    };
  };

  const payDriverSalary = async (
    driverId,
    amount
  ) => {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/drivers/${driverId}/pay-salary`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            amount,
          }),
        }
      );

      const data =
        await res.json();

      if (!data.success) {
        alert(
          "Salary payment failed"
        );

        return;
      }

      alert(
        "Salary paid successfully ✅"
      );

      loadAllData();
    } catch (error) {
      console.log(error);

      alert("Server error");
    }
  };  

  const saveManualBonus = (
    driverId
  ) => {
    const amount = Number(
      manualSalaryInput[driverId] || 0
    );

    const existing = Number(
      localStorage.getItem(
        `manualBonus_${driverId}`
      ) || 0
    );

    const updated =
      existing + amount;

    localStorage.setItem(
      `manualBonus_${driverId}`,
      updated
    );

    alert(
      "Manual salary added successfully ✅"
    );

    setManualSalaryInput((prev) => ({
      ...prev,
      [driverId]: "",
    }));
  };

  const generateSalaryReceipt = (
    driver,
    salaryDetails
  ) => {
    const html = `
    <html>
      <head>
        <title>Salary Receipt</title>
      </head>

      <body style="font-family:Arial;padding:40px;">
        <h1>Eagle Transport</h1>

        <h2>Driver Salary Receipt</h2>

        <hr />

        <p>
          <strong>Driver Name:</strong>
          ${driver.name}
        </p>

        <p>
          <strong>Driver ID:</strong>
          ${driver._id}
        </p>

        <p>
          <strong>Total Trips:</strong>
          ${salaryDetails.trips.length}
        </p>

        <p>
          <strong>Auto Salary:</strong>
          ₹${salaryDetails.autoSalary.toFixed(
              2
          )}
      </p>

      <p>
        <strong>Bonus Salary:</strong>
        ₹${salaryDetails.manualBonus.toFixed(
          2
        )}
      </p>

        <p>
          <strong>Total Salary:</strong>
          ₹${salaryDetails.totalSalary.toFixed(2)}
        </p>

        <p>
          <strong>Paid Salary:</strong>
          ₹${salaryDetails.paidSalary.toFixed(2)}
        </p>

        <p>
          <strong>Pending Salary:</strong>
          ₹${salaryDetails.pendingSalary.toFixed(2)}
        </p>

        <hr />

        <h3>Trip Details</h3>

        ${salaryDetails.trips
        .map(
          (trip) => `
            <div style="margin-bottom:12px;">
              <strong>
                ${trip.bookingId}
              </strong>

              -
              ₹${trip.amount}

              →
              Salary:
              ₹${(
              Number(
                trip.amount || 0
              ) * 0.14
            ).toFixed(2)}
            </div>
          `
        )
        .join("")}

        <br />

        <p>
          Generated On:
          ${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  `;

    const win = window.open(
      "",
      "",
      "width=900,height=700"
    );

    win.document.write(html);

    win.document.close();

    win.print();
  };

  const selectedDriver =
    drivers.find(
      (d) => d._id === selectedDriverId
    );

  const selectedDriverSalary =
    selectedDriverId
      ? calculateDriverSalary(
        selectedDriverId
      )
      : null;
  
  const filters = [
    "All",
    "Pending",
    "Partial",
    "Paid",
  ];

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div>
          <div style={styles.badge}>
            Finance Dashboard
          </div>

          <h2 style={styles.title}>
            Payment Management
          </h2>

          <p style={styles.subtitle}>
            Revenue, GST billing,
            expenses, salary management
            and professional finance
            analytics dashboard.
          </p>
        </div>

        <button
          style={styles.refreshBtn}
          onClick={loadAllData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryCard
          title="Total Revenue"
          value={formatMoney(
            summary.totalRevenue
          )}
          icon={<Wallet size={24} />}
        />

        <SummaryCard
          title="Collected"
          value={formatMoney(
            summary.totalCollected
          )}
          icon={
            <BadgeIndianRupee size={24} />
          }
        />

        <SummaryCard
          title="Pending"
          value={formatMoney(
            summary.pendingBalance
          )}
          icon={<Receipt size={24} />}
          danger
        />

        <SummaryCard
          title="Net Revenue"
          value={formatMoney(
            summary.netRevenue
          )}
          icon={<IndianRupee size={24} />}
          success
        />

        <SummaryCard
          title="GST Collected"
          value={formatMoney(
            summary.totalGSTCollected
          )}
          icon={<Receipt size={24} />}
        />

        <SummaryCard
          title="Collection Rate"
          value={`${summary.collectionRate}%`}
          icon={<BadgeIndianRupee size={24} />}
          success
        />

        <SummaryCard
          title="Profit Margin"
          value={`${summary.profitMargin}%`}
          icon={<Wallet size={24} />}
          success
        />

      </div>

      <div style={styles.expenseGrid}>
        <ExpenseCard
          title="Fuel Expense"
          amount={summary.fuelExpense}
          icon={<Fuel size={22} />}
        />

        <ExpenseCard
          title="Service Expense"
          amount={summary.serviceExpense}
          icon={<Wrench size={22} />}
        />

        <ExpenseCard
          title="Toll Expense"
          amount={summary.tollExpense}
          icon={<Receipt size={22} />}
        />

        <ExpenseCard
          title="Driver Salary"
          amount={
            summary.driverSalaryExpense
          }
          icon={<User size={22} />}
        />

        <ExpenseCard
          title="Other Expense"
          amount={summary.otherExpense}
          icon={<FileText size={22} />}
        />
      </div>

      <div style={styles.salarySection}>
        <div style={styles.salaryCard}>
          <h3 style={styles.sectionTitle}>
            Driver Salary Management
          </h3>

          <select
            style={styles.input}
            value={selectedDriverId}
            onChange={(e) =>
              setSelectedDriverId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Driver
            </option>

            {drivers.map((driver) => (
              <option
                key={driver._id}
                value={driver._id}
              >
                {driver.name}
              </option>
            ))}
          </select>

          {selectedDriver &&
            selectedDriverSalary && (() => {

              const isFullyPaid =
                selectedDriverSalary.pendingSalary <= 0;

              return (
                <div
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "18px",
                    marginTop: "18px",
                  }}
                >
                  <h4>
                    {selectedDriver.name}
                  </h4>

                  <p>
                    Driver ID:
                    {selectedDriver._id}
                  </p>

                  {isFullyPaid ? (
                    <>
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "16px",
                          borderRadius: "14px",
                          background:
                            "#ecfdf5",
                          color: "#047857",
                          fontWeight: "800",
                        }}
                      >
                        Salary Fully Paid ✅
                        <br />
                        No Pending Salary
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                        }}
                      >
                        <button
                          style={
                            styles.invoiceBtn
                          }
                          onClick={() =>
                            generateSalaryReceipt(
                              selectedDriver,
                              selectedDriverSalary
                            )
                          }
                        >
                          Generate Receipt
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Total Trips:
                        {
                          selectedDriverSalary
                            .trips.length
                        }
                      </p>

                      <p>
                        Auto Salary (14%):
                        ₹
                        {selectedDriverSalary.autoSalary.toFixed(
                          2
                        )}
                      </p>

                      <p>
                        Paid Salary:
                        ₹
                        {selectedDriverSalary.paidSalary.toFixed(
                          2
                        )}
                      </p>

                      <p>
                        Pending Salary:
                        ₹
                        {selectedDriverSalary.pendingSalary.toFixed(
                          2
                        )}
                      </p>

                        <div
                          style={{
                            marginTop: "18px",
                          }}
                        >
                          <input
                            style={styles.input}
                            type="number"
                            placeholder="Enter Salary Amount"
                            value={
                              salaryData[
                              selectedDriver._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setSalaryData((prev) => ({
                                ...prev,

                                [selectedDriver._id]:
                                  e.target.value,
                              }))
                            }
                          />
                        </div>
                        
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "14px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          style={
                            styles.salaryBtn
                          }
                          onClick={() =>
                            payDriverSalary(
                              selectedDriver._id,
                              salaryData.amount || 0
                            )
                          }
                        >
                          Pay Salary
                        </button>

                        <button
                          style={
                            styles.invoiceBtn
                          }
                          onClick={() =>
                            generateSalaryReceipt(
                              selectedDriver,
                              selectedDriverSalary
                            )
                          }
                        >
                          Generate Receipt
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: "24px",
                        }}
                      >
                        <h4>
                          Trip History
                        </h4>

                        {selectedDriverSalary.trips.map(
                          (trip) => (
                            <div
                              key={
                                trip._id
                              }
                              style={{
                                padding:
                                  "12px",
                                border:
                                  "1px solid #e2e8f0",
                                borderRadius:
                                  "12px",
                                marginBottom:
                                  "10px",
                              }}
                            >
                              <p>
                                Booking:
                                {
                                  trip.bookingId
                                }
                              </p>

                              <p>
                                Route:
                                {
                                  trip.pickup
                                }
                                →
                                {
                                  trip.drop
                                }
                              </p>

                              <p>
                                Trip Amount:
                                ₹
                                {
                                  trip.amount
                                }
                              </p>

                              <p>
                                Driver Salary
                                (14%):
                                ₹
                                {(
                                  Number(
                                    trip.amount ||
                                    0
                                  ) * 0.14
                                ).toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
        </div>

        <div style={styles.salaryCard}>
          <h3 style={styles.sectionTitle}>
            Other Expenses
          </h3>

          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Expense Name"
              value={
                salaryData.expenseName ||
                ""
              }
              onChange={(e) =>
                setSalaryData({
                  ...salaryData,
                  expenseName:
                    e.target.value,
                })
              }
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Expense Amount"
              value={
                salaryData.otherExpense ||
                ""
              }
              onChange={(e) =>
                setSalaryData({
                  ...salaryData,
                  otherExpense:
                    e.target.value,
                })
              }
            />

            <button
              style={styles.salaryBtn}
              onClick={saveOtherExpense}
            >
              <CheckCircle2 size={18} />
              Save Expense
            </button>
          </div>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterTabs}>
          {filters.map((f) => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,

                ...(activeFilter === f
                  ? styles.filterBtnActive
                  : {}),
              }}
              onClick={() =>
                setActiveFilter(f)
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div style={styles.searchBox}>
          <Search size={16} />

          <input
            style={styles.searchInput}
            placeholder="Search booking..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>
      </div>

      <div style={styles.list}>
        {loading ? (
          <div style={styles.empty}>
            Loading payments...
          </div>
        ) : filteredBookings.length ===
          0 ? (
          <div style={styles.empty}>
            No payment records found
          </div>
        ) : (
          filteredBookings.map(
            (booking) => {
              const selected =
                paymentData[
                booking._id
                ] || {};

              const driverTrips =
                getDriverTrips(
                  booking.driverId?._id ||
                  booking.assignedDriver?._id ||
                  booking.driver?._id
                );

              const total =
                getTotal(booking);

              const balance = Number(
                selected.balanceAmount ??
                getBalance(booking)
              );

              const status =
                selected.paymentStatus ||
                booking.payment
                  ?.paymentStatus ||
                "Pending";

              return (
                <div
                  key={booking._id}
                  style={
                    styles.paymentCard
                  }
                >
                  <div
                    style={styles.cardTop}
                  >
                    <div>
                      <h3
                        style={
                          styles.bookingId
                        }
                      >
                        {
                          booking.bookingId
                        }
                      </h3>

                      <p
                        style={
                          styles.customer
                        }
                      >
                        {booking.customerName ||
                          "Customer"}{" "}
                        •{" "}
                        {booking.phone ||
                          "No phone"}
                      </p>

                      <p
                        style={
                          styles.route
                        }
                      >
                        {
                          booking.pickup
                        }{" "}
                        →{" "}
                        {booking.drop}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,

                        ...(status ===
                          "Paid"
                          ? styles.paid
                          : status ===
                            "Partial"
                            ? styles.partial
                            : styles.pending),
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  <div style={styles.moneyGrid}>
                    <Info
                      label="Base Amount"
                      value={formatMoney(
                        getBaseAmount(booking)
                      )}
                    />

                    <Info
                      label={`GST (${GST_PERCENTAGE}%)`}
                      value={formatMoney(
                        getGSTAmount(booking)
                      )}
                    />

                    <Info
                      label="Grand Total"
                      value={formatMoney(
                        getTotal(booking)
                      )}
                    />

                    <Info
                      label="Already Paid"
                      value={formatMoney(
                        getPaid(booking)
                      )}
                    />

                    <Info
                      label="Pending Balance"
                      value={formatMoney(balance)}
                    />
                  </div>

                  <div
                    style={
                      styles.updateGrid
                    }
                  >
                    <select
                      style={
                        styles.input
                      }
                      value={
                        selected.paymentMode ||
                        booking.payment
                          ?.paymentMode ||
                        "Cash"
                      }
                      onChange={(e) =>
                        handlePaymentChange(
                          booking._id,
                          "paymentMode",
                          e.target.value
                        )
                      }
                    >
                      <option>
                        Cash
                      </option>

                      <option>
                        UPI
                      </option>

                      <option>
                        Bank Transfer
                      </option>

                      <option>
                        Credit
                      </option>
                    </select>

                    <input
                      style={
                        styles.input
                      }
                      type="number"
                      placeholder="Balance Received"
                      value={
                        selected.balanceReceived ||
                        ""
                      }
                      onChange={(e) =>
                        handlePaymentChange(
                          booking._id,
                          "balanceReceived",
                          e.target.value
                        )
                      }
                    />

                    <button
                      style={
                        styles.updateBtn
                      }
                      onClick={() =>
                        updatePayment(
                          booking._id
                        )
                      }
                    >
                      <CreditCard
                        size={17}
                      />
                      Update Payment
                    </button>

                    <button
                      style={styles.invoiceBtn}
                      onClick={() =>
                        downloadGSTInvoice(booking)
                      }
                    >
                      <Receipt size={17} />
                      GST Invoice
                    </button>

                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
  danger,
  success,
}) => (
  <div
    className="glass-card"
    style={styles.summaryCard}
  >
    <div style={styles.summaryIcon}>
      {icon}
    </div>

    <div>
      <p style={styles.summaryLabel}>
        {title}
      </p>

      <h3
        style={{
          ...styles.summaryValue,

          color: danger
            ? "#dc2626"
            : success
              ? "#059669"
              : "var(--dark-blue)",
        }}
      >
        {value}
      </h3>
    </div>
  </div>
);

const ExpenseCard = ({
  title,
  amount,
  icon,
}) => (
  <div style={styles.expenseCard}>
    <div style={styles.expenseIcon}>
      {icon}
    </div>

    <div>
      <p style={styles.expenseLabel}>
        {title}
      </p>

      <h3 style={styles.expenseAmount}>
        ₹
        {Number(amount).toLocaleString(
          "en-IN"
        )}
      </h3>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div style={styles.infoBox}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  headerCard: {
    padding: "28px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg,#0d2d52 0%,#123c6d 55%,#1f5da1 100%)",
    color: "#fff",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background:
      "rgba(255,255,255,0.14)",
    fontWeight: 800,
    marginBottom: "14px",
  },

  title: {
    margin: 0,
    color: "#fff",
    fontSize: "2rem",
    fontWeight: 900,
  },

  subtitle: {
    margin: "10px 0 0",
    color:
      "rgba(255,255,255,0.84)",
    lineHeight: 1.6,
  },

  refreshBtn: {
    border:
      "1px solid rgba(255,255,255,0.2)",
    background:
      "rgba(255,255,255,0.14)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
  },

  summaryCard: {
    padding: "22px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#fff",
  },

  summaryIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    background:
      "rgba(16,185,129,0.12)",
    color: "var(--success)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    margin: 0,
    color: "var(--text-muted)",
    fontWeight: 700,
  },

  summaryValue: {
    margin: "4px 0 0",
    fontSize: "1.4rem",
    fontWeight: 900,
  },

  expenseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
  },

  expenseCard: {
    padding: "20px",
    borderRadius: "22px",
    background: "#fff",
    border: "1px solid #e8eef6",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  expenseIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  expenseLabel: {
    margin: 0,
    color: "#64748b",
    fontWeight: 700,
  },

  expenseAmount: {
    margin: "5px 0 0",
    color: "#0f172a",
    fontWeight: 900,
  },

  salarySection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",
    gap: "18px",
  },

  salaryCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid #e8eef6",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#0f172a",
  },

  formGrid: {
    display: "grid",
    gap: "12px",
  },

  salaryBtn: {
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#16a34a,#15803d)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  filterCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "#fff",
    border: "1px solid #e8eef6",
    display: "flex",
    justifyContent:
      "space-between",
    gap: "14px",
    flexWrap: "wrap",
  },

  filterTabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  filterBtn: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "var(--dark-blue)",
    fontWeight: 800,
    cursor: "pointer",
  },

  filterBtnActive: {
    background:
      "linear-gradient(135deg,#0f4a88 0%,#143d73 100%)",
    color: "#fff",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #dbe4ef",
    borderRadius: "999px",
    padding: "10px 14px",
    minWidth: "260px",
    background: "#fff",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    background: "transparent",
  },

  list: {
    display: "grid",
    gap: "16px",
  },

  empty: {
    padding: "28px",
    textAlign: "center",
    color: "var(--text-muted)",
    background: "#fff",
    borderRadius: "18px",
    fontWeight: 800,
  },

  paymentCard: {
    padding: "22px",
    borderRadius: "24px",
    background: "#fff",
    border: "1px solid #e8eef6",
    boxShadow:
      "0 12px 28px rgba(10,35,66,0.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },

  bookingId: {
    margin: 0,
    color: "var(--dark-blue)",
    fontWeight: 900,
  },

  customer: {
    margin: "6px 0 0",
    color: "var(--text-muted)",
    fontWeight: 700,
  },

  route: {
    margin: "4px 0 0",
    color: "var(--dark-blue)",
    fontWeight: 700,
  },

  statusBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: 900,
    height: "fit-content",
  },

  paid: {
    background: "#ecfdf5",
    color: "#047857",
  },

  partial: {
    background: "#fff7ed",
    color: "#c2410c",
  },

  pending: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  moneyGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "12px",
    marginBottom: "16px",
  },

  infoBox: {
    padding: "14px",
    borderRadius: "16px",
    background: "#f8fbff",
    border: "1px solid #e8eef6",
    display: "grid",
    gap: "5px",
    color: "var(--dark-blue)",
  },

  updateGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(190px,1fr))",
    gap: "12px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe4ef",
    outline: "none",
    fontWeight: 700,
    color: "var(--dark-blue)",
    background: "#fff",
  },

  updateBtn: {
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#ff8c1a 0%,#ff7a00 100%)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
  },

  gstBtn: {
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
  },
  invoiceBtn: {
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
  },
};

export default PaymentManagement;

