const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const axios = require("axios");
const { GST_PERCENTAGE } = require("../config/financeConfig");

const {
  makeWhatsAppLink,
  bookingConfirmedMessage,
} = require("../utils/whatsappHelper");

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
  return "ET" + Date.now().toString().slice(-6);
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};



exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
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
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const paymentMode = String(
      req.body.paymentMode || booking.payment?.paymentMode || "Cash"
    );
    const receivedAmount = Number(req.body.receivedAmount || 0);

    if (!Number.isFinite(receivedAmount) || receivedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Received amount must be 0 or greater",
      });
    }

    const baseAmount = Number(booking.amount || 0);
    const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;
    const totalWithGST = baseAmount + gstAmount;
    const alreadyPaid = Number(booking.payment?.advanceAmount || 0);
    const pendingBeforePayment = Math.max(totalWithGST - alreadyPaid, 0);

    if (receivedAmount > pendingBeforePayment + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Maximum receivable amount is ₹${pendingBeforePayment.toFixed(2)}`,
      });
    }

    const totalPaid = Math.min(alreadyPaid + receivedAmount, totalWithGST);
    const balanceAmount = Math.max(totalWithGST - totalPaid, 0);
    const paymentStatus =
      totalPaid <= 0 ? "Pending" :
      balanceAmount > 0.01 ? "Partial" : "Paid";

    if (!booking.payment) booking.payment = {};
    if (!Array.isArray(booking.payment.paymentHistory)) booking.payment.paymentHistory = [];

    booking.payment.paymentMode = paymentMode;
    booking.payment.advanceAmount = Number(totalPaid.toFixed(2));
    booking.payment.balanceAmount = Number(balanceAmount.toFixed(2));
    booking.payment.paymentStatus = paymentStatus;
    booking.payment.gstPercentage = GST_PERCENTAGE;
    booking.payment.gstAmount = Number(gstAmount.toFixed(2));
    booking.payment.totalWithGST = Number(totalWithGST.toFixed(2));

    if (receivedAmount > 0) {
      booking.payment.paymentHistory.push({
        amount: Number(receivedAmount.toFixed(2)),
        paymentMode,
        paidAt: new Date(),
      });
    }

    await booking.save();
    await booking.populate("truck");
    await booking.populate("driver");

    return res.json({
      success: true,
      message: "Payment updated successfully",
      booking,
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
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "In Transit") {
      return res.status(400).json({
        success: false,
        message: "An in-transit booking cannot be deleted",
      });
    }

    await booking.deleteOne();
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
          params: { q: place, format: "json", limit: 1 }
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
