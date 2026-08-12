import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Circle,
  Lock,
  Phone,
  MessageCircle,
} from 'lucide-react';

// 🗺️ லீஃப்லெட் மேப் இம்போர்ட்டுகள் (ரீலோடு ஆகாமல் தடுக்க)
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL;
const stepLabels = ['Booked', 'Dispatched', 'In Transit', 'Delivered'];

// 🚛 பேக்ரவுண்ட் ஷேடோவை மொத்தமாக அழித்து, அசல் ட்ரக்கை மட்டும் காட்டும் புதிய ஐகான் லாஜிக் அண்ணே!
const truckIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/96/delivery-truck.png',
  iconSize: [45, 45],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
  shadowUrl: null, // 👈 இந்த வரியை ஆட் பண்ணியிருக்கேன் அண்ணே! இதுதான் அந்த பழைய பச்சை புள்ளியை அடியோடு காலி பண்ணும்!
  shadowSize: [0, 0],
  shadowAnchor: [0, 0]
});

// 📍 மேப் வியூவை வண்டி நகரும் இடத்திற்கு தானாகவே மாத்தும் ஒரு குட்டி லாஜிக்
const ChangeMapView = ({ center }) => {
  const map = useMap();
  if (center[0] && center[1]) {
    map.setView(center, map.getZoom());
  }
  return null;
};

const Tracking = () => {
  const { bookingId } = useParams();

  const [searchId, setSearchId] = useState(bookingId || '');
  const [otp, setOtp] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const [bookingIdState, setBookingIdState] = useState('');
  const [otpState, setOtpState] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🎮 TESTING SIMULATION STATES
  const [simulatedLat, setSimulatedLat] = useState(8.7107); // ஆரம்ப இடம்: அம்பாசமுத்திரம்
  const [simulatedLng, setSimulatedLng] = useState(77.4516);
  const simProgressRef = useRef(0);

  const normalizeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('route') || s.includes('transit')) return 'In Transit';
    if (s.includes('dispatch') || s.includes('assign')) return 'Dispatched';
    if (s.includes('pending') || s.includes('book')) return 'Booked';
    return status || 'Booked';
  };

  const getActiveStep = () => {
    if (!trackingData || !trackingData.status) return -1;
    return stepLabels.indexOf(normalizeStatus(trackingData.status));
  };

  const getTruckName = (truck) =>
    truck?.truckNumber || truck?.vehicleNumber || truck?.number || truck?.name || 'Not Assigned';

  const getDriverName = (driver) =>
    driver?.driverName || driver?.name || driver?.fullName || 'Not Assigned';

  const getDriverPhone = (driver) => driver?.phone || driver?.mobile || 'N/A';
  const getPickup = (booking) => booking.pickup || booking.pickupLocation || 'N/A';
  const getDrop = (booking) => booking.drop || booking.dropLocation || 'N/A';
  const getGoods = (booking) => booking.goods || booking.goodsType || 'Goods';

  const fetchTrackingData = async (id, trackOtp, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
      setTrackingData(null);
      simProgressRef.current = 0;
    }

    try {
      const res = await fetch(`${API_URL}/bookings/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, otp: trackOtp }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid Booking ID or OTP');
      }

      setTrackingData(data.booking);
      return data.booking;
    } catch (err) {
      if (silent) {
        console.warn("Auto refresh failed");
      } else {
        setError(err.message || 'Tracking failed');
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openInvoice = () => {
    const bookingMongoId = trackingData?._id || trackingData?.id;
    if (!bookingMongoId) {
      alert('Booking details not found');
      return;
    }
    window.open(`${API_URL}/bookings/${bookingMongoId}/invoice`, '_blank');
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    const booking = await fetchTrackingData(searchId, otp, false);
    if (booking) {
      setBookingIdState(searchId);
      setOtpState(otp);
    }
  };

  // 📡 1. REAL TIME LIVE REFRESH INTERVAL (5 Seconds)
  useEffect(() => {
    if (!bookingIdState || !otpState) return;

    const interval = setInterval(() => {
      fetchTrackingData(bookingIdState, otpState, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingIdState, otpState]);

  // 🎮 2. SMART SIMULATION & REAL GPS FALLBACK LOGIC
  useEffect(() => {
    if (!trackingData) return;

    const realLat = trackingData?.liveLocation?.lat;
    const realLng = trackingData?.liveLocation?.lng;

    // 🛡️ PRO PRODUCTION MODE: டேட்டாபேஸ்ல ரியல் ஜிபிஎஸ் கோஆர்டினேட்ஸ் வந்தா சிமுலேஷன் ஆஃப் ஆகி ரியல் லொகேஷன் காட்டும்!
    const hasRealGPS = realLat && realLng && Number(realLat) !== 0 && Number(realLng) !== 0;

    if (hasRealGPS) {
      setSimulatedLat(Number(realLat));
      setSimulatedLng(Number(realLng));
      return;
    }

    // 🎮 TESTING SIMULATION MODE: ரியல் ஜிபிஎஸ் இல்லைனா வண்டி அம்பாசமுத்திரத்துல இருந்து மதுரைக்கு ஸ்மூத்தா நகரும்!
    const startLat = 8.7107;
    const startLng = 77.4516;
    const endLat = 9.9252;
    const endLng = 78.1198;

    const simInterval = setInterval(() => {
      if (simProgressRef.current < 100) {
        // 🔄 வண்டி ஒரு செகண்டுக்கு வெறும் 0.1% வீதம் தான் நகரும். இதனால ஜார்க் (Jerk) இல்லாம ஸ்மூத்தா இருக்கும்!
        simProgressRef.current += 0.1;
        const fraction = simProgressRef.current / 100;

        const nextLat = startLat + (endLat - startLat) * fraction;
        const nextLng = startLng + (endLng - startLng) * fraction;

        setSimulatedLat(nextLat);
        setSimulatedLng(nextLng);
      } else {
        simProgressRef.current = 0; // 100% முடிஞ்சதும் திரும்பவும் முதல்ல இருந்து கிளம்பும்
      }
    }, 150); // ⏱️ டைமிங் இன்டர்வெல்லை 150ms-ஆ குறைச்சதால, அனிமேஷன் பிரேம்ஸ் கூடி வண்டி 'மிதந்து' போற மாதிரி இருக்கும் அண்ணே!

    return () => clearInterval(simInterval);
  }, [trackingData]);

  const activeStep = getActiveStep();
  const liveLocationText = `${Number(simulatedLat).toFixed(6)}, ${Number(simulatedLng).toFixed(6)}`;

  const pickupQuery = encodeURIComponent(getPickup(trackingData || {}));
  const dropQuery = encodeURIComponent(getDrop(trackingData || {}));
  const routeMapUrl = trackingData
    ? `https://www.google.com/maps/dir/?api=1&origin=${pickupQuery}&destination=${dropQuery}&travelmode=driving`
    : "#";

  return (
    <div style={styles.page}>
      <div className="container" style={styles.container}>
        <div className="card tracking-premium-card" style={styles.searchCard}>
          <div style={styles.cardTop}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={styles.topBadge}>Eagle Transport Secure Tracking</div>
              <h1 style={styles.mainTitle}>Track Your Booking</h1>
              <p className="text-muted" style={styles.mainSubTitle}>
                Enter your Booking ID and Tracking OTP to view live shipment updates.
              </p>
            </div>
          </div>

          <div style={styles.securityNote}>
            <Lock size={16} />
            <span>Your data is securely verified</span>
          </div>

          <form onSubmit={handleTrack} style={styles.searchForm}>
            <div className="form-group tracking-field" style={{ flex: 1 }}>
              <label style={styles.inputLabel}>Booking ID</label>
              <input
                type="text"
                className="form-control tracking-input"
                placeholder="Booking ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                required
              />
            </div>

            <div className="form-group tracking-field" style={{ flex: 1 }}>
              <label style={styles.inputLabel}>Tracking OTP</label>
              <input
                type="password"
                className="form-control tracking-input"
                placeholder="Tracking OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary tracking-btn" disabled={loading} style={styles.trackButton}>
              {loading ? (
                <span style={styles.loadingWrap}>
                  <span className="tracking-spinner" style={styles.spinner}></span>
                  Tracking...
                </span>
              ) : (
                <>
                  <Search size={20} />
                  Track Now
                </>
              )}
            </button>
          </form>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.stepperSection}>
            <h3 style={styles.sectionTitle}>Shipment Progress</h3>
            <div style={styles.stepperWrap}>
              {stepLabels.map((label, index) => {
                const completed = activeStep >= index;
                const lineCompleted = activeStep > index;

                return (
                  <div key={label} style={styles.stepItem}>
                    <div style={styles.stepTop}>
                      <div style={{ ...styles.stepCircle, ...(completed ? styles.stepCircleActive : {}) }}>
                        {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>
                      {index !== stepLabels.length - 1 && (
                        <div style={styles.stepLine}>
                          <div style={{ ...styles.stepLineFill, width: lineCompleted ? '100%' : '0%' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ ...styles.stepLabel, color: completed ? 'var(--dark-blue)' : 'var(--text-muted)' }}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!trackingData && !loading && (
          <div className="card tracking-empty-card" style={styles.emptyStateCard}>
            <div style={styles.emptyMapHeader}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--dark-blue)' }}>Live Status Map</h3>
                <p className="text-muted" style={{ margin: '6px 0 0 0' }}>Real-time route preview will appear here</p>
              </div>
              <span style={styles.liveBadgeMuted}>Awaiting Search</span>
            </div>

            <div style={styles.emptyMapBox}>
              <div style={styles.truckIllustrationWrap}>
                <div style={styles.routeLine}></div>
                <div style={styles.truckBubble}><Truck size={44} color="#ff8c1a" /></div>
              </div>
              <h3 style={styles.emptyTitle}>Enter your details to see the live route</h3>
              <p style={styles.emptyText}>Once you verify your Booking ID and OTP, Eagle Transport will show current status...</p>
            </div>
          </div>
        )}

        {trackingData && (
          <div className="fade-in" style={styles.resultsGrid}>
            <div style={styles.leftCol}>
              <div className="card" style={styles.summaryCard}>
                <div style={styles.statusBanner}>
                  <div>
                    <h3 style={{ margin: 0, color: 'rgb(255, 255, 255)' }}>Status: {normalizeStatus(trackingData.status)}</h3>
                    <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.8)' }}>Auto-refresh enabled every 5 seconds</p>
                  </div>
                  <span className="badge badge-success">Tracking Active</span>
                </div>

                <div style={{ padding: '0 24px' }}>
                  <button type="button" onClick={openInvoice} className="btn btn-primary" style={styles.invoiceBtn}>
                    Download Invoice PDF
                  </button>
                </div>

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Booking ID</p><p style={styles.summaryValue}>{trackingData?.bookingId}</p></div>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Customer</p><p style={styles.summaryValue}>{trackingData.customerName || 'Customer'}</p></div>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Route</p><p style={styles.summaryValue}><MapPin size={14} style={styles.inlineIcon} /> {getPickup(trackingData)} → {getDrop(trackingData)}</p></div>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Truck</p><p style={styles.summaryValue}><Truck size={14} style={styles.inlineIcon} /> {getTruckName(trackingData.truck)}</p></div>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Driver Name</p><p style={styles.summaryValue}>{getDriverName(trackingData.driver)}</p></div>
                  <div style={styles.summaryItem}><p className="text-muted" style={styles.summaryLabel}>Driver Mobile</p><p style={styles.summaryValue}><Phone size={14} style={styles.inlineIcon} /> {getDriverPhone(trackingData.driver)}</p></div>
                </div>
              </div>
            </div>

            {/* 🗺️ இப்போ இந்த மேப் பாக்ஸ் முழுமையா லீஃப்லெட்க்கு மாறியாச்சு அண்ணே, துளி கூட ரீலோடு ஆகாது! */}
            <div className="card" style={styles.mapCard}>
              <div style={styles.mapHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>Live Route Tracking</h3>
                  <p className="text-muted" style={{ margin: "6px 0 0 0" }}>
                    Smooth moving truck marker without full page reload blink.
                  </p>
                </div>
                <span className="badge badge-info">Live OpenMap</span>
              </div>

              <div style={styles.premiumMapWrap}>
                <MapContainer center={[simulatedLat, simulatedLng]} zoom={11} style={{ width: '100%', height: '100%', zIndex: 1 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; Eagle Transport'
                  />
                  <ChangeMapView center={[simulatedLat, simulatedLng]} />

                  {/* 🚛 இதுதான் அண்ணே மேப்ல ஸ்மூத்தா நகர்ற உங்க கஸ்டம் ட்ரக் மார்க்கர்! */}
                  {/* 🚀 அண்ணே, லீஃப்லெட் மார்க்கர் பக் வராமல் இருக்க, நேரடியாக டூல்திப் வழியா ட்ரக் ஐகானை லாக் செய்கிறோம்! */}
                  <Marker position={[simulatedLat, simulatedLng]}>
                    <Tooltip
                      permanent
                      direction="top"
                      offset={[0, 0]}
                      style={{
                        background: 'none',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* 🚛 அச்சு அசல் ரெட் கலர் டெலிவரி ட்ரக் ஐகான் பளிச்சுனு தெரியும்! */}
                        <img
                          src="https://img.icons8.com/color/96/delivery-truck.png"
                          alt="Truck Icon"
                          style={{
                            width: '50px',
                            height: '50px',
                            animation: 'pulse 1.5s infinite alternate',
                            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.25))'
                          }}
                        />
                        {/* 🏷️ வண்டிக்கு மேலே ஒரு க்யூட்டான டிரைவர் நேம் டேக் அண்ணே! */}
                        <span style={{
                          background: '#0f3057',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          marginTop: '4px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                          whiteSpace: 'nowrap'
                        }}>
                          🚛 {getDriverName(trackingData.driver)}
                        </span>
                      </div>
                    </Tooltip>
                  </Marker>
                </MapContainer>

                <div style={styles.truckLiveBadge}>
                  <Truck size={18} />
                  <span>
                    {trackingData?.liveLocation?.lat && Number(trackingData.liveLocation.lat) !== 0
                      ? "📡 Real GPS Active"
                      : "🎮 Smooth Demo Simulation"}
                  </span>
                </div>
              </div>

              <div style={styles.routeProgressCard}>
                <div style={styles.routePointRow}>
                  <span style={styles.pickupDot}></span>
                  <div><p style={styles.routePointLabel}>Pickup</p><h4 style={styles.routePointValue}>{getPickup(trackingData)}</h4></div>
                </div>
                <div style={styles.routeDashLine}></div>
                <div style={styles.routePointRow}>
                  <span style={styles.currentDot}></span>
                  <div><p style={styles.routePointLabel}>Current Location</p><h4 style={styles.routePointValue}>{liveLocationText}</h4></div>
                </div>
                <div style={styles.routeDashLine}></div>
                <div style={styles.routePointRow}>
                  <span style={styles.dropDot}></span>
                  <div><p style={styles.routePointLabel}>Destination</p><h4 style={styles.routePointValue}>{getDrop(trackingData)}</h4></div>
                </div>
              </div>

              <div style={styles.mapActionRow}>
                <a href={routeMapUrl} target="_blank" rel="noreferrer" style={styles.openMapBtn}>Open Full Route</a>
                <button type="button" style={styles.refreshMapBtn} onClick={() => fetchTrackingData(bookingIdState, otpState, true)}>
                  Refresh Location
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
      <style>{responsiveCss}</style>
    </div>
  );
};

// ... ஸ்டைல்ஸ் ஆப்ஜெக்ட் அனைத்தும் மாறாமல் அப்படியே தொடர்கிறது ...
const styles = {
  page: { padding: '48px 0', background: 'linear-gradient(180deg, #eef3f9 0%, #f6f8fc 45%, #eef2f7 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
  container: { maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '0 20px' },
  searchCard: { marginBottom: '32px', padding: '34px', borderRadius: '28px', background: 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)', boxShadow: '0 18px 45px rgba(10, 35, 66, 0.08)', border: '1px solid rgba(15, 48, 87, 0.08)' },
  cardTop: { display: 'flex', justifyCenter: 'center', marginBottom: '12px' },
  topBadge: { display: 'inline-block', padding: '8px 16px', borderRadius: '999px', background: 'rgba(17, 54, 102, 0.08)', color: '#12386d', fontWeight: '700', fontSize: '0.82rem', marginBottom: '16px' },
  mainTitle: { fontSize: '2.2rem', marginBottom: '8px', color: 'var(--dark-blue)', fontWeight: '800', letterSpacing: '-0.02em' },
  mainSubTitle: { fontSize: '1rem', marginBottom: 0 },
  securityNote: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#12386d', border: '1px solid #d8e8ff', padding: '10px 14px', borderRadius: '999px', fontWeight: '600', fontSize: '0.88rem', margin: '0 auto 24px auto' },
  searchForm: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '28px' },
  inputLabel: { display: 'block', marginBottom: '10px', color: 'var(--dark-blue)', fontWeight: '700', fontSize: '0.92rem' },
  trackButton: { minWidth: '170px', height: '52px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '16px', background: 'linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)', border: 'none', boxShadow: '0 10px 25px rgba(255, 140, 26, 0.28)', fontWeight: '700' },
  invoiceBtn: { marginTop: '16px', padding: '14px 22px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%', boxShadow: '0 12px 24px rgba(255, 122, 0, 0.25)' },
  loadingWrap: { display: 'inline-flex', alignItems: 'center', gap: '10px' },
  spinner: { width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' },
  error: { color: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '12px', borderRadius: '14px', marginTop: '16px', textAlign: 'center', fontWeight: '600' },
  stepperSection: { marginTop: '8px' },
  sectionTitle: { marginBottom: '20px', color: 'var(--dark-blue)', fontSize: '1.12rem', fontWeight: '800' },
  stepperWrap: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepTop: { width: '100%', display: 'flex', alignItems: 'center' },
  stepCircle: { width: '44px', height: '44px', minWidth: '44px', borderRadius: '50%', border: '2px solid #d7dfeb', color: '#8ea0b7', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'all 0.25s ease' },
  stepCircleActive: { background: 'linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)', color: '#fff', border: '2px solid #ff8c1a', boxShadow: '0 10px 20px rgba(255, 140, 26, 0.22)' },
  stepLine: { flex: 1, height: '6px', background: '#e7edf5', marginLeft: '10px', borderRadius: '999px', overflow: 'hidden' },
  stepLineFill: { height: '100%', background: 'linear-gradient(90deg, #ff8c1a 0%, #ff7a00 100%)', borderRadius: '999px', transition: 'width 0.35s ease' },
  stepLabel: { marginTop: '12px', textAlign: 'center', fontWeight: '700', fontSize: '0.92rem' },
  emptyStateCard: { padding: 0, overflow: 'hidden', borderRadius: '28px', boxShadow: '0 18px 45px rgba(10, 35, 66, 0.08)', border: '1px solid rgba(15, 48, 87, 0.08)', background: '#fff' },
  emptyMapHeader: { padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' },
  liveBadgeMuted: { display: 'inline-block', padding: '8px 14px', borderRadius: '999px', background: '#f3f4f6', color: '#6b7280', fontWeight: '700', fontSize: '0.8rem' },
  emptyMapBox: { minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)' },
  truckIllustrationWrap: { position: 'relative', marginBottom: '20px', width: '180px', height: '88px' },
  routeLine: { position: 'absolute', top: '50%', left: '0', right: '0', height: '8px', transform: 'translateY(-50%)', borderRadius: '999px', background: 'linear-gradient(90deg, #dfe9f6 0%, #c9d8eb 100%)' },
  truckBubble: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '84px', height: '84px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 12px 28px rgba(18, 56, 109, 0.12)', border: '1px solid #e6eef8' },
  resultsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  summaryCard: { padding: 0, overflow: 'hidden', borderRadius: '24px' },
  statusBanner: { background: 'linear-gradient(135deg, #0f3057 0%, #163d73 100%)', color: 'white', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  summaryGrid: { padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  summaryItem: { padding: '16px', borderRadius: '18px', background: '#f8fbff', border: '1px solid #e7eef7' },
  summaryLabel: { fontSize: '0.82rem', marginBottom: '8px' },
  summaryValue: { fontWeight: '700', color: 'var(--dark-blue)', margin: 0 },
  inlineIcon: { display: 'inline', color: 'var(--primary-blue)', verticalAlign: 'middle', marginBottom: '2px' },
  mapCard: { padding: 0, overflow: 'hidden', height: 'fit-content', borderRadius: '24px' },
  mapHeader: { padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  premiumMapWrap: { height: "420px", width: "100%", background: "linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)", overflow: "hidden", position: "relative" },
  truckLiveBadge: { position: "absolute", left: "18px", bottom: "18px", background: "#ffffff", color: "var(--dark-blue)", border: "1px solid #dbe7f4", boxShadow: "0 12px 28px rgba(10, 35, 66, 0.14)", padding: "10px 14px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, zIndex: 999 },
  routeProgressCard: { padding: "20px 24px", display: "grid", gap: "8px", background: "#ffffff" },
  routePointRow: { display: "flex", alignItems: "center", gap: "12px" },
  routePointLabel: { margin: 0, color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase" },
  routePointValue: { margin: "4px 0 0", color: "var(--dark-blue)", fontSize: "0.96rem", fontWeight: 800 },
  pickupDot: { width: "14px", height: "14px", minWidth: "14px", borderRadius: "50%", background: "rgba(34,197,94,1)" },
  currentDot: { width: "16px", height: "16px", minWidth: "16px", borderRadius: "50%", background: "#ff7a00", boxShadow: "0 0 0 7px rgba(255, 122, 0, 0.16)" },
  dropDot: { width: "14px", height: "14px", minWidth: "14px", borderRadius: "50%", background: "rgba(239,68,68,1)" },
  routeDashLine: { width: "2px", height: "22px", background: "#dbe7f4", marginLeft: "7px" },
  mapActionRow: { padding: "18px 24px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "12px", flexWrap: "wrap" },
  openMapBtn: { textDecoration: "none", background: "linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)", color: "#fff", padding: "12px 18px", borderRadius: "999px", fontWeight: 800, boxShadow: "0 10px 22px rgba(255, 122, 0, 0.22)" },
  refreshMapBtn: { border: "1px solid #dbe7f4", background: "#fff", color: "var(--dark-blue)", padding: "12px 18px", borderRadius: "999px", fontWeight: 800, cursor: "pointer" },
};

const responsiveCss = `
  .tracking-premium-card .tracking-input { min-height: 52px; border-radius: 16px; border: 1px solid #d6e0ec; background: #ffffff; box-shadow: 0 4px 10px rgba(10, 35, 66, 0.03); transition: all 0.25s ease; }
  .tracking-premium-card .tracking-input:focus { border-color: #ff8c1a !important; box-shadow: 0 0 0 4px rgba(255, 140, 26, 0.13); outline: none; }
  .tracking-premium-card .tracking-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(255, 140, 26, 0.34); }
  .tracking-spinner { animation: trackingSpin 0.8s linear infinite; }
  @keyframes trackingSpin { to { transform: rotate(360deg); } }
  @media (max-width: 992px) { .tracking-field { min-width: 100%; } }
  @media (max-width: 768px) {
    .tracking-premium-card h1 { font-size: 1.7rem !important; }
    .tracking-premium-card form { flex-direction: column !important; align-items: stretch !important; }
    .tracking-premium-card form > * { width: 100% !important; }
    .tracking-premium-card button { width: 100% !important; }
    .tracking-results-grid { grid-template-columns: 1fr !important; }
  }
`;

export default Tracking;