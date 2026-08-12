const express = require("express");
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware");


const Booking = require("../models/Booking");
const Truck = require("../models/Truck");
const Driver = require("../models/Driver");
const FuelLog = require("../models/FuelLog");
const TollLog = require("../models/TollLog");
const Notification = require("../models/Notification");
const { GST_PERCENTAGE, DRIVER_SALARY_PERCENTAGE } = require("../config/financeConfig");

const {
  makeWhatsAppLink,
  statusMessage,
} = require("../utils/whatsappHelper");

const { createBooking, getBookings, deleteBooking, updatePayment } = require("../controllers/bookingController");

router.post("/", auth, createBooking);
router.get("/", auth, getBookings);
router.delete("/:id", auth, deleteBooking);


router.put("/:id/assign", auth, async (req, res) => {
  try {
    const { truckId, driverId } = req.body;

    if (!truckId || !driverId) {
      return res.status(400).json({ success: false, message: "Truck ID and Driver ID are required" });
    }

    const currentBooking = await Booking.findById(req.params.id);
    if (!currentBooking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (currentBooking.status !== "Booked") return res.status(400).json({ success: false, message: "Only booked trips can be assigned" });

    const [truck, driver] = await Promise.all([Truck.findById(truckId), Driver.findById(driverId)]);
    if (!truck || !driver) return res.status(404).json({ success: false, message: "Truck or driver not found" });
    if (String(truck.status || "idle").toLowerCase() !== "idle") return res.status(400).json({ success: false, message: "Selected truck is not available" });
    if (String(driver.status || "available").toLowerCase() !== "available") return res.status(400).json({ success: false, message: "Selected driver is not available" });

    const [activeTruckBooking, activeDriverBooking] = await Promise.all([
      Booking.findOne({ _id: { $ne: currentBooking._id }, truck: truckId, status: { $ne: "Delivered" } }),
      Booking.findOne({ _id: { $ne: currentBooking._id }, driver: driverId, status: { $ne: "Delivered" } }),
    ]);
    if (activeTruckBooking || activeDriverBooking) {
      return res.status(400).json({ success: false, message: "Selected truck or driver is already assigned to an active trip" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        truck: truckId,
        driver: driverId,
        status: "Dispatched",
        $push: {
          statusHistory: {
            status: "Dispatched",
            note: "Truck and driver assigned",
            updatedBy: "Owner",
            updatedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    ).populate("truck").populate("driver");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    await Truck.findByIdAndUpdate(truckId, { status: "assigned" });
    await Driver.findByIdAndUpdate(driverId, { status: "assigned", assignedTruck: truckId });

    res.json({
      success: true,
      message: "Truck and driver assigned successfully",
      booking,
      whatsappLink: makeWhatsAppLink(
        booking.phone,
        statusMessage(booking, "✅ Driver and truck assigned successfully.")
  ),
});
  } catch (error) {
    res.status(500).json({ success: false, message: "Assign failed", error: error.message });
  }
});

router.put("/:id/start-trip", auth, async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.params.id);
    if (!currentBooking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (currentBooking.status !== "Dispatched") return res.status(400).json({ success: false, message: "Only dispatched trips can be started" });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "In Transit",
        $push: {
          statusHistory: {
            status: "In Transit",
            note: "Trip started by driver",
            updatedBy: "Driver",
            updatedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    ).populate("truck").populate("driver");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.truck) await Truck.findByIdAndUpdate(booking.truck._id || booking.truck, { status: "on-route" });
    if (booking.driver) await Driver.findByIdAndUpdate(booking.driver._id || booking.driver, { status: "on-trip" });

    await Notification.create({
      type: "trip_started",
      message: `Trip started - ${booking.bookingId}`,
    });

    res.json({
      success: true,
      message: "Trip started",
      booking,
      whatsappLink: makeWhatsAppLink(
        booking.phone,
        statusMessage(booking, "🚚 Your trip has started.")
      ),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Start trip failed", error: error.message });
  }
});

router.put("/:id/end-trip",auth, async (req, res) => {
  try {

    const { remarks } = req.body;

    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate("truck")
        .populate("driver");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    if (booking.status !== "In Transit") {
      return res.status(400).json({ success: false, message: "Only trips that are in transit can be completed" });
    }

    // SAFE ARRAYS

    if (!booking.statusHistory) {
      booking.statusHistory = [];
    }

    if (!booking.payment) {
      booking.payment = {};
    }

    // =====================
    // SALARY CALCULATION
    // =====================

    // Booking.amount is the base transport charge before GST.
    const baseAmount = Number(booking.amount || 0);
    const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;
    const totalWithGST = baseAmount + gstAmount;
    const driverSalary =
      (baseAmount * DRIVER_SALARY_PERCENTAGE) / 100;

    booking.payment.gstPercentage = GST_PERCENTAGE;
    booking.payment.gstAmount = Number(gstAmount.toFixed(2));
    booking.payment.totalWithGST = Number(totalWithGST.toFixed(2));

    booking.payment.driverSalary = Number(driverSalary.toFixed(2));
    booking.payment.salaryPaid = Number(booking.payment.salaryPaid || 0);
    booking.payment.salaryPending = Math.max(
      booking.payment.driverSalary - booking.payment.salaryPaid,
      0
    );
    booking.payment.salaryStatus =
      booking.payment.salaryPending <= 0 ? "Paid" :
      booking.payment.salaryPaid > 0 ? "Partial" : "Pending";

    // =====================
    // BOOKING UPDATE
    // =====================

    booking.status = "Delivered";

    booking.currentLocation =
      "Destination reached";

    booking.notes =
      remarks || "";

    booking.statusHistory.push({
      status: "Delivered",

      note:
        remarks ||
        "Trip ended by driver",

      updatedBy: "Driver",

      updatedAt: new Date(),
    });

    await booking.save();

    // =====================
    // TRUCK UPDATE
    // =====================

    if (booking.truck) {

      await Truck.findByIdAndUpdate(
        booking.truck._id ||
        booking.truck,

        {
          status: "idle",
        }
      );
    }

    // =====================
    // DRIVER UPDATE
    // =====================

    if (booking.driver) {

      await Driver.findByIdAndUpdate(
        booking.driver._id ||
        booking.driver,

        {
          status: "available",
        }
      );
    }

    // =====================
    // NOTIFICATION
    // =====================

    await Notification.create({
      type: "trip_completed",

      message:
        `Trip completed - ${booking.bookingId}`,
    });

    res.json({
      success: true,

      message:
        "Trip completed successfully",

      booking,

      whatsappLink:
        makeWhatsAppLink(
          booking.phone,

          statusMessage(
            booking,
            "✅ Your shipment has been delivered."
          )
        ),
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,

      message:
        "End trip failed",

      error: error.message,
    });
  }
});

router.put("/:id/location",auth,  async (req, res) => {
  try {
    const { currentLocation, liveLocation } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation,
        liveLocation,
      },
      { returnDocument: 'after' }
    ).populate("truck").populate("driver");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      booking,
      whatsappLink: makeWhatsAppLink(
        booking.phone,
        statusMessage(booking, "📍 Live location updated.")
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Location update failed",
      error: error.message,
    });
  }
});

router.put("/:id/status",auth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatus = ["Booked", "Dispatched", "In Transit"];

    if (status === "Delivered") {
      return res.status(400).json({ success: false, message: "Use the complete-trip action to mark a booking as delivered" });
    }
    if (!allowedStatus.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) return res.status(404).json({ success: false, message: "Booking not found" });
    const validTransitions = { Booked: ["Booked", "Dispatched"], Dispatched: ["Dispatched", "In Transit"], "In Transit": ["In Transit"], Delivered: [] };
    if (!validTransitions[existingBooking.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status transition: ${existingBooking.status} → ${status}` });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          statusHistory: {
            status,
            note: note || `Status updated to ${status}`,
            updatedBy: "Owner",
            updatedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    ).populate("truck").populate("driver");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.truck) {
      const truckId = booking.truck._id || booking.truck;
      if (status === "In Transit") await Truck.findByIdAndUpdate(truckId, { status: "on-route" });
      if (status === "Delivered") await Truck.findByIdAndUpdate(truckId, { status: "idle" });
    }

    res.json({ success: true, message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Status update failed", error: error.message });
  }
});

router.put("/:id/payment", auth, updatePayment);

router.post("/track", async (req, res) => {
  try {
    const { bookingId, otp } = req.body;

    const booking = await Booking.findOne({ bookingId, otp }).populate("truck").populate("driver");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Invalid Booking ID or OTP" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Tracking failed", error: error.message });
  }
});

router.get("/:id/invoice", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("truck")
      .populate("driver");

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    const doc = new PDFDocument({
      margin: 36,
      size: "A4",
      bufferPages: false,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Eagle_Transport_${booking.bookingId || "invoice"}.pdf`
    );

    doc.pipe(res);

    const primary = "#0B3A70";
    const navy = "#082C55";
    const orange = "#FF7A00";
    const light = "#F3F6FA";
    const border = "#D9E2EF";
    const grey = "#64748B";
    const black = "#111827";
    const green = "#10B981";

    const pageWidth = doc.page.width;
    const left = 36;
    const right = pageWidth - 36;

    const formatMoney = (value) =>
      `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

    const truckText =
      booking.truck?.number ||
      booking.truck?.truckNumber ||
      booking.truck?.vehicleNumber ||
      booking.truck?.name ||
      "-";

    const truckType =
      booking.truck?.category ||
      booking.truck?.truckType ||
      booking.truck?.type ||
      "-";

    const driverName =
      booking.driver?.name ||
      booking.driver?.driverName ||
      booking.driver?.fullName ||
      "-";

    const driverPhone =
      booking.driver?.phone ||
      booking.driver?.mobile ||
      booking.driver?.mobileNumber ||
      "-";

    const paymentMode = booking.payment?.paymentMode || "Cash";
    const paymentStatus = booking.payment?.paymentStatus || "Pending";
    const advanceAmount = Number(booking.payment?.advanceAmount || 0);
    const baseAmount = Number(booking.amount || 0);
    const gstAmount = Number(booking.payment?.gstAmount || ((baseAmount * GST_PERCENTAGE) / 100));
    const totalAmount = Number(booking.payment?.totalWithGST || (baseAmount + gstAmount));
    const balanceAmount = Math.max(totalAmount - advanceAmount, 0);

    // HEADER
    doc.rect(0, 0, pageWidth, 112).fill(primary);

   // Website-style logo box - centered final
    const logoPath = path.resolve("public/eagle-logo.png");

    const logoWrapX = left + 2;
    const logoWrapY = 17;
    const logoWrapSize = 78;
    const logoSize = 120;

    const centerX = logoWrapX + logoWrapSize / 2;
    const centerY = logoWrapY + logoWrapSize / 1.20;

  doc.save();

  doc
  .roundedRect(logoWrapX, logoWrapY, logoWrapSize, logoWrapSize, 20)
  .fill("#FFFFFF");

  doc
    .roundedRect(logoWrapX, logoWrapY, logoWrapSize, logoWrapSize, 20)
    .clip();

  if (fs.existsSync(logoPath)) {
  doc.image(logoPath, centerX - logoSize / 2, centerY - logoSize / 2, {
    width: logoSize,
  });
  } else {
  doc
    .fillColor(primary)
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("ET", logoWrapX + 27, logoWrapY + 28);
  }

  doc.restore();

    doc
      .fillColor("#FFFFFF")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("EAGLE TRANSPORT", left + 95, 24);

    doc
      .fillColor("#DCEBFF")
      .fontSize(8.5)
      .font("Helvetica")
      .text("Safe. Fast. Trusted Logistics Service", left + 95, 52)
      .text("Ambasamudram, Tirunelveli, Tamil Nadu", left + 95, 67)
      .text("Support: +91 8428302003 | support@eagletransport.in", left + 95, 82);

    doc
      .fillColor("#FFFFFF")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("INVOICE", right - 150, 27, { width: 150, align: "right" });

    doc
      .fillColor("#DCEBFF")
      .fontSize(8)
      .font("Helvetica")
      .text(`Booking ID: ${booking.bookingId || "-"}`, right - 190, 58, {
        width: 190,
        align: "right",
      })
      .text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, right - 190, 73, {
        width: 190,
        align: "right",
      });

    doc.roundedRect(right - 130, 88, 130, 18, 9).fill(orange);
    doc
      .fillColor("#FFFFFF")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(booking.status || "Booked", right - 130, 93, {
        width: 130,
        align: "center",
      });

    // CUSTOMER + INVOICE
    doc.roundedRect(left + 25, 138, pageWidth - 122, 76, 12).fill(light);

    doc
      .fillColor(primary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Customer Details", left + 42, 153);

    doc
      .fillColor(black)
      .fontSize(8.5)
      .font("Helvetica")
      .text(`Name: ${booking.customerName || "-"}`, left + 42, 174)
      .text(`Phone: ${booking.phone || "-"}`, left + 42, 190);

    doc
      .fillColor(primary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Invoice Details", right - 240, 153);

    doc
      .fillColor(black)
      .fontSize(8.5)
      .font("Helvetica")
      .text(`Invoice No: INV-${booking.bookingId || "-"}`, right - 240, 174)
      .text(`Tracking OTP: ${booking.otp || "-"}`, right - 240, 190);

    // ROUTE
    doc
      .fillColor(primary)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Shipment Route", left + 25, 238);

    doc
      .roundedRect(left + 25, 264, pageWidth - 122, 82, 14)
      .strokeColor(border)
      .stroke();

    const routeY = 304;
    const pickupX = left + 75;
    const dropX = right - 75;

    doc
      .moveTo(pickupX + 18, routeY)
      .lineTo(dropX - 18, routeY)
      .lineWidth(2)
      .dash(6, { space: 5 })
      .strokeColor("#C9D7EA")
      .stroke()
      .undash();

    doc.circle(pickupX, routeY, 11).fill(green);
    doc
      .fillColor("#FFFFFF")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("P", pickupX - 2.8, routeY - 3.2);

    doc.circle(dropX, routeY, 11).fill(orange);
    doc
      .fillColor("#FFFFFF")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("D", dropX - 3.2, routeY - 3.2);

    doc.roundedRect(pageWidth / 2 - 50, routeY - 12, 100, 24, 12).fill(light);
    doc
      .fillColor(primary)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("EAGLE ROUTE", pageWidth / 2 - 50, routeY - 2.5, {
        width: 100,
        align: "center",
      });

    doc
      .fillColor(grey)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("PICKUP LOCATION", left + 52, 281);

    doc
      .fillColor(black)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(booking.pickup || "-", left + 52, 324, { width: 180 });

    doc
      .fillColor(grey)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("DROP LOCATION", right - 220, 281, {
        width: 190,
        align: "right",
      });

    doc
      .fillColor(black)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(booking.drop || "-", right - 220, 324, {
        width: 190,
        align: "right",
      });

    // VEHICLE TABLE
    doc
      .fillColor(primary)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Vehicle & Driver Details", left + 25, 374);

    const tableTop = 402;
    const tableWidth = pageWidth - 86;
    const colW = tableWidth / 4;

    doc.roundedRect(left + 5, tableTop, tableWidth, 30, 8).fill(primary);

    ["TRUCK", "TYPE", "DRIVER", "PHONE"].forEach((h, i) => {
      doc
        .fillColor("#FFFFFF")
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .text(h, left + 18 + i * colW, tableTop + 11, {
          width: colW - 20,
        });
    });

    doc.rect(left + 5, tableTop + 30, tableWidth, 48).fill("#FFFFFF");

    [truckText, truckType, driverName, driverPhone].forEach((v, i) => {
      doc
        .fillColor(black)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(v, left + 18 + i * colW, tableTop + 50, {
          width: colW - 20,
        });
    });

    // PAYMENT
    const paymentTitleY = 490;
    const payTop = 518;
    const payBoxHeight = 190;

    doc.roundedRect(left + 25, payTop, pageWidth - 122, payBoxHeight, 14).fill(light);

    doc
      .fillColor(primary)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Payment Summary", left + 25, paymentTitleY);

    doc.roundedRect(left + 25, payTop, pageWidth - 122, 150, 14).fill(light);

    const row = (label, value, y, bold = false, color = black) => {
      doc
        .fillColor(grey)
        .fontSize(9)
        .font("Helvetica")
        .text(label, left + 45, y);

      doc
        .fillColor(color)
        .fontSize(bold ? 12 : 9)
        .font("Helvetica-Bold")
        .text(value, right - 205, y, { width: 170, align: "right" });
    };

    row("Freight Charges", formatMoney(baseAmount), payTop + 20);
    row(`GST (${GST_PERCENTAGE}%)`, formatMoney(gstAmount), payTop + 44);
    row("Amount Paid", formatMoney(advanceAmount), payTop + 68);
    row("Balance Payable", formatMoney(balanceAmount), payTop + 92);
    row("Payment", `${paymentMode} • ${paymentStatus}`, payTop + 116);

    doc
      .moveTo(left + 45, payTop + 134)
      .lineTo(right - 45, payTop + 134)
      .strokeColor(border)
      .stroke();

    row("TOTAL AMOUNT", formatMoney(totalAmount), payTop + 144, true, orange);

doc
  .fillColor(green)
  .fontSize(7.8)
  .font("Helvetica-Bold")
  .text("Verified customer invoice • No hidden service charges", left + 45, payTop + 166);
    
    // TERMS
    const termsTop = 730;

    doc
      .fillColor(primary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Terms & Notes", left + 25, termsTop);

    doc
      .fillColor(grey)
      .fontSize(7)
      .font("Helvetica")
      .text(
        "1. This invoice is generated against the confirmed Eagle Transport booking. 2. Freight charges may vary based on route changes, waiting time, tolls, or additional service requests.",
        left + 25,
        termsTop + 16,
        { width: 330, lineGap: 2 }
      );

    doc
      .moveTo(right - 180, termsTop + 24)
      .lineTo(right - 45, termsTop + 24)
      .strokeColor(border)
      .stroke();

    doc
      .fillColor(navy)
      .fontSize(7.5)
      .font("Helvetica-Bold")
      .text("Authorized Signature", right - 180, termsTop + 33, {
        width: 135,
        align: "center",
      });

    // FOOTER
    doc.rect(0, 790, pageWidth, 34).fill(primary);

    doc
      .fillColor("#FFFFFF")
      .fontSize(7.5)
      .font("Helvetica")
      .text(
        "Thank you for choosing Eagle Transport | This is a computer generated invoice",
        left,
        803,
        { width: pageWidth - 72, align: "center" }
      );

    doc.end();
  } catch (err) {
    console.error("Invoice generation failed:", err);
    res.status(500).send("Invoice generation failed");
  }
});

router.get("/:id/internal-expense", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("truck")
      .populate("driver");

    if (!booking) return res.status(404).send("Booking not found");

    const fuelLogs = await FuelLog.find({ booking: booking._id })
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });

    const tollLogs = await TollLog.find({ booking: booking._id })
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });

    const revenue = Number(booking.amount || 0);
    const fuelTotal = fuelLogs.reduce((sum, log) => sum + Number(log.amount || 0), 0);
    const fuelLiters = fuelLogs.reduce((sum, log) => sum + Number(log.liters || 0), 0);
    const fuelKm = fuelLogs.reduce((sum, log) => sum + Number(log.km || 0), 0);
    const tollTotal = tollLogs.reduce((sum, log) => sum + Number(log.amount || 0), 0);
    const totalExpense = fuelTotal + tollTotal;
    const profit = revenue - totalExpense;
    const mileage = fuelLiters > 0 ? (fuelKm / fuelLiters).toFixed(2) : "0";

    const doc = new PDFDocument({ margin: 36, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Internal_Expense_${booking.bookingId || "report"}.pdf`
    );

    doc.pipe(res);

    const primary = "#0B3A70";
    const orange = "#FF7A00";
    const light = "#F3F6FA";
    const grey = "#64748B";
    const black = "#111827";
    const green = "#10B981";
    const red = "#EF4444";

    const formatMoney = (v) => `Rs. ${Number(v || 0).toLocaleString("en-IN")}`;

    doc.rect(0, 0, doc.page.width, 92).fill(primary);

    doc.fillColor("#fff").fontSize(22).font("Helvetica-Bold").text("EAGLE TRANSPORT", 36, 24);
    doc.fillColor("#DCEBFF").fontSize(9).font("Helvetica").text("Internal Expense & Profit Report", 36, 55);

    doc.fillColor("#fff").fontSize(16).font("Helvetica-Bold").text("INTERNAL REPORT", 360, 30, {
      width: 190,
      align: "right",
    });

    doc.fillColor(primary).fontSize(14).font("Helvetica-Bold").text("Trip Summary", 36, 120);

    const cardY = 150;
    const cards = [
      ["Revenue", formatMoney(revenue), primary],
      ["Fuel Expense", formatMoney(fuelTotal), orange],
      ["Toll Expense", formatMoney(tollTotal), red],
      ["Net Profit", formatMoney(profit), profit >= 0 ? green : red],
    ];

    cards.forEach((c, i) => {
      const x = 36 + i * 132;
      doc.roundedRect(x, cardY, 120, 64, 12).fill(light);
      doc.fillColor(grey).fontSize(8).font("Helvetica-Bold").text(c[0], x + 12, cardY + 14);
      doc.fillColor(c[2]).fontSize(12).font("Helvetica-Bold").text(c[1], x + 12, cardY + 36);
    });

    doc.fillColor(primary).fontSize(12).font("Helvetica-Bold").text("Booking Details", 36, 245);
    doc.fillColor(black).fontSize(9).font("Helvetica")
      .text(`Booking ID: ${booking.bookingId || "-"}`, 36, 268)
      .text(`Customer: ${booking.customerName || "-"}`, 36, 284)
      .text(`Route: ${booking.pickup || "-"} → ${booking.drop || "-"}`, 36, 300)
      .text(`Truck: ${booking.truck?.number || booking.truck?.name || "-"}`, 36, 316)
      .text(`Driver: ${booking.driver?.name || "-"}`, 36, 332)
      .text(`Fuel Liters: ${fuelLiters} L`, 330, 268)
      .text(`Distance KM: ${fuelKm} km`, 330, 284)
      .text(`Mileage: ${mileage} km/L`, 330, 300)
      .text(`Total Expense: ${formatMoney(totalExpense)}`, 330, 316);

    let y = 380;

    doc.fillColor(primary).fontSize(12).font("Helvetica-Bold").text("Fuel Logs", 36, y);
    y += 24;

    fuelLogs.forEach((log) => {
      doc.fillColor(black).fontSize(8).font("Helvetica")
        .text(`${log.pumpName || "Fuel Entry"} • ${log.liters || 0} L • ${formatMoney(log.amount)} • ${log.place || "-"}`, 46, y);
      y += 18;
    });

    if (fuelLogs.length === 0) {
      doc.fillColor(grey).fontSize(8).text("No fuel logs found", 46, y);
      y += 18;
    }

    y += 14;
    doc.fillColor(primary).fontSize(12).font("Helvetica-Bold").text("Toll Logs", 36, y);
    y += 24;

    tollLogs.forEach((log) => {
      doc.fillColor(black).fontSize(8).font("Helvetica")
        .text(`${log.tollgate || "Toll Entry"} • ${formatMoney(log.amount)} • ${log.paymentMethod || "FASTag"} • ${log.place || "-"}`, 46, y);
      y += 18;
    });

    if (tollLogs.length === 0) {
      doc.fillColor(grey).fontSize(8).text("No toll logs found", 46, y);
    }

    doc.fillColor(grey).fontSize(7).text("Internal use only. Do not share with customer.", 36, 795, {
      width: 520,
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error("Internal expense report failed:", err);
    res.status(500).send("Internal expense report failed");
  }
});

router.get("/reports/fuel.csv", auth, async (req, res) => {
  try {
    const logs = await FuelLog.find()
      .populate("booking")
      .populate("driver")
      .populate("truck")
      .sort({ createdAt: -1 });

    const rows = [
      [
        "Date",
        "Booking ID",
        "Truck",
        "Driver",
        "Pump Name",
        "Fuel Type",
        "Liters",
        "KM",
        "Mileage",
        "Amount",
        "Place",
      ],
    ];

    logs.forEach((log) => {
      const liters = Number(log.liters || 0);
      const km = Number(log.km || 0);
      const mileage = liters > 0 ? (km / liters).toFixed(2) : "0";

      rows.push([
        log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "",
        log.booking?.bookingId || "",
        log.truck?.number || log.truck?.name || "",
        log.driver?.name || "",
        log.pumpName || "",
        log.fuelType || "Diesel",
        liters,
        km,
        mileage,
        Number(log.amount || 0),
        log.place || "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=Fuel_Report.csv");
    res.send(csv);
  } catch (err) {
    console.error("Fuel CSV report failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/reports/fuel.pdf", auth, async (req, res) => {
  try {
    const logs = await FuelLog.find()
      .populate("booking")
      .populate("driver")
      .populate("truck")
      .sort({ createdAt: -1 });

    const totalLiters = logs.reduce((sum, log) => sum + Number(log.liters || 0), 0);
    const totalKm = logs.reduce((sum, log) => sum + Number(log.km || 0), 0);
    const totalAmount = logs.reduce((sum, log) => sum + Number(log.amount || 0), 0);
    const avgMileage = totalLiters > 0 ? (totalKm / totalLiters).toFixed(2) : "0";

    const doc = new PDFDocument({ margin: 36, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=Eagle_Fuel_Report.pdf");

    doc.pipe(res);

    const primary = "#0B3A70";
    const orange = "#FF7A00";
    const light = "#F3F6FA";
    const border = "#D9E2EF";
    const grey = "#64748B";
    const black = "#111827";

    const formatMoney = (value) =>
      `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

    doc.rect(0, 0, doc.page.width, 90).fill(primary);

    doc
      .fillColor("#FFFFFF")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("EAGLE TRANSPORT", 36, 25);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#DCEBFF")
      .text("Fuel Consumption & Mileage Report", 36, 55);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("FUEL REPORT", 380, 30, { width: 170, align: "right" });

    const cardY = 115;
    const cardW = 120;
    const cards = [
      ["Total Diesel", `${totalLiters} L`],
      ["Fuel Cost", formatMoney(totalAmount)],
      ["Total KM", `${totalKm} km`],
      ["Avg Mileage", `${avgMileage} km/L`],
    ];

    cards.forEach((card, i) => {
      const x = 36 + i * 132;
      doc.roundedRect(x, cardY, cardW, 62, 12).fill(light);
      doc.fillColor(grey).fontSize(8).font("Helvetica-Bold").text(card[0], x + 12, cardY + 14);
      doc.fillColor(i === 1 ? orange : primary).fontSize(13).font("Helvetica-Bold").text(card[1], x + 12, cardY + 34);
    });

    let y = 215;

    doc.fillColor(primary).fontSize(13).font("Helvetica-Bold").text("Fuel Log Details", 36, 195);

    const headers = ["Date", "Truck", "Driver", "Liters", "KM", "Mileage", "Amount"];
    const colX = [36, 110, 205, 295, 350, 405, 480];

    doc.roundedRect(36, y, 520, 26, 8).fill(primary);
    headers.forEach((h, i) => {
      doc.fillColor("#FFFFFF").fontSize(7).font("Helvetica-Bold").text(h, colX[i], y + 9, {
        width: i === 1 || i === 2 ? 85 : 60,
      });
    });

    y += 32;

    logs.forEach((log, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      const liters = Number(log.liters || 0);
      const km = Number(log.km || 0);
      const mileage = liters > 0 ? (km / liters).toFixed(2) : "0";

      if (idx % 2 === 0) {
        doc.rect(36, y - 6, 520, 24).fill("#FAFBFC");
      }

      const values = [
        log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-IN") : "-",
        log.truck?.number || log.truck?.name || "-",
        log.driver?.name || "-",
        `${liters}`,
        `${km}`,
        `${mileage}`,
        formatMoney(log.amount),
      ];

      values.forEach((v, i) => {
        doc.fillColor(black).fontSize(7).font("Helvetica").text(v, colX[i], y, {
          width: i === 1 || i === 2 ? 85 : 60,
        });
      });

      y += 24;
    });

    doc
      .moveTo(36, y + 8)
      .lineTo(556, y + 8)
      .strokeColor(border)
      .stroke();

    doc
      .fillColor(grey)
      .fontSize(7)
      .text("Generated by Eagle Transport Management System", 36, 795, {
        width: 520,
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("Fuel PDF report failed:", err);
    res.status(500).send("Fuel PDF report failed");
  }
});

// GET notifications
router.get("/notifications/all", auth, async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
});

// mark as read
router.put("/notifications/:id/read",auth , async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

router.put(
  "/:id/pay-driver-salary",
  auth, async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // SAFE PAYMENT OBJECT
      if (!booking.payment) {
        booking.payment = {};
      }

      // SAFE SALARY HISTORY ARRAY
      if (!booking.payment.salaryHistory) {
        booking.payment.salaryHistory = [];
      }

      const payAmount = Number(req.body.amount || 0);

      const totalSalary = Number(
        booking.payment.driverSalary || 0
      );

      const alreadyPaid = Number(
        booking.payment.salaryPaid || 0
      );

      let updatedPaid = alreadyPaid + payAmount;

      // Prevent overpayment
      if (updatedPaid > totalSalary) {
        updatedPaid = totalSalary;
      }

      const pending = totalSalary - updatedPaid;

      let status = "Pending";

      if (updatedPaid <= 0) {
        status = "Pending";
      } else if (updatedPaid < totalSalary) {
        status = "Partial";
      } else {
        status = "Paid";
      }

      // UPDATE PAYMENT DETAILS
      booking.payment.salaryPaid = updatedPaid;

      booking.payment.salaryPending = pending;

      booking.payment.salaryStatus = status;

      // PUSH PAYMENT HISTORY
      booking.payment.salaryHistory.push({
        amount: payAmount,
        receiptId: `SAL-${Date.now()}`,
        paidAt: new Date(),
      });

      await booking.save();

      res.json({
        success: true,
        message: "Driver salary updated successfully",
        booking,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



module.exports = router;