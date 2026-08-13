import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingForm from './BookingForm';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    const section = document.getElementById('booking-form');

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleTrackClick = () => {
    navigate('/tracking');
  };

  return (
    <section className="eagle-premium-hero">
      <div className="eagle-premium-overlay" />

      <div className="container eagle-premium-content">

        {/* ================= HERO CONTENT ================= */}

        <div className="eagle-premium-copy">

          <div className="eagle-premium-badge">
            <span className="eagle-premium-dot" />

            Premium Logistics Service
          </div>

          <h1 className="eagle-premium-title">
            Fast & Easy Truck Booking Across{' '}
            <span>India.</span>
          </h1>

          <p className="eagle-premium-desc">
            Simple booking process. Clear truck options.
            Reliable service for District, State, and National loads.
          </p>

          <div className="eagle-premium-actions">

            <button
              type="button"
              className="btn btn-primary eagle-premium-book"
              onClick={handleBookingClick}
            >
              Book Truck Now

              <ArrowRight size={19} />
            </button>

            <button
              type="button"
              className="btn eagle-premium-track"
              onClick={handleTrackClick}
            >
              Track Truck

              <MapPin size={19} />
            </button>

          </div>

        </div>


        {/* ================= BOOKING FORM ================= */}

        <div
          id="booking-form"
          className="eagle-premium-form"
        >
          <BookingForm />
        </div>

      </div>


      {/* ================= RESPONSIVE STYLE ================= */}

      <style>{`

        /* =================================================
           DESKTOP / LAPTOP
        ================================================= */

        .eagle-premium-hero {
          position: relative;

          width: 100%;

          isolation: isolate;

          overflow: hidden;

          background:
            linear-gradient(
              180deg,
              rgba(4, 19, 38, 0.25),
              rgba(3, 17, 34, 0.42)
            ),
            url('/hero-bg.jpg');

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }


        .eagle-premium-overlay {
          position: absolute;

          inset: 0;

          z-index: -1;

          background:
            linear-gradient(
              90deg,
              rgba(3, 20, 40, 0.97) 0%,
              rgba(4, 25, 49, 0.82) 43%,
              rgba(5, 22, 42, 0.36) 75%,
              rgba(4, 18, 34, 0.20) 100%
            );
        }


        .eagle-premium-content {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(390px, 0.92fr);

          align-items: center;

          gap: 36px;

          padding-top: 44px;
          padding-bottom: 44px;
        }


        /* ================= LEFT HERO ================= */

        .eagle-premium-copy {
          width: 100%;

          max-width: 620px;

          color: #ffffff;
        }


        .eagle-premium-badge {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 8px 15px;

          margin-bottom: 18px;

          border:
            1px solid rgba(255, 255, 255, 0.22);

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.09);

          backdrop-filter: blur(12px);

          color:
            rgba(255, 255, 255, 0.96);

          font-size: 0.82rem;

          font-weight: 700;

          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }


        .eagle-premium-dot {
          width: 8px;

          height: 8px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #ff871f;

          box-shadow:
            0 0 14px rgba(255, 135, 31, 0.85);
        }


        .eagle-premium-title {
          max-width: 610px;

          margin: 0 0 16px;

          color: #ffffff;

          font-family: var(--font-heading);

          font-size:
            clamp(
              2.65rem,
              3.8vw,
              3.65rem
            );

          font-weight: 800;

          line-height: 1.03;

          letter-spacing: -0.035em;
        }


        .eagle-premium-title span {
          color: #ff871f;
        }


        .eagle-premium-desc {
          max-width: 550px;

          margin: 0 0 22px;

          color:
            rgba(255, 255, 255, 0.82);

          font-size: 0.96rem;

          line-height: 1.55;
        }


        /* ================= BUTTONS ================= */

        .eagle-premium-actions {
          display: flex;

          gap: 11px;

          flex-wrap: wrap;
        }


        .eagle-premium-book,
        .eagle-premium-track {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          min-height: 47px;

          padding: 0 21px;

          border-radius: 13px;

          font-size: 0.90rem;

          font-weight: 800;
        }


        .eagle-premium-book {
          color: #ffffff;

          background:
            linear-gradient(
              135deg,
              #ff9b35 0%,
              #ff7600 100%
            );

          box-shadow:
            0 14px 30px
            rgba(255, 118, 0, 0.25);
        }


        .eagle-premium-track {
          background:
            rgba(255, 255, 255, 0.97);

          color: #0b315d;

          box-shadow:
            0 12px 26px
            rgba(2, 13, 28, 0.16);
        }


        .eagle-premium-form {
          width: 100%;

          min-width: 0;
        }


        /* =================================================
           MEDIUM DESKTOP
        ================================================= */

        @media (max-width: 1180px) {

          .eagle-premium-content {
            grid-template-columns:
              minmax(0, 0.9fr)
              minmax(390px, 1fr);

            gap: 28px;
          }


          .eagle-premium-title {
            font-size:
              clamp(
                2.45rem,
                4vw,
                3.25rem
              );
          }

        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 992px) {

          .eagle-premium-content {
            grid-template-columns: 1fr;

            max-width: 760px;

            gap: 28px;

            padding-top: 42px;

            padding-bottom: 42px;
          }


          .eagle-premium-copy {
            max-width: 700px;
          }


          .eagle-premium-form {
            width: 100%;
          }

        }


        /* =================================================
           MOBILE
           IMAGE ONLY BEHIND HERO CONTENT
        ================================================= */

        /* =================================================
           MOBILE - PREMIUM COMPACT
           Uses /hero-mobile.png only on mobile
        ================================================= */
        @media (max-width: 768px) {
          .eagle-premium-hero {
            width: 100%;
            background: #f4f7fb !important;
            overflow: visible;
          }

          .eagle-premium-overlay {
            display: none !important;
          }

          .eagle-premium-content {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            gap: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 10px !important;
          }

          /* Image only behind hero content */
          .eagle-premium-copy {
            width: calc(100% + 32px) !important;
            max-width: none !important;
            margin-left: -16px !important;
            margin-right: -16px !important;
            min-height: 0 !important;
            height: auto !important;

            padding: 22px 18px 22px !important;

            color: #ffffff !important;

            background-color: #071a30 !important;
            background-image:
              linear-gradient(
                90deg,
                rgba(3, 20, 40, 0.88) 0%,
                rgba(3, 23, 46, 0.70) 42%,
                rgba(5, 25, 49, 0.24) 70%,
                rgba(5, 19, 36, 0.04) 100%
              ),
              url('/hero-mobile.png') !important;

            background-size: cover !important;
            background-position: 72% 56% !important;
            background-repeat: no-repeat !important;
          }

          .eagle-premium-badge {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-bottom: 13px !important;
            padding: 7px 11px !important;
            border: 1px solid rgba(255,255,255,.24) !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.10) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            font-size: .70rem !important;
            font-weight: 700 !important;
          }

          .eagle-premium-dot {
            width: 7px !important;
            height: 7px !important;
            flex-shrink: 0 !important;
            border-radius: 50% !important;
            background: #ff871f !important;
            box-shadow: 0 0 10px rgba(255,135,31,.80) !important;
          }

          .eagle-premium-title {
            width: 100% !important;
            max-width: 330px !important;
            margin: 0 0 10px !important;
            color: #ffffff !important;
            font-size: clamp(1.92rem, 8.7vw, 2.35rem) !important;
            font-weight: 800 !important;
            line-height: 1.03 !important;
            letter-spacing: -0.035em !important;
          }

          .eagle-premium-title span {
            color: #ff871f !important;
          }

          .eagle-premium-desc {
            width: 100% !important;
            max-width: 330px !important;
            margin: 0 0 14px !important;
            color: rgba(255,255,255,.90) !important;
            font-size: .77rem !important;
            line-height: 1.42 !important;
          }

          .eagle-premium-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            width: 100% !important;
            gap: 8px !important;
          }

          .eagle-premium-book,
          .eagle-premium-track {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            width: 100% !important;
            min-height: 43px !important;
            padding: 0 8px !important;
            border-radius: 11px !important;
            font-size: .75rem !important;
            font-weight: 800 !important;
          }

          .eagle-premium-book {
            color: #fff !important;
            background: linear-gradient(135deg, #ff9b35 0%, #ff7600 100%) !important;
            box-shadow: 0 10px 22px rgba(255,118,0,.24) !important;
          }

          .eagle-premium-track {
            color: #0b315d !important;
            background: rgba(255,255,255,.98) !important;
            box-shadow: 0 10px 20px rgba(2,13,28,.15) !important;
          }

          /* Form becomes a separate clean section */
          .eagle-premium-form {
            position: relative !important;
            z-index: 2 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding-top: 9px !important;
            background: #f4f7fb !important;
            transform: none !important;
          }
        }

        @media (max-width: 430px) {
          .eagle-premium-copy {
            width: calc(100% + 28px) !important;
            margin-left: -14px !important;
            margin-right: -14px !important;
            padding: 20px 16px 21px !important;
            background-position: 72% 56% !important;
          }

          .eagle-premium-badge {
            margin-bottom: 12px !important;
            padding: 6px 10px !important;
            font-size: .68rem !important;
          }

          .eagle-premium-title {
            max-width: 305px !important;
            font-size: 1.92rem !important;
          }

          .eagle-premium-desc {
            max-width: 305px !important;
            font-size: .74rem !important;
            margin-bottom: 13px !important;
          }

          .eagle-premium-book,
          .eagle-premium-track {
            min-height: 42px !important;
            font-size: .72rem !important;
          }

          .eagle-premium-form {
            padding-top: 8px !important;
          }
        }

      `}</style>

    </section>
  );
};

export default HeroSection;