import React, { useMemo, useState } from 'react';
import { createBooking } from "../../api/api";
import { calculateTripPricing } from "../../utils/pricingCalculator";
import {
  Package,
  User,
  Phone,
  MapPin,
  Truck,
  CalendarDays,
  ShieldCheck,
  IndianRupee,
  Sparkles,
  Copy,
  CheckCircle2,
} from 'lucide-react';

const CreateBooking = () => {

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    pickup: '',
    drop: '',
    truckType: '',
    trailerSize: '',
    goodsType: '',
    weight: '',
    date: '',
    priority: 'Normal',
    paymentMode: 'Cash',
    notes: '',
  });

  const [booking, setBooking] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);

  const pricing = useMemo(
    () => calculateTripPricing(form.truckType, distanceKm),
    [form.truckType, distanceKm]
  );

  const priceEstimate = pricing.totalWithGST;

  const calculateDistance = async (pickup, drop) => {
    try {
      // 🔄 ஃப்ரீ ஏபிஐ-க்காக கமா (,) குறியீடுகளை நீக்கிவிட்டு சுத்தமான வார்த்தைகளாக மாற்றுகிறோம்
      const cleanPickup = pickup.replace(/,/g, ' ');
      const cleanDrop = drop.replace(/,/g, ' ');

      // 1. Pickup ஏரியாவின் அட்சரேகையை (Latitude/Longitude) கண்டுபிடிக்கிறோம்
      const geoPickup = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanPickup)}`
      );
      const pickupData = await geoPickup.json();

      // 2. Drop ஏரியாவின் அட்சரேகையை கண்டுபிடிக்கிறோம்
      const geoDrop = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanDrop)}`
      );
      const dropData = await geoDrop.json();

      if (pickupData.length && dropData.length) {
        const lat1 = pickupData[0].lat;
        const lon1 = pickupData[0].lon;

        const lat2 = dropData[0].lat;
        const lon2 = dropData[0].lon;

        // 🚀 OSRM Free API மூலமா அசல் ரோடு தூரத்தை எடுக்கிறோம்
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
        );
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const distance = Math.round(routeData.routes[0].distance / 1000);

          setDistanceKm(distance);
          return distance;
        }
      }
    } catch (err) {
      console.log("Distance calculate panna error: ", err);
    }

    return 0;
  };

  const handleChange = async (e) => {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(updatedForm);

    if (updatedForm.pickup && updatedForm.drop) {
      // 🔄 இன்புட் மாறும் போதே ரன்-டைம்ல கமாக்களை நீக்கி துல்லியமான OSRM தூரத்தைக் கணக்கிடுகிறது
      await calculateDistance(updatedForm.pickup, updatedForm.drop);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      baseAmount: base,
      gstPercentage,
      gstAmount,
      totalWithGST,
    } = calculateTripPricing(form.truckType, distanceKm);

    const newBooking = {
      customerName: form.customerName,
      phone: form.mobile,
      pickup: form.pickup,
      drop: form.drop,
      goods: form.goodsType || form.truckType,
      amount: base,
      bookingType: "vip",
      priority: form.priority.toLowerCase(),
      status: "Booked",
      payment: {
        paymentMode: form.paymentMode,
        advanceAmount: 0,
        balanceAmount: totalWithGST,
        paymentStatus: "Pending",
        gstPercentage: gstPercentage,
        gstAmount: gstAmount,
        totalWithGST: totalWithGST
      },
      notes: `Truck Type: ${form.truckType}${form.trailerSize ? `(${form.trailerSize})` : ""}, Weight: ${form.weight}, Pickup Date: ${form.date}, Payment: ${form.paymentMode}, Notes: ${form.notes}`,
    };

    try {
      const saved = await createBooking(newBooking);
      const savedBooking = saved.booking || saved;
      
      setBooking({
        ...form,
        bookingId: savedBooking.bookingId || "Generated",
        otp: savedBooking.otp || "0000",
        amount: totalWithGST,
        baseAmount: base,
        gstAmount,
        totalWithGST,
        status: "Booked",
        createdAt: new Date().toLocaleString(),
        trailerSize: form.trailerSize,
      });

      alert("VIP Booking saved to database ✅");
    } catch (error) {
      console.error(error);
      alert("Booking save panna error vandhudhu ❌");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div>
          <div style={styles.badge}>
            <Sparkles size={16} />
            Premium Booking Console
          </div>
          <h2 style={styles.title}>Create Booking</h2>
          <p style={styles.subtitle}>
            Quickly create a new shipment, generate Booking ID, OTP, estimated price,
            and prepare it for tracking.
          </p>
        </div>

        <div style={styles.heroMiniCard}>
          <p style={styles.miniLabel}>Total Amount (With GST)</p>
          <h3 style={styles.amount}>
            ₹{priceEstimate.toLocaleString('en-IN')}
          </h3>
          <p style={styles.miniText}>
            Distance: {distanceKm} KM
            <br />
            Base: ₹{pricing.baseAmount.toLocaleString('en-IN')} + GST {pricing.gstPercentage}%
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div className="card" style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Shipment Details</h3>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <Field icon={<User size={18} />} label="Customer Name">
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter customer name"
                required
              />
            </Field>

            <Field icon={<Phone size={18} />} label="Mobile Number">
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter mobile number"
                required
              />
            </Field>

            <Field icon={<MapPin size={18} />} label="Pickup Location">
              <input
                name="pickup"
                value={form.pickup}
                onChange={handleChange}
                style={styles.input}
                placeholder="Pickup city / hub"
                required
              />
            </Field>

            <Field icon={<MapPin size={18} />} label="Drop Location">
              <input
                name="drop"
                value={form.drop}
                onChange={handleChange}
                style={styles.input}
                placeholder="Drop city / destination"
                required
              />
            </Field>

            <Field icon={<Truck size={18} />} label="Truck Type">

              <select
                name="truckType"
                value={form.truckType}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">
                  Select a Truck
                </option>

                <option value="Mini Truck (TATA Ace)">
                  存放 Mini Truck (TATA Ace)
                </option>

                <option value="Pickup Truck">
                  🚚 Pickup Truck
                </option>

                <option value="20ft / 22ft / 24ft Container">
                  📦 20ft / 22ft / 24ft Container
                </option>

                <option value="32 ft Container Truck (SXL)">
                  🚛 32 ft Container Truck (SXL)
                </option>

                <option value="32 ft Container Truck (MXL)">
                  🚛 32 ft Container Truck (MXL)
                </option>

                <option value="19 ft Open Truck">
                  🚚 19 ft Open Truck
                </option>

                <option value="10 Tyre Truck">
                  🛞 10 Tyre Truck
                </option>

                <option value="12 Tyre Truck">
                  🛞 12 Tyre Truck
                </option>

                <option value="14 Tyre Truck">
                  🛞 14 Tyre Truck
                </option>

                <option value="16 Tyre Truck">
                  🛞 16 Tyre Truck
                </option>

                <option value="Trailer Truck">
                  🚛 Trailer Truck
                </option>
              </select>

              {form.truckType === "Trailer Truck" && (
                <select
                  name="trailerSize"
                  value={form.trailerSize}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    marginTop: "10px",
                  }}
                  required
                >
                  <option value="">
                    Select Trailer Size
                  </option>

                  <option value="40 ft">
                    40 ft Trailer
                  </option>

                  <option value="45 ft">
                    45 ft Trailer
                  </option>

                  <option value="48 ft">
                    48 ft Trailer
                  </option>

                  <option value="53 ft">
                    53 ft Trailer
                  </option>
                </select>
              )}

            </Field>

            <Field icon={<Package size={18} />} label="Goods Type">
              <input
                name="goodsType"
                value={form.goodsType}
                onChange={handleChange}
                style={styles.input}
                placeholder="Electronics / Furniture / Textile"
                required
              />
            </Field>

            <Field icon={<Package size={18} />} label="Weight">
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                style={styles.input}
                type="number"
                placeholder="Approx weight in tons"
              />
            </Field>

            <Field icon={<CalendarDays size={18} />} label="Pickup Date">
              <input
                name="date"
                value={form.date}
                onChange={handleChange}
                style={styles.input}
                type="date"
                required
              />
            </Field>

            <Field icon={<ShieldCheck size={18} />} label="Priority">
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={styles.input}
              >
                <option>Normal</option>
                <option>Urgent</option>
              </select>
            </Field>

            <Field icon={<IndianRupee size={18} />} label="Payment Mode">
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                style={styles.input}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Credit</option>
              </select>
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Extra Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                placeholder="Any special loading, unloading, or customer instruction..."
              />
            </div>

            <button className="btn btn-primary" style={styles.submitBtn}>
              <CheckCircle2 size={18} />
              Create Booking
            </button>
          </form>
        </div>

        <div className="card" style={styles.previewCard}>
          <h3 style={styles.sectionTitle}>Booking Preview</h3>

          {!booking ? (
            <div style={styles.emptyPreview}>
              <Package size={54} />
              <h4>No booking created yet</h4>
              <p>Fill the form and create booking to generate Booking ID and OTP.</p>
            </div>
          ) : (
            <div style={styles.ticket}>
              <div style={styles.ticketTop}>
                <div>
                  <p style={styles.ticketLabel}>Booking ID</p>
                  <h2 style={styles.bookingId}>{booking.bookingId}</h2>
                </div>
                <button
                  style={styles.copyBtn}
                  onClick={() => navigator.clipboard.writeText(booking.bookingId)}
                >
                  <Copy size={16} />
                </button>
              </div>

              <div style={styles.otpBox}>
                Tracking OTP: <strong>{booking.otp}</strong>
              </div>

              <Info label="Customer" value={booking.customerName} />
              <Info label="Mobile" value={booking.mobile} />
              <Info label="Route" value={`${booking.pickup} → ${booking.drop}`} />
              <Info
                label="Truck"
                value={`${booking.truckType} ${booking.trailerSize || ""}`}
              />
              <Info label="Distance" value={`${distanceKm} KM`} />
              <Info label="Goods" value={booking.goodsType} />
              <Info label="Actual Amount" value={`₹${Number(booking.baseAmount || 0).toLocaleString('en-IN')}`} />
              <Info label="GST (5%)" value={`+₹${Number(booking.gstAmount || 0).toLocaleString('en-IN')}`} />
              <div style={{ ...styles.infoRow, borderTop: '1px dashed rgba(148,163,184,0.3)', marginTop: '6px', paddingTop: '14px' }}>
                <span>Grand Total</span>
                <strong style={{ color: '#ff7a00', fontSize: '1.2rem' }}>₹{booking.amount.toLocaleString('en-IN')}</strong>
              </div>

              <div style={styles.statusBox}>
                <CheckCircle2 size={18} />
                Booking Created Successfully
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon, label, children }) => (
  <div>
    <label style={styles.label}>
      {icon}
      {label}
    </label>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span>{label}</span>
    <strong>{value || '-'}</strong>
  </div>
);

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    paddingBottom: 20,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    padding: 34,
    borderRadius: 34,
    background:
      "linear-gradient(135deg, #071b34 0%, #0f2f57 35%, #144d8d 65%, #2563eb 100%)",
    color: "#fff",
    display: "grid",
    gridTemplateColumns: "1.5fr 0.7fr",
    gap: 24,
    boxShadow:
      "0 30px 70px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
    padding: "10px 18px",
    borderRadius: 999,
    fontWeight: 800,
    marginBottom: 18,
    border: "1px solid rgba(255,255,255,0.1)",
  },

  title: {
    margin: 0,
    fontSize: "2.4rem",
    fontWeight: 900,
    letterSpacing: "-1px",
    color: "#fff",
  },

  subtitle: {
    margin: "14px 0 0",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.8,
    fontSize: "1rem",
    maxWidth: 700,
  },

  heroMiniCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(16px)",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  },

  miniLabel: {
    margin: 0,
    opacity: 0.85,
    fontWeight: 700,
    letterSpacing: "0.4px",
  },

  amount: {
    margin: "10px 0",
    fontSize: "2.5rem",
    fontWeight: 900,
    color: "#fff",
  },

  miniText: {
    margin: 0,
    opacity: 0.75,
    lineHeight: 1.7,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.7fr",
    gap: 26,
  },

  formCard: {
    position: "relative",
    overflow: "hidden",
    padding: 32,
    borderRadius: 34,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(244,248,255,0.98) 40%, rgba(237,244,255,1) 100%)",
    border: "1px solid rgba(255,255,255,0.7)",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 30px 70px rgba(15,74,136,0.14), 0 12px 35px rgba(0,0,0,0.06)",
  },

  previewCard: {
    position: "relative",
    overflow: "hidden",
    padding: 30,
    borderRadius: 34,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(247,249,255,1) 100%)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow:
      "0 30px 70px rgba(15,74,136,0.12), 0 12px 35px rgba(0,0,0,0.05)",
    height: "fit-content",
  },

  sectionTitle: {
    margin: "0 0 26px",
    fontSize: "1.45rem",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#0f172a",
    fontWeight: 800,
    marginBottom: 10,
    fontSize: "0.95rem",
  },

  input: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid rgba(37,99,235,0.12)",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "0.98rem",
    fontWeight: 700,
    color: "#0f172a",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.98) 100%)",
    boxShadow:
      "0 10px 25px rgba(15,74,136,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    transition: "all 0.28s ease",
  },

  submitBtn: {
    gridColumn: "1 / -1",
    marginTop: 6,
    padding: "18px 24px",
    borderRadius: 22,
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb 0%, #4f46e5 45%, #7c3aed 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "1rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    letterSpacing: "0.3px",
    boxShadow:
      "0 22px 45px rgba(99,102,241,0.35), inset 0 2px 6px rgba(255,255,255,0.22)",
    transition: "all 0.3s ease",
  },

  emptyPreview: {
    minHeight: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#64748b",
    gap: 12,
  },

  ticket: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: 24,
    background:
      "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f5f3ff 100%)",
    border: "1px solid rgba(99,102,241,0.12)",
    boxShadow:
      "0 18px 40px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  },

  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  ticketLabel: {
    margin: 0,
    color: "#64748b",
    fontWeight: 700,
    fontSize: "0.9rem",
  },

  bookingId: {
    margin: "6px 0 0",
    fontSize: "1.8rem",
    color: "#0f172a",
    fontWeight: 900,
    letterSpacing: "0.5px",
  },

  copyBtn: {
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#fff",
    padding: 12,
    borderRadius: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(99,102,241,0.25)",
  },

  otpBox: {
    margin: "18px 0 22px",
    padding: 16,
    borderRadius: 18,
    background:
      "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    color: "#c2410c",
    fontWeight: 800,
    border: "1px solid rgba(251,146,60,0.18)",
    boxShadow: "0 10px 25px rgba(251,146,60,0.12)",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    padding: "14px 0",
    borderBottom: "1px solid rgba(148,163,184,0.14)",
    color: "#0f172a",
    fontSize: "0.96rem",
  },

  statusBox: {
    marginTop: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    color: "#047857",
    background:
      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    padding: 15,
    borderRadius: 18,
    fontWeight: 900,
    boxShadow: "0 10px 25px rgba(16,185,129,0.12)",
  },
};

export default CreateBooking;