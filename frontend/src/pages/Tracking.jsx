import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Lock,
  MapPin,
  Phone,
  Search,
  Truck,
} from 'lucide-react';

import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './Tracking.css';

const API_URL = import.meta.env.VITE_API_URL;

const STEP_LABELS = [
  'Booked',
  'Dispatched',
  'In Transit',
  'Delivered',
];

const DEMO_ROUTE = {
  startLat: 8.7107,
  startLng: 77.4516,
  endLat: 9.9252,
  endLng: 78.1198,
};

const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center?.[0] && center?.[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

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

  const [simulatedLat, setSimulatedLat] = useState(
    DEMO_ROUTE.startLat
  );

  const [simulatedLng, setSimulatedLng] = useState(
    DEMO_ROUTE.startLng
  );

  const simProgressRef = useRef(0);

  // =========================================================
  // HELPERS
  // =========================================================

  const normalizeStatus = (status) => {
    const value = (status || '').toLowerCase();

    if (value.includes('deliver')) {
      return 'Delivered';
    }

    if (
      value.includes('route') ||
      value.includes('transit')
    ) {
      return 'In Transit';
    }

    if (
      value.includes('dispatch') ||
      value.includes('assign')
    ) {
      return 'Dispatched';
    }

    if (
      value.includes('pending') ||
      value.includes('book')
    ) {
      return 'Booked';
    }

    return status || 'Booked';
  };

  const getTruckName = (truck) =>
    truck?.truckNumber ||
    truck?.vehicleNumber ||
    truck?.number ||
    truck?.name ||
    'Not Assigned';

  const getDriverName = (driver) =>
    driver?.driverName ||
    driver?.name ||
    driver?.fullName ||
    'Not Assigned';

  const getDriverPhone = (driver) =>
    driver?.phone ||
    driver?.mobile ||
    'N/A';

  const getPickup = (booking) =>
    booking?.pickup ||
    booking?.pickupLocation ||
    'N/A';

  const getDrop = (booking) =>
    booking?.drop ||
    booking?.dropLocation ||
    'N/A';

  const getActiveStep = () => {
    if (!trackingData?.status) {
      return -1;
    }

    return STEP_LABELS.indexOf(
      normalizeStatus(trackingData.status)
    );
  };

  // =========================================================
  // TRACKING API
  // =========================================================

  const fetchTrackingData = async (
    id,
    trackOtp,
    silent = false
  ) => {
    if (!silent) {
      setLoading(true);
      setError('');
      setTrackingData(null);
      simProgressRef.current = 0;
    }

    try {
      const response = await fetch(
        `${API_URL}/bookings/track`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: id,
            otp: trackOtp,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
          'Invalid Booking ID or OTP'
        );
      }

      setTrackingData(data.booking);

      return data.booking;
    } catch (err) {
      if (silent) {
        console.warn('Auto refresh failed');
      } else {
        setError(
          err.message ||
          'Tracking failed'
        );
      }

      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleTrack = async (event) => {
    event.preventDefault();

    const booking = await fetchTrackingData(
      searchId,
      otp,
      false
    );

    if (!booking) {
      return;
    }

    setBookingIdState(searchId);
    setOtpState(otp);
  };

  const openInvoice = () => {
    const bookingMongoId =
      trackingData?._id ||
      trackingData?.id;

    if (!bookingMongoId) {
      alert('Booking details not found');
      return;
    }

    window.open(
      `${API_URL}/bookings/${bookingMongoId}/invoice`,
      '_blank'
    );
  };

  // =========================================================
  // AUTO REFRESH - EVERY 5 SECONDS
  // =========================================================

  useEffect(() => {
    if (
      !bookingIdState ||
      !otpState
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchTrackingData(
        bookingIdState,
        otpState,
        true
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [bookingIdState, otpState]);

  // =========================================================
  // REAL GPS + DEMO FALLBACK
  // =========================================================

  useEffect(() => {
    if (!trackingData) {
      return undefined;
    }

    const realLat =
      trackingData?.liveLocation?.lat;

    const realLng =
      trackingData?.liveLocation?.lng;

    const hasRealGPS =
      realLat &&
      realLng &&
      Number(realLat) !== 0 &&
      Number(realLng) !== 0;

    if (hasRealGPS) {
      setSimulatedLat(Number(realLat));
      setSimulatedLng(Number(realLng));

      return undefined;
    }

    const simInterval = setInterval(() => {
      if (
        simProgressRef.current < 100
      ) {
        simProgressRef.current += 0.1;

        const fraction =
          simProgressRef.current / 100;

        const nextLat =
          DEMO_ROUTE.startLat +
          (
            DEMO_ROUTE.endLat -
            DEMO_ROUTE.startLat
          ) *
          fraction;

        const nextLng =
          DEMO_ROUTE.startLng +
          (
            DEMO_ROUTE.endLng -
            DEMO_ROUTE.startLng
          ) *
          fraction;

        setSimulatedLat(nextLat);
        setSimulatedLng(nextLng);
      } else {
        simProgressRef.current = 0;
      }
    }, 150);

    return () => {
      clearInterval(simInterval);
    };
  }, [trackingData]);

  // =========================================================
  // DERIVED VALUES
  // =========================================================

  const activeStep = getActiveStep();

  const liveLocationText =
    `${Number(simulatedLat).toFixed(6)}, ` +
    `${Number(simulatedLng).toFixed(6)}`;

  const pickupQuery = encodeURIComponent(
    getPickup(trackingData || {})
  );

  const dropQuery = encodeURIComponent(
    getDrop(trackingData || {})
  );

  const routeMapUrl = trackingData
    ? `https://www.google.com/maps/dir/?api=1&origin=${pickupQuery}&destination=${dropQuery}&travelmode=driving`
    : '#';

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="tracking-page">

      {/* ================= HERO ================= */}

      <section className="tracking-hero">
        <div className="tracking-hero-overlay" />

        <div className="tracking-shell tracking-hero-inner">
          <div className="tracking-hero-copy">

            <div className="tracking-hero-badge">
              <span className="tracking-hero-dot" />
              Secure Shipment Tracking
            </div>

            <h1 className="tracking-hero-title">
              Track Your Shipment
              <span> Live.</span>
            </h1>

            <p className="tracking-hero-description">
              Live updates from pickup to delivery
              with secure Booking ID and OTP verification.
            </p>

            <div className="tracking-hero-features">
              <span>
                <Truck size={14} />
                Live Updates
              </span>

              <span>
                <Lock size={14} />
                OTP Protected
              </span>
            </div>

          </div>
        </div>
      </section>


      {/* ================= MAIN CONTENT ================= */}

      <div className="tracking-shell tracking-content">

        {/* ================= SEARCH CARD ================= */}

        <section className="tracking-search-card">

          <div className="tracking-search-heading">
            <span className="tracking-small-label">
              EAGLE TRANSPORT
            </span>

            <h2>
              Track Your Booking
            </h2>

            <p>
              Enter your Booking ID and Tracking OTP
              to view live shipment updates.
            </p>
          </div>

          <div className="tracking-security-note">
            <Lock size={14} />
            Your details are securely verified
          </div>

          <form
            className="tracking-form"
            onSubmit={handleTrack}
          >
            <div className="tracking-field">
              <label htmlFor="booking-id">
                Booking ID
              </label>

              <input
                id="booking-id"
                type="text"
                placeholder="Enter Booking ID"
                value={searchId}
                onChange={(event) =>
                  setSearchId(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="tracking-field">
              <label htmlFor="tracking-otp">
                Tracking OTP
              </label>

              <input
                id="tracking-otp"
                type="password"
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <button
              className="tracking-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="tracking-spinner" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Track Now
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="tracking-error">
              {error}
            </div>
          )}


          {/* ================= STEPPER ================= */}

          <div className="tracking-progress">

            <h3>
              Shipment Progress
            </h3>

            <div className="tracking-stepper">

              {STEP_LABELS.map(
                (label, index) => {
                  const completed =
                    activeStep >= index;

                  const lineCompleted =
                    activeStep > index;

                  return (
                    <div
                      className="tracking-step"
                      key={label}
                    >
                      <div className="tracking-step-top">

                        <div
                          className={
                            completed
                              ? 'tracking-step-circle active'
                              : 'tracking-step-circle'
                          }
                        >
                          {completed ? (
                            <CheckCircle2
                              size={16}
                            />
                          ) : (
                            <Circle
                              size={16}
                            />
                          )}
                        </div>

                        {index !==
                          STEP_LABELS.length -
                          1 && (
                            <div className="tracking-step-line">
                              <span
                                className={
                                  lineCompleted
                                    ? 'filled'
                                    : ''
                                }
                              />
                            </div>
                          )}

                      </div>

                      <span
                        className={
                          completed
                            ? 'tracking-step-label active'
                            : 'tracking-step-label'
                        }
                      >
                        {label}
                      </span>
                    </div>
                  );
                }
              )}

            </div>
          </div>

        </section>


        {/* ================= EMPTY STATE ================= */}

        {!trackingData &&
          !loading && (
            <section className="tracking-empty-card">

              <div className="tracking-card-header">
                <div>
                  <h3>
                    Live Status Map
                  </h3>

                  <p>
                    Your route preview will appear here.
                  </p>
                </div>

                <span className="tracking-awaiting-badge">
                  Awaiting Search
                </span>
              </div>

              <div className="tracking-empty-body">

                <div className="tracking-route-demo">
                  <span />
                  <div>
                    <Truck
                      size={38}
                    />
                  </div>
                </div>

                <h3>
                  Track your live route
                </h3>

                <p>
                  Verify your Booking ID and OTP to
                  view the latest truck location and status.
                </p>

              </div>

            </section>
          )}


        {/* ================= RESULTS ================= */}

        {trackingData && (
          <section className="tracking-results">

            {/* ================= SUMMARY ================= */}

            <article className="tracking-summary-card">

              <div className="tracking-status-banner">

                <div>
                  <span>
                    CURRENT STATUS
                  </span>

                  <h3>
                    {normalizeStatus(
                      trackingData.status
                    )}
                  </h3>

                  <p>
                    Auto-refresh every 5 seconds
                  </p>
                </div>

                <div className="tracking-active-badge">
                  Tracking Active
                </div>

              </div>

              <div className="tracking-invoice-wrap">
                <button
                  type="button"
                  className="tracking-invoice-btn"
                  onClick={openInvoice}
                >
                  Download Invoice PDF
                </button>
              </div>

              <div className="tracking-summary-grid">

                <SummaryItem
                  label="Booking ID"
                  value={
                    trackingData?.bookingId ||
                    'N/A'
                  }
                />

                <SummaryItem
                  label="Customer"
                  value={
                    trackingData.customerName ||
                    'Customer'
                  }
                />

                <SummaryItem
                  label="Route"
                  value={
                    <>
                      <MapPin size={14} />
                      {getPickup(
                        trackingData
                      )}
                      {' → '}
                      {getDrop(
                        trackingData
                      )}
                    </>
                  }
                />

                <SummaryItem
                  label="Truck"
                  value={
                    <>
                      <Truck size={14} />
                      {getTruckName(
                        trackingData.truck
                      )}
                    </>
                  }
                />

                <SummaryItem
                  label="Driver Name"
                  value={getDriverName(
                    trackingData.driver
                  )}
                />

                <SummaryItem
                  label="Driver Mobile"
                  value={
                    <>
                      <Phone size={14} />
                      {getDriverPhone(
                        trackingData.driver
                      )}
                    </>
                  }
                />

              </div>

            </article>


            {/* ================= MAP ================= */}

            <article className="tracking-map-card">

              <div className="tracking-card-header">

                <div>
                  <h3>
                    Live Route Tracking
                  </h3>

                  <p>
                    Current truck location and route.
                  </p>
                </div>

                <span className="tracking-live-badge">
                  Live Map
                </span>

              </div>

              <div className="tracking-map-wrap">

                <MapContainer
                  center={[
                    simulatedLat,
                    simulatedLng,
                  ]}
                  zoom={11}
                  className="tracking-map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; Eagle Transport"
                  />

                  <ChangeMapView
                    center={[
                      simulatedLat,
                      simulatedLng,
                    ]}
                  />

                  <Marker
                    position={[
                      simulatedLat,
                      simulatedLng,
                    ]}
                  >
                    <Tooltip
                      permanent
                      direction="top"
                      offset={[0, 0]}
                      className="tracking-truck-tooltip"
                    >
                      <div className="tracking-truck-marker">

                        <img
                          src="https://img.icons8.com/color/96/delivery-truck.png"
                          alt="Truck"
                        />

                        <span>
                          🚛{' '}
                          {getDriverName(
                            trackingData.driver
                          )}
                        </span>

                      </div>
                    </Tooltip>
                  </Marker>
                </MapContainer>

                <div className="tracking-gps-badge">
                  <Truck size={15} />

                  {trackingData
                    ?.liveLocation
                    ?.lat &&
                    Number(
                      trackingData
                        .liveLocation
                        .lat
                    ) !== 0
                    ? 'Real GPS Active'
                    : 'Demo Simulation'}
                </div>

              </div>


              {/* ================= ROUTE DETAILS ================= */}

              <div className="tracking-route-card">

                <RoutePoint
                  type="pickup"
                  label="Pickup"
                  value={getPickup(
                    trackingData
                  )}
                />

                <div className="tracking-route-connector" />

                <RoutePoint
                  type="current"
                  label="Current Location"
                  value={liveLocationText}
                />

                <div className="tracking-route-connector" />

                <RoutePoint
                  type="drop"
                  label="Destination"
                  value={getDrop(
                    trackingData
                  )}
                />

              </div>


              {/* ================= MAP ACTIONS ================= */}

              <div className="tracking-map-actions">

                <a
                  href={routeMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tracking-open-map-btn"
                >
                  Open Full Route
                </a>

                <button
                  type="button"
                  className="tracking-refresh-btn"
                  onClick={() =>
                    fetchTrackingData(
                      bookingIdState,
                      otpState,
                      true
                    )
                  }
                >
                  Refresh Location
                </button>

              </div>

            </article>

          </section>
        )}

      </div>
    </main>
  );
};


// =========================================================
// SMALL REUSABLE UI COMPONENTS
// =========================================================

const SummaryItem = ({
  label,
  value,
}) => (
  <div className="tracking-summary-item">

    <span>
      {label}
    </span>

    <strong>
      {value}
    </strong>

  </div>
);


const RoutePoint = ({
  type,
  label,
  value,
}) => (
  <div className="tracking-route-point">

    <span
      className={`tracking-route-dot ${type}`}
    />

    <div>
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>

  </div>
);

export default Tracking;