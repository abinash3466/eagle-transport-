import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { authHeader } from "../../utils/authHeader";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { GST_PERCENTAGE, DRIVER_SALARY_PERCENTAGE } from "../../utils/financeConfig";
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

const API_URL = import.meta.env.VITE_API_URL;

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

  // Single GST rule for this finance screen. Booking.amount is treated as base amount before GST.
  const getGSTAmount = (booking) =>
    (getBaseAmount(booking) * GST_PERCENTAGE) / 100;

  const getTotal = (booking) =>
    getBaseAmount(booking) + getGSTAmount(booking);

  const getBalance = (booking) => {
    const total = getTotal(booking);

    const paid = Number(
      booking.payment?.advanceAmount || 0
    );

    return Math.max(total - paid, 0);
  };

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + getBaseAmount(booking),
    0
  );

  const totalGSTBilled = bookings.reduce(
    (sum, booking) => sum + getGSTAmount(booking),
    0
  );

  const totalInvoiceValue = totalRevenue + totalGSTBilled;

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

  // Cash position: money received minus expenses actually recorded/paid.
  const netRevenue = totalCollected - totalExpense;

  // Operating profit excludes GST because GST is a tax component, not operating revenue.
  const operatingProfit = totalRevenue - totalExpense;

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
      ? ((operatingProfit / totalRevenue) * 100).toFixed(1)
      : "0.0";

  const collectionRate =
    totalInvoiceValue > 0
      ? ((totalCollected / totalInvoiceValue) * 100).toFixed(1)
      : "0.0";

  const summary = useMemo(() => {
    return {
      totalRevenue,
      totalGSTBilled,
      totalInvoiceValue,
      totalCollected,
      pendingBalance,
      serviceExpense,
      fuelExpense,
      tollExpense,
      driverSalaryExpense,
      otherExpense,
      netRevenue,
      operatingProfit,
      totalTrips,
      paidTrips,
      pendingTrips,
      averageRevenue,
      profitMargin,
      collectionRate,
    };
  }, [
    totalRevenue,
    totalGSTBilled,
    totalInvoiceValue,
    totalCollected,
    pendingBalance,
    serviceExpense,
    fuelExpense,
    tollExpense,
    driverSalaryExpense,
    otherExpense,
    netRevenue,
    operatingProfit,
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

  // ✅ புதுசு: ஒட்டுமொத்த GST வசூலையும் அறிக்கையாக (PDF) மாற்றும் பங்க்ஷன் 🚀
  const downloadGSTBreakdownReport = () => {
    const html = `
    <html>
      <head>
        <title>GST Breakdown Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111827; }
          h1 { color: #0B3A70; margin-bottom: 5px; }
          .meta { color: #64748B; font-size: 14px; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #D9E2EF; padding: 12px; text-align: left; font-size: 14px; }
          th { background-color: #0B3A70; color: white; }
          tr:nth-child(even) { background-color: #F3F6FA; }
          .total-row { font-weight: bold; background-color: #E2E8F0 !important; color: #0B3A70; }
        </style>
      </head>
      <body>
        <h1>Eagle Transport - GST Breakdown Report</h1>
        <div class="meta">Generated on: ${new Date().toLocaleString('en-IN')} | Total Active Bookings: ${bookings.length}</div>
        
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Name</th>
              <th>Base Amount</th>
              <th>GST Rate</th>
              <th>GST Collected</th>
              <th>Grand Total</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => {
      const base = getBaseAmount(b);
      const gstAmt = getGSTAmount(b);
      const total = getTotal(b);
      return `
                <tr>
                  <td><strong>${b.bookingId || '-'}</strong></td>
                  <td>${b.customerName || 'Customer'}</td>
                  <td>₹${base.toLocaleString('en-IN')}</td>
                  <td>${GST_PERCENTAGE}%</td>
                  <td>₹${gstAmt.toLocaleString('en-IN')}</td>
                  <td>₹${total.toLocaleString('en-IN')}</td>
                </tr>
              `;
    }).join('')}
            <tr class="total-row">
              <td colspan="2">Total Summary</td>
              <td>₹${summary.totalRevenue.toLocaleString('en-IN')}</td>
              <td>-</td>
              <td>₹${summary.totalGSTBilled.toLocaleString('en-IN')}</td>
              <td>₹${summary.totalInvoiceValue.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
    `;

    const win = window.open("", "", "width=1000,height=800");
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

    const receivedNow = Number(
      selected.balanceReceived || 0
    );

    if (!Number.isFinite(receivedNow) || receivedNow <= 0) {
      alert("Enter a valid amount received");
      return;
    }

    if (receivedNow > getBalance(booking) + 0.01) {
      alert(`Maximum receivable amount is ${formatMoney(getBalance(booking))}`);
      return;
    }

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

            // Send only the new transaction amount.
            // Backend calculates cumulative paid/balance/status to avoid duplicate history and tampering.
            receivedAmount: receivedNow,
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
    }
  };

  const saveOtherExpense = async () => {
    const title = String(salaryData.expenseName || "").trim();
    const amount = Number(salaryData.otherExpense || 0);

    if (!title) {
      alert("Enter expense name");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid expense amount");
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount,
          type: "Other",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(data.message || "Expense save failed");
        return;
      }

      setSalaryData((prev) => ({
        ...prev,
        expenseName: "",
        otherExpense: "",
      }));

      alert("Other expense added successfully ✅");
      loadAllData();
    } catch (error) {
      console.error(error);
      alert("Server error while saving expense");
    }
  };

  const getDriverTrips = (driverId) => {
    return bookings.filter((booking) => {
      if (booking.status !== "Delivered") return false;

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

  const calculateDriverSalary = (driverId) => {
    const trips = getDriverTrips(driverId);

    const autoSalary = trips.reduce((sum, trip) => {
      const tripAmount = Number(trip.amount || 0);
      return sum + (tripAmount * DRIVER_SALARY_PERCENTAGE) / 100;
    }, 0);

    const driverExpenseRecords = expenses.filter((e) => {
      if (e.type !== "Driver Salary") return false;

      const expenseDriverId = e.driver?._id || e.driver;

      return (
        String(expenseDriverId || "") === String(driverId) ||
        e.title?.includes(driverId)
      );
    });

    const paidSalary = driverExpenseRecords.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    let lastPaidDate = "N/A";
    if (driverExpenseRecords.length > 0) {
      const sortedRecords = [...driverExpenseRecords].sort(
        (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
      );
      const latestRecord = sortedRecords[0];
      if (latestRecord.createdAt || latestRecord.date) {
        lastPaidDate = new Date(latestRecord.createdAt || latestRecord.date).toLocaleDateString('en-IN');
      }
    }

    const totalSalary = autoSalary;

    return {
      autoSalary,
      totalSalary,
      paidSalary,
      pendingSalary: Math.max(totalSalary - paidSalary, 0),
      lastPaidDate, // 👈 இந்த புதிய தேதி வேல்யூ சேர்க்கப்பட்டுள்ளது!
      trips,
    };
  };

  const payDriverSalary = async (driverId, amount) => {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/drivers/${driverId}/pay-salary`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(amount), // 👈 நம்பராக மாற்றி அனுப்புகிறோம்
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Salary payment failed ❌");
        return;
      }

      alert("Salary paid successfully ✅");

      setSalaryData((prev) => ({
        ...prev,
        [driverId]: ""
      }));

      loadAllData();
    } catch (error) {
      console.error(error);
      alert("Server error ❌");
    }
  };

  const generateSalaryReceipt = (
    driver,
    salaryDetails
  ) => {
    const html = `
    <html>
      <head>
        <title>Salary Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111827; }
          h1, h2 { color: #0B3A70; margin: 0 0 10px 0; }
          hr { border: 0; border-top: 1px solid #D9E2EF; margin: 20px 0; }
          .info-p { font-size: 14px; margin: 6px 0; }
          .trip-box { padding: 14px; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 12px; background-color: #F8FAFC; }
          .trip-title { font-size: 15px; color: #0B3A70; margin: 0 0 6px 0; }
          .trip-date { font-size: 12px; color: #64748B; margin: 4px 0; display: flex; gap: 15px; }
          .salary-highlight { color: #FF7A00; font-weight: bold; }
        </style>
      </head>

      <body>
        <h1>Eagle Transport</h1>
        <h2>Driver Salary Receipt</h2>
        <hr />

        <p class="info-p"><strong>Driver Name:</strong> ${driver.name}</p>
        <p class="info-p"><strong>Driver ID:</strong> ${driver.driverId || driver._id}</p>
        <p class="info-p"><strong>Total Trips:</strong> ${salaryDetails.trips.length}</p>
        <p class="info-p"><strong>Auto Salary (${DRIVER_SALARY_PERCENTAGE}%):</strong> ₹${salaryDetails.autoSalary.toFixed(2)}</p>
        <p class="info-p"><strong>Total Salary:</strong> ₹${salaryDetails.totalSalary.toFixed(2)}</p>
        <p class="info-p"><strong>Paid Salary:</strong> ₹${salaryDetails.paidSalary.toFixed(2)}</p>
        <p class="info-p"><strong>Pending Salary:</strong> ₹${salaryDetails.pendingSalary.toFixed(2)}</p>

        <hr />
        <h3>Trip Details & Timeline</h3>

        ${salaryDetails.trips
        .map(
          (trip) => {
            // ✅ statusHistory-ல் இருந்து Dispatched மற்றும் Delivered தேதிகளைப் பிரிக்கிறோம்[cite: 7]
            const dispatchedStatus = (trip.statusHistory || []).find(h => h.status === "Dispatched");
            const deliveredStatus = (trip.statusHistory || []).find(h => h.status === "Delivered");

            const dispatchedDate = dispatchedStatus && dispatchedStatus.updatedAt
              ? new Date(dispatchedStatus.updatedAt).toLocaleDateString('en-IN')
              : "N/A";

            const deliveredDate = deliveredStatus && deliveredStatus.updatedAt
              ? new Date(deliveredStatus.updatedAt).toLocaleDateString('en-IN')
              : "N/A";

            return `
              <div class="trip-box">
                <div class="trip-title"><strong>ID: ${trip.bookingId || '-'}</strong> (${trip.pickup} → ${trip.drop})</div>
                <div class="trip-date">
                  <span>📅 <b>Dispatched:</b> ${dispatchedDate}</span>
                  <span>✅ <b>Delivered:</b> ${deliveredDate}</span>
                </div>
                <div style="font-size: 13px; margin-top: 6px;">
                  Trip Amount: ₹${Number(trip.amount || 0).toLocaleString('en-IN')} | 
                  <span class="salary-highlight">Driver Share (${DRIVER_SALARY_PERCENTAGE}%): ₹${((Number(trip.amount || 0) * DRIVER_SALARY_PERCENTAGE) / 100).toFixed(2)}</span>
                </div>
              </div>
            `;
          }
        )
        .join("")}

        <br />
        <p class="info-p" style="color: #64748B; font-size: 12px;">
          Generated On: ${new Date().toLocaleString('en-IN')}
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

  // Salary management should contain only drivers who have at least one completed trip.
  const salaryEligibleDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) => getDriverTrips(driver._id).length > 0
      ),
    [drivers, bookings]
  );

  const selectedDriver =
    salaryEligibleDrivers.find(
      (d) => d._id === selectedDriverId
    );

  const selectedDriverSalary =
    selectedDriver
      ? calculateDriverSalary(selectedDriver._id)
      : null;

  const filters = [
    "All",
    "Pending",
    "Partial",
    "Paid",
  ];

  return (
    <div className="payment-page" style={styles.page}>
      <div className="payment-header-card" style={styles.headerCard}>
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

        {/* ✅ புதுசு: அனலிட்டிக்ஸ் அறிக்கையை பிரிண்ட் செய்ய புதிய மேலாண்மை பட்டன் */}
        <div className="payment-header-actions" style={{ display: "flex", gap: "12px" }}>
          <button
            style={styles.refreshBtn}
            onClick={downloadGSTBreakdownReport}
          >
            <Download size={17} />
            GST Report PDF
          </button>
          <button
            style={styles.refreshBtn}
            onClick={loadAllData}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <div className="payment-summary-grid" style={styles.summaryGrid}>
        <SummaryCard
          title="Base Revenue"
          value={formatMoney(
            summary.totalRevenue
          )}
          icon={<Wallet size={24} />}
        />

        <SummaryCard
          title="Invoice Value"
          value={formatMoney(
            summary.totalInvoiceValue
          )}
          icon={<Receipt size={24} />}
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
          title="Outstanding"
          value={formatMoney(
            summary.pendingBalance
          )}
          icon={<Receipt size={24} />}
          danger
        />

        <SummaryCard
          title="Net Cash Flow"
          value={formatMoney(
            summary.netRevenue
          )}
          icon={<IndianRupee size={24} />}
          success
        />

        <SummaryCard
          title="GST Billed"
          value={formatMoney(
            summary.totalGSTBilled
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

      <div className="payment-expense-grid" style={styles.expenseGrid}>
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

      <div className="payment-salary-section" style={styles.salarySection}>
        <div className="payment-salary-card" style={styles.salaryCard}>
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
              {salaryEligibleDrivers.length > 0
                ? "Select Driver"
                : "No completed trips yet"}
            </option>

            {salaryEligibleDrivers.map((driver) => (
              <option
                key={driver._id}
                value={driver._id}
              >
                {driver.name}
              </option>
            ))}
          </select>

          {salaryEligibleDrivers.length === 0 && (
            <div
              style={{
                marginTop: "18px",
                padding: "18px",
                borderRadius: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontWeight: "700",
                lineHeight: "1.6",
              }}
            >
              No completed trips yet. Driver salary will appear here only after a trip is delivered.
            </div>
          )}

          {selectedDriver &&
            selectedDriverSalary && (() => {
              const hasCompletedTrips = selectedDriverSalary.trips.length > 0;
              const hasEarnedSalary = selectedDriverSalary.totalSalary > 0;
              const isFullyPaid =
                hasCompletedTrips &&
                hasEarnedSalary &&
                selectedDriverSalary.pendingSalary <= 0.01 &&
                selectedDriverSalary.paidSalary >= selectedDriverSalary.totalSalary - 0.01;

              return (
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "18px",
                    marginTop: "18px",
                  }}
                >
                  <h4>{selectedDriver.name}</h4>
                  <p><strong>Driver ID:</strong> {selectedDriver.driverId || selectedDriver._id}</p>

                  {isFullyPaid ? (
                    <>
                      {/* ✅ 2. சம்பளம் முழுமையாகக் கொடுத்திருந்தால் காட்டும் புதிய பக்கா டிசைன் */}
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "18px",
                          borderRadius: "16px",
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          color: "#047857",
                        }}
                      >
                        <div style={{ fontWeight: "900", fontSize: "16.5px", marginBottom: "6px" }}>
                          Salary Fully Paid ✅
                        </div>
                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#065f46" }}>
                          📅 Paid Date: {selectedDriverSalary.lastPaidDate}
                        </div>
                      </div>

                      <div style={{ marginTop: "16px" }}>
                        <button
                          style={{
                            ...styles.invoiceBtn,
                            width: "100%",
                            background: "linear-gradient(135deg, #0B3A70 0%, #123c6d 100%)",
                            boxShadow: "0 8px 20px rgba(11, 58, 112, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                          onClick={() =>
                            generateSalaryReceipt(
                              selectedDriver,
                              selectedDriverSalary
                            )
                          }
                        >
                          <FileText size={17} />
                          View & Download Salary Receipt
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 🔄 3. சம்பளம் பாக்கி இருந்தால் மட்டும் காட்டும் உங்க பழைய வொர்க்கிங் ஃபார்ம் */}
                      <p>Total Trips: {selectedDriverSalary.trips.length}</p>
                      <p>Auto Salary ({DRIVER_SALARY_PERCENTAGE}%): ₹{selectedDriverSalary.autoSalary.toFixed(2)}</p>
                      <p>Paid Salary: ₹{selectedDriverSalary.paidSalary.toFixed(2)}</p>
                      <p>Pending Salary: ₹{selectedDriverSalary.pendingSalary.toFixed(2)}</p>

                      <div style={{ marginTop: "18px" }}>
                        <input
                          style={styles.input}
                          type="number"
                          placeholder="Enter Salary Amount"
                          value={salaryData[selectedDriver._id] || ""}
                          onChange={(e) =>
                            setSalaryData((prev) => ({
                              ...prev,
                              [selectedDriver._id]: e.target.value,
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
                          style={styles.salaryBtn}
                          onClick={() => {
                            const amountToPay = salaryData[selectedDriver._id] || 0;
                            if (!amountToPay || amountToPay <= 0) {
                              alert("Please enter a valid salary amount");
                              return;
                            }
                            payDriverSalary(selectedDriver._id, amountToPay);
                          }}
                        >
                          Pay Salary
                        </button>

                        <button
                          style={styles.invoiceBtn}
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

                      <div style={{ marginTop: "24px" }}>
                        <h4>Trip History</h4>
                        {selectedDriverSalary.trips.map((trip) => (
                          <div
                            key={trip._id}
                            style={{
                              padding: "12px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              marginBottom: "10px",
                            }}
                          >
                            <p>Booking: {trip.bookingId}</p>
                            <p>Route: {trip.pickup} → {trip.drop}</p>
                            <p>Trip Amount: ₹{trip.amount}</p>
                            <p>Driver Salary ({DRIVER_SALARY_PERCENTAGE}%): ₹{((Number(trip.amount || 0) * DRIVER_SALARY_PERCENTAGE) / 100).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
        </div>

        <div className="payment-salary-card" style={styles.salaryCard}>
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

      <div className="payment-filter-card" style={styles.filterCard}>
        <div className="payment-filter-tabs" style={styles.filterTabs}>
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

        <div className="payment-search-box" style={styles.searchBox}>
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

      <div className="payment-list" style={styles.list}>
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
                  className="payment-booking-card"
                  style={
                    styles.paymentCard
                  }
                >
                  <div
                    className="payment-card-top" style={styles.cardTop}
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

                  <div className="payment-money-grid" style={styles.moneyGrid}>
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

                    {/* ✅ புதுசு: ஜிஎஸ்டி பிரிப்புத் தொகையை லைவ் இண்டிகேட்டராகக் காட்டும் டூல்டிப் டெக்ஸ்ட் 🚀 */}
                    <div style={{ position: "relative" }}>
                      <Info
                        label="Grand Total"
                        value={formatMoney(
                          getTotal(booking)
                        )}
                      />
                      <small style={{ display: "block", color: "#64748b", fontSize: "11px", marginTop: "4px", paddingLeft: "14px", fontWeight: "700" }}>
                        (₹{getBaseAmount(booking).toLocaleString('en-IN')} + ₹{getGSTAmount(booking).toLocaleString('en-IN')} GST)
                      </small>
                    </div>

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
                    className="payment-update-grid"
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

      <style>{`
        /* =========================================================
           PAYMENT MANAGEMENT - MOBILE ONLY
           Desktop / laptop inline styles are intentionally untouched.
        ========================================================= */

        @keyframes paymentMobileFadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (max-width: 768px) {
          .payment-page {
            width: 100% !important;
            min-width: 0 !important;
            gap: 14px !important;
            overflow-x: hidden !important;
          }

          /* ---------- HERO / HEADER ---------- */
          .payment-header-card {
            width: 100% !important;
            padding: 18px !important;
            border-radius: 20px !important;
            gap: 14px !important;
            box-sizing: border-box !important;
            align-items: flex-start !important;
            background:
              linear-gradient(145deg, #092846 0%, #0d3d70 55%, #165995 100%) !important;
            box-shadow: 0 14px 30px rgba(8, 42, 78, 0.16) !important;
            animation: paymentMobileFadeUp .28s ease both;
          }

          .payment-header-card > div:first-child {
            width: 100% !important;
            min-width: 0 !important;
          }

          .payment-header-card [style*="badge"] {
            margin-bottom: 9px !important;
          }

          .payment-header-card h2 {
            font-size: 23px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.55px !important;
          }

          .payment-header-card p {
            max-width: 100% !important;
            margin-top: 7px !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
          }

          .payment-header-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1.35fr .85fr !important;
            gap: 8px !important;
          }

          .payment-header-actions button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 40px !important;
            padding: 0 10px !important;
            border-radius: 11px !important;
            justify-content: center !important;
            font-size: 10px !important;
            white-space: nowrap !important;
            transition: transform .16s ease, background .16s ease !important;
          }

          .payment-header-actions button:active {
            transform: scale(.97) !important;
          }

          .payment-header-actions svg {
            width: 14px !important;
            height: 14px !important;
          }

          /* ---------- FINANCE SUMMARY ---------- */
          .payment-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .payment-summary-card {
            min-width: 0 !important;
            min-height: 84px !important;
            padding: 11px !important;
            gap: 9px !important;
            border-radius: 15px !important;
            box-sizing: border-box !important;
            box-shadow: 0 8px 20px rgba(15, 59, 115, .055) !important;
            animation: paymentMobileFadeUp .28s ease both;
          }

          .payment-summary-card > div:first-child {
            width: 34px !important;
            height: 34px !important;
            min-width: 34px !important;
            border-radius: 11px !important;
          }

          .payment-summary-card > div:first-child svg {
            width: 16px !important;
            height: 16px !important;
          }

          .payment-summary-card > div:last-child {
            min-width: 0 !important;
          }

          .payment-summary-card p {
            font-size: 9px !important;
            line-height: 1.2 !important;
            white-space: normal !important;
          }

          .payment-summary-card h3 {
            margin-top: 4px !important;
            font-size: 14px !important;
            line-height: 1.12 !important;
            overflow-wrap: anywhere !important;
          }

          /* ---------- EXPENSE CARDS ---------- */
          .payment-expense-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .payment-expense-card {
            min-width: 0 !important;
            padding: 11px !important;
            gap: 9px !important;
            border-radius: 15px !important;
            box-sizing: border-box !important;
            box-shadow: 0 7px 18px rgba(15, 59, 115, .04) !important;
          }

          .payment-expense-card > div:first-child {
            width: 33px !important;
            height: 33px !important;
            min-width: 33px !important;
            border-radius: 10px !important;
          }

          .payment-expense-card svg {
            width: 15px !important;
            height: 15px !important;
          }

          .payment-expense-card p {
            font-size: 9px !important;
            line-height: 1.2 !important;
          }

          .payment-expense-card h3 {
            margin-top: 4px !important;
            font-size: 13px !important;
            line-height: 1.15 !important;
            overflow-wrap: anywhere !important;
          }

          /* Last expense gets a comfortable full row on odd count */
          .payment-expense-card:last-child:nth-child(odd) {
            grid-column: 1 / -1 !important;
          }

          /* ---------- SALARY / OTHER EXPENSE ---------- */
          .payment-salary-section {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .payment-salary-card {
            width: 100% !important;
            min-width: 0 !important;
            padding: 14px !important;
            border-radius: 18px !important;
            box-sizing: border-box !important;
            box-shadow: 0 8px 20px rgba(15, 59, 115, .045) !important;
          }

          .payment-salary-card h3 {
            margin-bottom: 12px !important;
            font-size: 15px !important;
            line-height: 1.2 !important;
          }

          .payment-salary-card h4 {
            margin: 0 0 7px !important;
            font-size: 13px !important;
          }

          .payment-salary-card p {
            margin: 5px 0 !important;
            font-size: 10px !important;
            line-height: 1.4 !important;
            overflow-wrap: anywhere !important;
          }

          .payment-salary-card input,
          .payment-salary-card select {
            min-height: 41px !important;
            padding: 8px 10px !important;
            border-radius: 10px !important;
            font-size: 10.5px !important;
          }

          .payment-salary-card button {
            min-height: 41px !important;
            padding: 8px 11px !important;
            border-radius: 10px !important;
            font-size: 10.5px !important;
          }

          /* selected driver detail / trip history */
          .payment-salary-card > div {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .payment-salary-card > div[style*="border"] {
            padding: 12px !important;
            margin-top: 12px !important;
            border-radius: 13px !important;
          }

          .payment-salary-card > div[style*="border"] > div[style*="marginTop"] {
            margin-top: 10px !important;
          }

          /* ---------- FILTERS / SEARCH ---------- */
          .payment-filter-card {
            width: 100% !important;
            padding: 10px !important;
            border-radius: 16px !important;
            gap: 9px !important;
            box-sizing: border-box !important;
          }

          .payment-filter-tabs {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 5px !important;
          }

          .payment-filter-tabs button {
            width: 100% !important;
            min-width: 0 !important;
            padding: 7px 3px !important;
            border-radius: 9px !important;
            font-size: 8.5px !important;
            line-height: 1.1 !important;
            text-align: center !important;
          }

          .payment-search-box {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 40px !important;
            padding: 8px 11px !important;
            border-radius: 11px !important;
            box-sizing: border-box !important;
            background: #f8fbff !important;
          }

          .payment-search-box svg {
            width: 14px !important;
            height: 14px !important;
          }

          .payment-search-box input {
            min-width: 0 !important;
            font-size: 10.5px !important;
          }

          /* ---------- PAYMENT CARDS ---------- */
          .payment-list {
            gap: 10px !important;
          }

          .payment-booking-card {
            width: 100% !important;
            min-width: 0 !important;
            padding: 13px !important;
            border-radius: 18px !important;
            box-sizing: border-box !important;
            box-shadow: 0 9px 22px rgba(10, 35, 66, .055) !important;
            animation: paymentMobileFadeUp .26s ease both;
          }

          .payment-card-top {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            align-items: start !important;
            gap: 8px !important;
            margin-bottom: 11px !important;
          }

          .payment-card-top > div {
            min-width: 0 !important;
          }

          .payment-card-top h3 {
            font-size: 14px !important;
            line-height: 1.15 !important;
          }

          .payment-card-top p {
            font-size: 9.5px !important;
            line-height: 1.35 !important;
            overflow-wrap: anywhere !important;
          }

          .payment-card-top > span {
            padding: 6px 9px !important;
            border-radius: 999px !important;
            font-size: 8.5px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
          }

          .payment-money-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 7px !important;
            margin-bottom: 10px !important;
          }

          .payment-money-grid > div {
            min-width: 0 !important;
          }

          .payment-info-box {
            min-width: 0 !important;
            padding: 9px !important;
            border-radius: 11px !important;
            gap: 3px !important;
          }

          .payment-info-box span {
            font-size: 8px !important;
            line-height: 1.2 !important;
          }

          .payment-info-box strong {
            font-size: 10px !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere !important;
          }

          .payment-money-grid small {
            padding-left: 4px !important;
            margin-top: 3px !important;
            font-size: 7.5px !important;
            line-height: 1.25 !important;
          }

          /* Grand Total info block remains tidy inside 2-col grid */
          .payment-money-grid > div[style*="position"] {
            min-width: 0 !important;
          }

          .payment-update-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
          }

          .payment-update-grid select,
          .payment-update-grid input,
          .payment-update-grid button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 40px !important;
            margin: 0 !important;
            padding: 8px 9px !important;
            border-radius: 10px !important;
            box-sizing: border-box !important;
            font-size: 9.5px !important;
          }

          .payment-update-grid button {
            gap: 5px !important;
            line-height: 1.15 !important;
          }

          .payment-update-grid button svg {
            width: 13px !important;
            height: 13px !important;
          }

          .payment-update-grid button:active,
          .payment-salary-card button:active {
            transform: scale(.97) !important;
          }

          /* ---------- EMPTY / LOADING ---------- */
          .payment-list > div:not(.payment-booking-card) {
            padding: 18px 12px !important;
            border-radius: 14px !important;
            font-size: 10.5px !important;
          }
        }

        /* =========================================================
           SMALL MOBILE
        ========================================================= */
        @media (max-width: 420px) {
          .payment-page {
            gap: 11px !important;
          }

          .payment-header-card {
            padding: 15px !important;
            border-radius: 18px !important;
          }

          .payment-header-card h2 {
            font-size: 21px !important;
          }

          .payment-header-card p {
            font-size: 10px !important;
          }

          .payment-header-actions {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }

          .payment-header-actions button {
            min-height: 38px !important;
            padding: 0 7px !important;
            font-size: 9px !important;
          }

          .payment-summary-grid,
          .payment-expense-grid {
            gap: 7px !important;
          }

          .payment-summary-card,
          .payment-expense-card {
            padding: 9px !important;
            gap: 7px !important;
            border-radius: 13px !important;
          }

          .payment-summary-card {
            min-height: 76px !important;
          }

          .payment-summary-card > div:first-child,
          .payment-expense-card > div:first-child {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            border-radius: 9px !important;
          }

          .payment-summary-card h3 {
            font-size: 12.5px !important;
          }

          .payment-expense-card h3 {
            font-size: 11.5px !important;
          }

          .payment-summary-card p,
          .payment-expense-card p {
            font-size: 8px !important;
          }

          .payment-salary-card {
            padding: 12px !important;
            border-radius: 16px !important;
          }

          .payment-filter-card {
            padding: 8px !important;
          }

          .payment-filter-tabs {
            gap: 4px !important;
          }

          .payment-filter-tabs button {
            padding: 6px 2px !important;
            font-size: 8px !important;
          }

          .payment-booking-card {
            padding: 11px !important;
            border-radius: 16px !important;
          }

          .payment-card-top {
            gap: 6px !important;
          }

          .payment-card-top h3 {
            font-size: 13px !important;
          }

          .payment-card-top p {
            font-size: 8.8px !important;
          }

          .payment-money-grid {
            gap: 5px !important;
          }

          .payment-info-box {
            padding: 8px !important;
            border-radius: 10px !important;
          }

          .payment-info-box span {
            font-size: 7.5px !important;
          }

          .payment-info-box strong {
            font-size: 9px !important;
          }

          .payment-update-grid {
            gap: 6px !important;
          }

          .payment-update-grid select,
          .payment-update-grid input,
          .payment-update-grid button {
            min-height: 38px !important;
            padding: 7px 6px !important;
            border-radius: 9px !important;
            font-size: 8.8px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .payment-header-card,
          .payment-summary-card,
          .payment-booking-card {
            animation: none !important;
          }

          .payment-header-actions button,
          .payment-update-grid button,
          .payment-salary-card button {
            transition: none !important;
          }
        }
      `}</style>
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
    className="glass-card payment-summary-card"
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
  <div className="payment-expense-card" style={styles.expenseCard}>
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
  <div className="payment-info-box" style={styles.infoBox}>
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