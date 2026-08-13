import React, { useState } from 'react';
import { createBooking } from "../api/api";
import { calculateTripPricing } from "../utils/pricingCalculator";
import {
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import {
  Truck,
  MapPin,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";


const BookingForm = () => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    pickup_location: '',
    drop_location: '',
    trip_level: 'State',
    truck_type: '', // ✅ ஆரம்பத்தில் காலியாக இருக்கும் (Select Truck காட்டும்)
    goods_type: '',
    load_weight: '',
  });

  const [estimate, setEstimate] = useState(null);
  const [estimateDetails, setEstimateDetails] = useState(null);

  const [pickupAutoComplete, setPickupAutoComplete] =
    useState(null);

  const [dropAutoComplete, setDropAutoComplete] =
    useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);

  const [distanceKm, setDistanceKm] = useState(0);

  const searchPlace = async (query, type) => {
    if (!query || query.length < 2) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&addressdetails=1&limit=8`
      );

      const data = await response.json();

      if (type === "pickup") {
        setPickupSuggestions(data);
        setShowPickupSuggestions(true);
      } else {
        setDropSuggestions(data);
        setShowDropSuggestions(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🔄 கஸ்டமர் ஏதேனும் இன்புட்டை மாற்றத் தொடங்கினால் பழைய வாடகை விவரங்களை ரீசெட் செய்கிறோம்
    setEstimate(null);
    setEstimateDetails(null);
  };

  const calculateDistance = async (pickup, drop) => {
    try {
      // 🔄 ஸ்டெப் 1: கஸ்டமர் டைப் பண்ணுன அட்ரஸ்ல இருக்குற கமாக்களை நீக்கி ஸ்பேஸா மாத்தி தேடுறோம்
      let cleanPickup = pickup.replace(/,/g, ' ');
      let cleanDrop = drop.replace(/,/g, ' ');

      let geoPickup = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanPickup)}`);
      let pickupData = await geoPickup.json();

      let geoDrop = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanDrop)}`);
      let dropData = await geoDrop.json();

      // 🔄 ஸ்டெப் 2 (SMART BACKUP): ஒருவேளை கமா நீக்கியும் ரிசல்ட் கிடைக்கலனா, கமாவுக்கு அடுத்து இருக்குற மெயின் ஏரியாவை மட்டும் பிரிச்சு எடுக்கிறோம்!
      if (!pickupData.length && pickup.includes(',')) {
        const parts = pickup.split(',');
        const mainArea = parts[parts.length - 1].trim(); // கடைசியாக இருக்கும் மெயின் ஊர் (எ.கா: Madurai)
        geoPickup = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mainArea)}`);
        pickupData = await geoPickup.json();
      }

      if (!dropData.length && drop.includes(',')) {
        const parts = drop.split(',');
        const mainArea = parts[parts.length - 1].trim(); // கடைசியாக இருக்கும் மெயின் ஊர்
        geoDrop = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mainArea)}`);
        dropData = await geoDrop.json();
      }

      // 🚀 ஸ்டெப் 3: இரண்டு இடத்தோட அட்சரேகையும் கிடைச்சா OSRM-க்கு அனுப்பி ரோடு தூரத்தை எடுப்போம்
      if (pickupData.length && dropData.length) {
        const lat1 = pickupData[0].lat;
        const lon1 = pickupData[0].lon;
        const lat2 = dropData[0].lat;
        const lon2 = dropData[0].lon;

        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const distance = Math.round(routeData.routes[0].distance / 1000);
          setDistanceKm(distance); // ஸ்கிரீன்ல KM காட்டும்
          return distance;         // வாடகை கணக்கீட்டிற்குப் போகும்
        }
      }
    } catch (err) {
      console.log("Distance calculate panna error: ", err);
    }

    setDistanceKm(0);
    return 0;
  };


  const handleCheckFare = async (e) => {
    e.preventDefault();

    try {
      if (!formData.pickup_location || !formData.drop_location) {
        alert("Enter pickup & drop");
        return;
      }

      const pricingTruckType =
        formData.truck_type === "Trailer Truck"
          ? `${formData.trailer_size || ""} Trailer`.trim()
          : formData.truck_type;

      if (formData.truck_type === "Trailer Truck" && !formData.trailer_size) {
        alert("Select trailer size");
        return;
      }

      const tripKm = await calculateDistance(
        formData.pickup_location,
        formData.drop_location
      );

      if (tripKm === 0) {
        alert(
          "Distance not found for these locations! ❌\nPlease remove extra address details and just type the Main Area name (e.g., Madurai, Tirunelveli)."
        );
        return;
      }

      const pricing = calculateTripPricing(pricingTruckType, tripKm);

      if (!pricing.ratePerKm || !pricing.baseAmount) {
        alert("Truck rate missing ❌");
        return;
      }

      setEstimate(pricing.totalWithGST);
      setEstimateDetails({
        distance: tripKm,
        rate: pricing.ratePerKm,
        minimumCharge: pricing.minimumCharge,
        baseAmount: pricing.baseAmount,
        gstPercentage: pricing.gstPercentage,
        gstAmount: pricing.gstAmount,
      });
    } catch (error) {
      console.error(error);
      alert("Distance calculate panna mudila ❌");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const baseAmt = estimateDetails?.baseAmount || estimate || 0;
    const gstPct = estimateDetails?.gstPercentage || 5;
    const gstAmt = estimateDetails?.gstAmount || Math.round((baseAmt * gstPct) / 100);
    const totalWithGST = baseAmt + gstAmt;

    const bookingData = {
      customerName: formData.customer_name,
      phone: formData.mobile,
      pickup: formData.pickup_location,
      drop: formData.drop_location,
      goods: formData.goods_type || formData.truck_type,
      amount: baseAmt,
      bookingType: "public",
      priority: "normal",
      status: "Booked",
      payment: {
        paymentMode: "Cash",
        advanceAmount: 0,
        balanceAmount: totalWithGST,
        paymentStatus: "Pending",
        gstPercentage: gstPct,
        gstAmount: gstAmt,
        totalWithGST: totalWithGST
      },
      notes: `Trip Level: ${formData.trip_level}, Truck Type: ${formData.truck_type}`,
    };

    try {
      const saved = await createBooking(bookingData);

      const savedBooking = saved.booking || saved;
      const bookingId = savedBooking?.bookingId || "Generated";
      const otp = savedBooking?.otp || "0000";

      alert(
        `Booking Submitted Successfully ✅\nBooking ID: ${bookingId}\nTracking OTP: ${otp}`
      );

      setFormData({
        customer_name: '',
        mobile: '',
        pickup_location: '',
        drop_location: '',
        trip_level: 'State',
        truck_type: '',
        goods_type: '',
        load_weight: '',
      });

      setEstimate(null);
      setEstimateDetails(null);
    } catch (error) {
      console.error(error);
      alert("Booking submit panna error vandhudhu ❌");
    }
  };

  return (
    <div className="booking-form-wrapper" style={styles.wrapper}>
      <div className="glass-card booking-form-card" style={styles.formCard}>
        <div className="booking-top-row" style={styles.topRow}>
          <div className="booking-badge" style={styles.badge}>
            <Truck size={15} />
            Instant Booking
          </div>

          <div className="booking-live-tag" style={styles.liveTag}>
            ● Live Tracking
          </div>
        </div>

        <h3 className="booking-form-title" style={styles.title}>
          Book a Truck <span style={styles.highlight}>Instantly</span>
        </h3>

        <p className="booking-form-subtitle" style={styles.subtitle}>
          Fast booking with secure tracking & instant confirmation.
        </p>

        <form className="booking-form-grid" onSubmit={handleSubmit} style={styles.formGrid}>
          <div className="form-group">
            <label className="booking-label" style={styles.label}>
              <User size={15} />
              Full Name
            </label>

            <div style={styles.inputWrap}>
              <input
                type="text"
                name="customer_name"
                className="form-control booking-input"
                placeholder="Enter your full name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="booking-label" style={styles.label}>
              <Phone size={15} />
              Mobile Number
            </label>

            <div style={styles.inputWrap}>
              <input
                type="tel"
                name="mobile"
                className="form-control booking-input"
                placeholder="+91 99999 99999"
                value={formData.mobile}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="booking-label" style={styles.label}>
              <MapPin size={15} />
              Pickup Location
            </label>

            <div style={styles.inputWrap}>
              <Autocomplete
                options={{
                  componentRestrictions: {
                    country: "in",
                  },
                }}
                onLoad={(auto) =>
                  setPickupAutoComplete(auto)
                }
                onPlaceChanged={() => {
                  if (!pickupAutoComplete) return;

                  const place =
                    pickupAutoComplete.getPlace();

                  if (place?.formatted_address) {
                    setFormData((prev) => ({
                      ...prev,
                      pickup_location:
                        place.formatted_address,
                    }));
                  }
                }}
              >
                <input
                  type="text"
                  name="pickup_location"
                  className="booking-input"
                  placeholder="Enter pickup location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </Autocomplete>
            </div>
          </div>

          <div className="form-group">
            <label className="booking-label" style={styles.label}>
              <MapPin size={15} />
              Drop Location
            </label>

            <div style={styles.inputWrap}>
              <Autocomplete
                options={{
                  componentRestrictions: {
                    country: "in",
                  },
                }}
                onLoad={(auto) =>
                  setDropAutoComplete(auto)
                }
                onPlaceChanged={() => {
                  if (!dropAutoComplete) return;

                  const place =
                    dropAutoComplete.getPlace();

                  if (place?.formatted_address) {
                    setFormData((prev) => ({
                      ...prev,
                      drop_location:
                        place.formatted_address,
                    }));
                  }
                }}
              >
                <input
                  type="text"
                  name="drop_location"
                  className="booking-input"
                  placeholder="Enter drop location"
                  value={formData.drop_location}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </Autocomplete>
            </div>
          </div>

          <div
            className="form-group booking-select-row"
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              gap: '14px'
            }}
          >

            <div className="booking-select-column" style={{ flex: 1 }}>
              <label className="booking-label" style={styles.label}>
                <Truck size={15} />
                Truck Type
              </label>

              <select
                name="truck_type"
                className="form-control booking-select"
                value={formData.truck_type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Truck</option>

                <option value="Mini Truck (TATA Ace)">
                  Mini Truck (TATA Ace)
                </option>

                <option value="Pickup Truck">
                  Pickup Truck
                </option>

                <option value="32 ft Container Truck (MXL)">
                  32 ft Container Truck (MXL)
                </option>

                <option value="32 ft Container Truck (SXL)">
                  32 ft Container Truck (SXL)
                </option>

                <option value="20ft / 22ft / 24ft Container">
                  20ft / 22ft / 24ft Container
                </option>

                <option value="19 ft Open Truck">
                  19 ft Open Truck
                </option>

                <option value="10 Tyre Truck">
                  10 Tyre Truck
                </option>

                <option value="12 Tyre Truck">
                  12 Tyre Truck
                </option>

                <option value="14 Tyre Truck">
                  14 Tyre Truck
                </option>

                <option value="16 Tyre Truck">
                  16 Tyre Truck
                </option>

                <option value="Trailer Truck">
                  Trailer Truck
                </option>
              </select>

              {/* TRAILER SIZE SELECT */}
              {formData.truck_type === "Trailer Truck" && (
                <div style={{ marginTop: "14px" }}>
                  <select
                    name="trailer_size"
                    className="booking-select"
                    value={formData.trailer_size || ""}
                    onChange={handleChange}
                    style={styles.select}
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
                </div>
              )}
            </div>

            <div className="booking-select-column" style={{ flex: 1 }}>
              <label className="booking-label" style={styles.label}>
                <ShieldCheck size={15} />
                Trip Level
              </label>

              <select
                name="trip_level"
                className="form-control booking-select"
                value={formData.trip_level}
                onChange={handleChange}
                style={styles.select}
              >
                <option>State</option>
                <option>District</option>
                <option>National</option>
              </select>
            </div>
          </div>

          {distanceKm > 0 && (
            <div style={styles.distanceBox}>
              <h3 style={{ margin: 0 }}>
                Total Distance: {distanceKm} KM
              </h3>
            </div>
          )}

          {estimateDetails && (
            <div style={{ ...styles.estimateBox, background: 'linear-gradient(135deg, #071b34 0%, #0f2f57 100%)', textAlign: 'left', padding: '20px', position: 'relative' }}>

              {/* ✕ மார்க் ரீசெட் பட்டன் */}
              <button
                type="button"
                onClick={() => {
                  setEstimate(null);
                  setEstimateDetails(null);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: '0.2s'
                }}
                title="Change Route"
                onMouseEnter={(e) => e.target.style.background = '#ef4444'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                ✕
              </button>

              <span style={{ ...styles.estimateText, color: '#ff7a00', fontWeight: '800', fontSize: '1rem', display: 'block', marginBottom: '12px' }}>
                Fare Breakdown (GST Included)
              </span>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.96rem', fontWeight: '600', marginBottom: '8px' }}>
                <span>Actual Amount:</span>
                <span>₹{estimateDetails.baseAmount.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.8)', fontSize: '0.92rem', marginBottom: '12px' }}>
                <span>GST ({estimateDetails.gstPercentage}%):</span>
                <span>+₹{estimateDetails.gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>Grand Total:</span>
                <h2 style={{ ...styles.estimateAmount, margin: 0, fontSize: '1.9rem', color: '#fff' }}>
                  ₹{estimate.toLocaleString('en-IN')}
                </h2>
              </div>
            </div>
          )}

          <div className="booking-actions" style={styles.actions}>
            {!estimate ? (
              <button
                type="button"
                style={styles.fareBtn}
                onClick={handleCheckFare}
              >
                Check Truck Fare
              </button>
            ) : (
              <div className="booking-confirm-actions" style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={styles.confirmBtn}
                >
                  Confirm Booking
                </button>

                {/* ரன் டைம் ஃபார்ம் கிளியர் பட்டன் */}
                <button
                  type="button"
                  onClick={() => {
                    setEstimate(null);
                    setEstimateDetails(null);
                  }}
                  className="booking-clear-btn"
                  style={{
                    ...styles.fareBtn,
                    width: '35%',
                    background: '#ef4444',
                    boxShadow: '0 16px 30px rgba(239,68,68,0.2)'
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div style={styles.note}>
            ℹ️ After booking, you will receive Booking ID & Tracking OTP.
          </div>
        </form>

        <style>{`
          .booking-form-wrapper,
          .booking-form-wrapper * {
            box-sizing: border-box;
          }

          .booking-form-wrapper {
            width: 100%;
          }

          .booking-form-card {
            width: 100%;
            min-width: 0;
            border: 1px solid rgba(255,255,255,.75) !important;
            background: linear-gradient(145deg, rgba(255,255,255,.99), rgba(246,249,254,.97)) !important;
            box-shadow:
              0 28px 70px rgba(4,18,38,.22),
              inset 0 1px 0 rgba(255,255,255,.95) !important;
          }

          .booking-form-card .form-group {
            min-width: 0;
          }

          .booking-form-card input,
          .booking-form-card select {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
          }

          .booking-form-card input:focus,
          .booking-form-card select:focus {
            border-color: #6aa4ef !important;
            box-shadow: 0 0 0 4px rgba(37,99,235,.09), 0 8px 18px rgba(15,49,88,.06) !important;
          }

          .booking-badge,
          .booking-live-tag {
            white-space: nowrap;
          }


          /* =========================================
             LAPTOP / DESKTOP COMPACT BOOKING FORM
             Mobile styles below remain unchanged
          ========================================= */
          @media (min-width: 769px) {
            .booking-form-wrapper {
              width: 100%;
            }

            .booking-form-card {
              padding: 20px 22px !important;
              border-radius: 22px !important;
            }

            .booking-top-row {
              margin-bottom: 10px !important;
            }

            .booking-badge,
            .booking-live-tag {
              padding: 6px 11px !important;
              font-size: 0.72rem !important;
            }

            .booking-form-title {
              font-size: 1.55rem !important;
              line-height: 1.05 !important;
              margin-bottom: 4px !important;
            }

            .booking-form-subtitle {
              font-size: 0.80rem !important;
              margin-bottom: 14px !important;
              line-height: 1.35 !important;
            }

            .booking-form-grid {
              gap: 0 12px !important;
            }

            .booking-form-card .form-group {
              margin-bottom: 9px !important;
            }

            .booking-label {
              font-size: 0.76rem !important;
              margin-bottom: 5px !important;
              gap: 5px !important;
            }

            .booking-label svg {
              width: 13px !important;
              height: 13px !important;
            }

            .booking-form-card input,
            .booking-form-card select {
              min-height: 42px !important;
              height: 42px !important;
              padding: 8px 12px !important;
              border-radius: 12px !important;
              font-size: 0.82rem !important;
            }

            .booking-select-row {
              gap: 12px !important;
              margin-bottom: 10px !important;
            }

            .booking-actions {
              margin-bottom: 9px !important;
            }

            .booking-actions button {
              min-height: 44px !important;
              padding: 9px 14px !important;
              border-radius: 12px !important;
              font-size: 0.84rem !important;
            }

            .booking-form-grid > div:last-child {
              padding: 9px 12px !important;
              border-radius: 12px !important;
              font-size: 0.72rem !important;
            }

            .booking-confirm-actions {
              gap: 8px !important;
            }
          }

          @media (max-width: 430px) {
            .booking-form-card {
              padding: 14px 13px !important;
              border-radius: 18px !important;
            }

            .booking-form-title {
              font-size: 1.38rem !important;
            }

            .booking-form-card input,
            .booking-form-card select {
              min-height: 38px !important;
              padding: 7px 9px !important;
              font-size: .77rem !important;
            }

            .booking-label {
              font-size: .69rem !important;
            }

            .booking-select-row {
              gap: 7px !important;
            }

            .booking-confirm-actions {
              flex-direction: column !important;
            }

            .booking-clear-btn {
              width: 100% !important;
            }
          }

@media (max-width: 768px) {
            .booking-form-wrapper {
              width: 100% !important;
              padding: 0 !important;
              background: transparent !important;
            }

            .booking-form-card {
              width: 100% !important;
              padding: 12px !important;
              border-radius: 17px !important;
              border: 1px solid #e6edf6 !important;
              background:
                linear-gradient(145deg, #ffffff 0%, #f8fbff 100%) !important;
              box-shadow:
                0 10px 24px rgba(15,49,88,.08),
                inset 0 1px 0 rgba(255,255,255,.95) !important;
            }

            .booking-top-row {
              display: flex !important;
              align-items: center !important;
              justify-content: flex-start !important;
              gap: 6px !important;
              flex-wrap: nowrap !important;
              margin-bottom: 9px !important;
            }

            .booking-badge,
            .booking-live-tag {
              padding: 6px 9px !important;
              border-radius: 999px !important;
              font-size: .66rem !important;
              line-height: 1 !important;
              white-space: nowrap !important;
            }

            .booking-badge svg {
              width: 12px !important;
              height: 12px !important;
            }

            .booking-form-title {
              margin-bottom: 3px !important;
              font-size: 1.26rem !important;
              line-height: 1.04 !important;
              letter-spacing: -.02em !important;
            }

            .booking-form-subtitle {
              margin-bottom: 10px !important;
              font-size: .70rem !important;
              line-height: 1.35 !important;
            }

            /* Keep fields in compact 2-column mobile layout */
            .booking-form-grid {
              display: grid !important;
              grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;
              column-gap: 7px !important;
              row-gap: 0 !important;
            }

            .booking-form-card .form-group {
              min-width: 0 !important;
              margin-bottom: 7px !important;
            }

            .booking-label {
              margin-bottom: 3px !important;
              gap: 4px !important;
              font-size: .66rem !important;
              line-height: 1.15 !important;
              white-space: nowrap !important;
            }

            .booking-label svg {
              width: 12px !important;
              height: 12px !important;
              flex-shrink: 0 !important;
            }

            .booking-form-card input,
            .booking-form-card select {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              min-height: 39px !important;
              height: 39px !important;
              padding: 7px 9px !important;
              border-radius: 10px !important;
              border: 1px solid #dbe5f1 !important;
              background: #ffffff !important;
              font-size: .73rem !important;
              box-shadow: none !important;
            }

            .booking-form-card input::placeholder {
              color: #8a94a4 !important;
              font-size: .71rem !important;
            }

            .booking-select-row {
              grid-column: 1 / -1 !important;
              display: grid !important;
              grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;
              gap: 7px !important;
              margin: 0 0 7px !important;
            }

            .booking-select-column {
              width: 100% !important;
              min-width: 0 !important;
            }

            .booking-actions {
              grid-column: 1 / -1 !important;
              width: 100% !important;
              margin-bottom: 6px !important;
            }

            .booking-actions button {
              width: 100% !important;
              min-height: 40px !important;
              padding: 8px 10px !important;
              border-radius: 10px !important;
              font-size: .77rem !important;
              box-shadow: 0 8px 18px rgba(37,99,235,.18) !important;
            }

            .booking-confirm-actions {
              width: 100% !important;
              gap: 6px !important;
            }

            .booking-clear-btn {
              min-height: 40px !important;
            }

            /* Distance / estimate sections span full width */
            .booking-form-grid > div[style*="grid-column"],
            .booking-form-grid > div[style*="gridColumn"] {
              grid-column: 1 / -1 !important;
            }

            /* Bottom info note */
            .booking-form-grid > div:last-child {
              grid-column: 1 / -1 !important;
              padding: 7px 8px !important;
              border-radius: 10px !important;
              font-size: .62rem !important;
              line-height: 1.25 !important;
            }
          }

          @media (max-width: 430px) {
            .booking-form-card {
              padding: 11px !important;
              border-radius: 16px !important;
            }

            .booking-top-row {
              gap: 5px !important;
              margin-bottom: 8px !important;
            }

            .booking-badge,
            .booking-live-tag {
              padding: 5px 8px !important;
              font-size: .63rem !important;
            }

            .booking-form-title {
              font-size: 1.20rem !important;
            }

            .booking-form-subtitle {
              font-size: .67rem !important;
              margin-bottom: 9px !important;
            }

            .booking-form-grid {
              column-gap: 6px !important;
            }

            .booking-label {
              font-size: .63rem !important;
            }

            .booking-form-card input,
            .booking-form-card select {
              min-height: 38px !important;
              height: 38px !important;
              padding: 6px 8px !important;
              font-size: .70rem !important;
            }

            .booking-form-card input::placeholder {
              font-size: .68rem !important;
            }

            .booking-actions button {
              min-height: 39px !important;
              font-size: .74rem !important;
            }
          }

          @media (max-width: 350px) {
            .booking-form-grid {
              grid-template-columns: 1fr !important;
            }

            .booking-select-row {
              grid-template-columns: 1fr !important;
            }
          }

        `}</style>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
  },

  formCard: {
    padding: '30px',
    borderRadius: '28px',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.96) 100%)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },

  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    color: '#2563eb',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '0.82rem',
  },

  liveTag: {
    background: 'rgba(34,197,94,0.12)',
    color: '#16a34a',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '0.82rem',
  },

  title: {
    fontSize: '2rem',
    marginBottom: '8px',
    fontWeight: '900',
    color: '#0f172a',
  },

  highlight: {
    background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  subtitle: {
    color: '#64748b',
    marginBottom: '24px',
    fontSize: '0.95rem',
    fontWeight: '500',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 16px',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '0.92rem',
  },

  inputWrap: {
    position: 'relative',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid #dbe4ef',
    background: '#ffffff',
    outline: 'none',
    fontSize: '1rem',
    transition: '0.3s',
    boxSizing: 'border-box',
  },

  select: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid #dbe4ef',
    background: '#ffffff',
    outline: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },

  estimateBox: {
    gridColumn: '1 / -1',
    background:
      'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    borderRadius: '20px',
    padding: '18px',
    marginBottom: '16px',
    marginTop: '12px',
    textAlign: 'center',
    boxShadow: '0 14px 30px rgba(37,99,235,0.25)',
  },

  estimateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },

  estimateAmount: {
    color: '#fff',
    margin: '8px 0 0',
    fontSize: '2rem',
    fontWeight: '900',
  },

  actions: {
    gridColumn: '1 / -1',
    marginBottom: '16px',
  },

  fareBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '16px',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #0f172a 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 16px 30px rgba(37,99,235,0.22)',
  },

  confirmBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '16px',
    background:
      'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 16px 30px rgba(22,163,74,0.22)',
  },

  note: {
    gridColumn: '1 / -1',
    fontSize: '0.82rem',
    color: '#475569',
    textAlign: 'center',
    padding: '14px',
    background: 'rgba(37,99,235,0.08)',
    borderRadius: '16px',
    fontWeight: '600',
  },
  suggestionBox: {
    position: "absolute",
    top: "105%",
    left: 0,
    right: 0,
    background: "#ffffff",
    borderRadius: "22px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
    zIndex: 999,
    maxHeight: "320px",
    overflowY: "auto",
    border: "1px solid #dbeafe",
    padding: "8px",
  },

  suggestionItem: {
    padding: "14px 16px",
    cursor: "pointer",
    borderRadius: "14px",
    marginBottom: "6px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "0.92rem",
    fontWeight: "600",
    transition: "0.2s",
  },

  distanceBox: {
    gridColumn: "1 / -1",
    padding: "18px",
    borderRadius: "18px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    textAlign: "center",
    marginTop: "10px",
  },
};

export default BookingForm;