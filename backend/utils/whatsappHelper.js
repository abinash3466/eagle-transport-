const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const cleanPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("91")) return digits;
  return `91${digits}`;
};

const makeTrackingLink = (booking) => {
  return `${FRONTEND_URL}/tracking?bookingId=${booking.bookingId || ""}&otp=${booking.otp || ""}`;
};

const makeInvoiceLink = (booking) => {
  return `${FRONTEND_URL.replace(":5173", ":5000")}/api/bookings/${booking._id}/invoice`;
};

const makeWhatsAppLink = (phone, message) => {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
};

const bookingConfirmedMessage = (booking) => `
🚚 *Eagle Transport Booking Confirmed* ✅

Hello ${booking.customerName || "Customer"},

Your booking has been created successfully.

🆔 *Booking ID:* ${booking.bookingId}
🔐 *Tracking OTP:* ${booking.otp}

📍 *Pickup:* ${booking.pickup}
📍 *Drop:* ${booking.drop}
📦 *Goods:* ${booking.goods || "-"}
💰 *Amount:* ₹${Number(booking.amount || 0).toLocaleString("en-IN")}

🔗 *Track your shipment here:*
${makeTrackingLink(booking)}

🧾 *Invoice PDF:*
${makeInvoiceLink(booking)}

Please keep your Booking ID and OTP safe.

Thank you for choosing *Eagle Transport*.
`;

const statusMessage = (booking, title) => `
🚚 *Eagle Transport Status Update*

${title}

🆔 *Booking ID:* ${booking.bookingId}
📌 *Current Status:* ${booking.status}

📍 *Pickup:* ${booking.pickup}
📍 *Drop:* ${booking.drop}
📍 *Current Location:* ${booking.currentLocation || "Not updated"}

🔗 *Live Tracking Link:*
${makeTrackingLink(booking)}

🧾 *Invoice PDF:*
${makeInvoiceLink(booking)}

Thank you for choosing *Eagle Transport*.
`;

module.exports = {
  makeWhatsAppLink,
  makeTrackingLink,
  makeInvoiceLink,
  bookingConfirmedMessage,
  statusMessage,
};