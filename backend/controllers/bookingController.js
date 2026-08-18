const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const axios = require("axios");
const crypto = require("crypto");
const { GST_PERCENTAGE, DRIVER_SALARY_PERCENTAGE } = require("../config/financeConfig");

const {
  makeWhatsAppLink,
  bookingConfirmedMessage,
} = require("../utils/whatsappHelper");

const PAYMENT_MODES = new Set(["Cash", "UPI", "Bank Transfer", "Credit"]);

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const auditActor = (req) =>
  String(
    req.user?.name ||
    req.user?.fullName ||
    req.user?.email ||
    req.user?.role ||
    "Owner"
  );

const getFinanceSnapshot = (booking) => {
  const baseAmount = roundMoney(booking?.amount || 0);
  const storedPercentage = Number(booking?.payment?.gstPercentage);
  const gstPercentage = Number.isFinite(storedPercentage)
    ? storedPercentage
    : GST_PERCENTAGE;

  const storedGst = Number(booking?.payment?.gstAmount);
  const gstAmount = gstPercentage === 0
    ? 0
    : (Number.isFinite(storedGst) && storedGst > 0
        ? roundMoney(storedGst)
        : roundMoney((baseAmount * gstPercentage) / 100));

  const storedTotal = Number(booking?.payment?.totalWithGST);
  const totalWithGST = Number.isFinite(storedTotal) && storedTotal > 0
    ? roundMoney(storedTotal)
    : roundMoney(baseAmount + gstAmount);

  return { baseAmount, gstPercentage, gstAmount, totalWithGST };
};

const makeReceiptId = (prefix = "PAY") =>
  `${prefix}-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const sendCompanyWhatsApp = async (phone, text) => {
  try {
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
    // 🌐 உங்க கம்பெனி வாட்ஸ்அப் பிசினஸ் ஏபிஐ லிங்க் (Meta Cloud API / Wati / Twilio)
    await axios.post(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: text }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`WhatsApp sent successfully to ${formattedPhone}`);
  } catch (err) {
    console.error("WhatsApp API Error:", err.response ? err.response.data : err.message);
  }
};

const generateBookingId = () => {
  const timePart = Date.now().toString(36).toUpperCase().slice(-6);
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ET-${timePart}-${randomPart}`;
};

const generateOtp = () => crypto.randomInt(1000, 10000).toString();



exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ isDeleted: { $ne: true } })
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/*
========================================
NEW AI SMART DISPATCH UPDATE
========================================
*/

exports.updatePayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const paymentMode = String(
      req.body.paymentMode || booking.payment?.paymentMode || "Cash"
    );

    if (!PAYMENT_MODES.has(paymentMode)) {
      return res.status(400).json({ success: false, message: "Invalid payment mode" });
    }

    const receivedAmount = roundMoney(req.body.receivedAmount);

    if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Received amount must be greater than 0",
      });
    }

    const { gstPercentage, gstAmount, totalWithGST } = getFinanceSnapshot(booking);
    const alreadyPaid = roundMoney(booking.payment?.advanceAmount || 0);
    const pendingBeforePayment = roundMoney(Math.max(totalWithGST - alreadyPaid, 0));

    if (receivedAmount > pendingBeforePayment + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Maximum receivable amount is ₹${pendingBeforePayment.toFixed(2)}`,
      });
    }

    const totalPaid = roundMoney(alreadyPaid + receivedAmount);
    const balanceAmount = roundMoney(Math.max(totalWithGST - totalPaid, 0));
    const paymentStatus =
      totalPaid <= 0 ? "Pending" : balanceAmount > 0.01 ? "Partial" : "Paid";

    const receiptId = makeReceiptId("PAY");
    const collectedBy = auditActor(req);
    const remarks = String(req.body.remarks || "").trim();

    const concurrencyFilter = {
      _id: booking._id,
      isDeleted: { $ne: true },
      ...(booking.payment?.advanceAmount == null
        ? { $or: [
            { "payment.advanceAmount": { $exists: false } },
            { "payment.advanceAmount": 0 },
          ] }
        : { "payment.advanceAmount": alreadyPaid }),
    };

    const updatedBooking = await Booking.findOneAndUpdate(
      concurrencyFilter,
      {
        $set: {
          "payment.paymentMode": paymentMode,
          "payment.advanceAmount": totalPaid,
          "payment.balanceAmount": balanceAmount,
          "payment.paymentStatus": paymentStatus,
          "payment.gstPercentage": gstPercentage,
          "payment.gstAmount": gstAmount,
          "payment.totalWithGST": totalWithGST,
        },
        $push: {
          "payment.paymentHistory": {
            amount: receivedAmount,
            paymentMode,
            receiptId,
            collectedBy,
            remarks,
            balanceAfter: balanceAmount,
            paidAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    if (!updatedBooking) {
      return res.status(409).json({
        success: false,
        message: "Payment changed in another request. Refresh and try again.",
      });
    }

    await updatedBooking.populate("truck");
    await updatedBooking.populate("driver");

    return res.json({
      success: true,
      message: "Payment updated successfully",
      receiptId,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment update failed",
      error: error.message,
    });
  }
};

// DELETE BOOKING
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "Booked") {
      return res.status(400).json({
        success: false,
        message: "Only an unstarted booked trip can be cancelled",
      });
    }

    const collected = roundMoney(booking.payment?.advanceAmount || 0);
    const hasPaymentHistory = Array.isArray(booking.payment?.paymentHistory) &&
      booking.payment.paymentHistory.length > 0;

    if (collected > 0 || hasPaymentHistory) {
      return res.status(400).json({
        success: false,
        message: "A booking with payment activity cannot be deleted. Keep it for audit history.",
      });
    }

    booking.isDeleted = true;
    booking.deletedAt = new Date();
    booking.deletedBy = auditActor(req);
    booking.deleteReason = String(req.body?.reason || "Cancelled before dispatch").trim();
    await booking.save();

    return res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const getCoordinates = async (place) => {
      try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: place, format: "json", limit: 1 },
          headers: { "User-Agent": "EagleTransport/1.0" },
        });
        if (!response.data.length) return null;
        return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
      } catch (err) { return null; }
    };

    let pickupCoords = null;
    let dropCoords = null;

    try {
      pickupCoords = await getCoordinates(req.body.pickup);
      dropCoords = await getCoordinates(req.body.drop);
    } catch (err) {
      console.log("Location fetch failed");
    }

    const baseAmount = Number(req.body.amount || 0);

    if (!req.body.customerName || !req.body.phone || !req.body.pickup || !req.body.drop) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, pickup and drop are required",
      });
    }

    if (!Number.isFinite(baseAmount) || baseAmount < 0) {
      return res.status(400).json({ success: false, message: "Invalid booking amount" });
    }

    const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;
    const totalWithGST = baseAmount + gstAmount;

    const booking = await Booking.create({
      customerName: String(req.body.customerName).trim(),
      phone: String(req.body.phone).trim(),
      pickup: String(req.body.pickup).trim(),
      drop: String(req.body.drop).trim(),
      goods: req.body.goods || "",
      amount: Number(baseAmount.toFixed(2)),
      bookingType: req.body.bookingType || "public",
      priority: req.body.priority || "normal",
      status: "Booked",
      notes: req.body.notes || "",
      pickupCoords,
      dropCoords,
      bookingId: generateBookingId(),
      otp: generateOtp(),
      payment: {
        paymentMode: req.body.payment?.paymentMode || "Cash",
        advanceAmount: 0,
        balanceAmount: Number(totalWithGST.toFixed(2)),
        paymentStatus: "Pending",
        gstPercentage: GST_PERCENTAGE,
        gstAmount: Number(gstAmount.toFixed(2)),
        totalWithGST: Number(totalWithGST.toFixed(2)),
        driverSalaryPercentage: DRIVER_SALARY_PERCENTAGE,
      },
    });

    await Notification.create({
      type: "new_booking",
      message: `New booking created - ${booking.bookingId}`,
    });

    const customerMsg = `வணக்கம்! EAGLE TRANSPORT-ல் உங்களுடைய புக்கிங் உறுதி செய்யப்பட்டது.\n\n🆔 Booking ID: ${booking.bookingId}\n🔑 Booking OTP: ${booking.otp || 'N/A'}\n📍 Starting Place: ${booking.pickup}\n🏁 Delivery Place: ${booking.drop}\n\nவிரைவில் டிரைவர் மற்றும் வண்டி விவரங்கள் உங்களுக்கு கம்பெனி மூலமாக அனுப்பப்படும். நன்றி!`;
    await sendCompanyWhatsApp(booking.phone, customerMsg);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully and notification sent ✅",
      booking
    });
  } catch (error) {
    console.error("Booking create error:", error);
    res.status(500).json({ success: false, message: "Booking create failed", error: error.message });
  }
};
