import React from 'react';

import {
  Clock3,
  Truck,
  MapPin,
  Route,
} from 'lucide-react';

import HeroSection from '../components/HeroSection';

import WhyChooseSection from '../components/WhyChooseSection';

import PartnerSection from '../components/PartnerSection';

import ContactSection from '../components/ContactSection';


const Home = () => {

  return (

    <div className="fade-in premium-home">


      {/* =========================================
          HERO + BOOKING
      ========================================= */}

      <HeroSection />


      {/* =========================================
          QUICK STATS
      ========================================= */}

      <section className="premium-home-stats">

        <div className="container premium-home-stats-grid">


          {/* Total Trucks */}

          <article className="premium-stat-card">

            <div className="premium-stat-icon">

              <Truck size={23} />

            </div>

            <div>

              <strong>
                8+
              </strong>

              <span>
                Total Trucks
              </span>

            </div>

          </article>


          {/* Support */}

          <article className="premium-stat-card">

            <div className="premium-stat-icon">

              <Clock3 size={23} />

            </div>

            <div>

              <strong>
                24/7
              </strong>

              <span>
                Booking Support
              </span>

            </div>

          </article>


          {/* Tracking */}

          <article className="premium-stat-card">

            <div className="premium-stat-icon">

              <MapPin size={23} />

            </div>

            <div>

              <strong>
                Live
              </strong>

              <span>
                GPS Tracking
              </span>

            </div>

          </article>


          {/* Coverage */}

          <article className="premium-stat-card">

            <div className="premium-stat-icon">

              <Route size={23} />

            </div>

            <div>

              <strong>
                India
              </strong>

              <span>
                Wide Service
              </span>

            </div>

          </article>


        </div>

      </section>


      {/* =========================================
          FLEET PREVIEW
      ========================================= */}

      <section className="container premium-fleet-preview">


        <div className="premium-section-heading">

          <span>
            EXPLORE OUR FLEET
          </span>

          <h2>
            Right Truck. Right Route.
          </h2>

          <p>
            Flexible transport options for local,
            state and national deliveries.
          </p>

        </div>


        <div className="premium-fleet-grid">


          {/* Heavy Truck */}

          <div className="card premium-fleet-card">

            <div className="premium-fleet-index">
              01
            </div>

            <h3>
              Heavy Truck
            </h3>

            <p className="text-muted">
              Best for inter-state heavy goods
            </p>

          </div>


          {/* Mini Truck */}

          <div className="card premium-fleet-card">

            <div className="premium-fleet-index">
              02
            </div>

            <h3>
              Mini Truck
            </h3>

            <p className="text-muted">
              Best for local city deliveries
            </p>

          </div>


          {/* Trailer */}

          <div className="card premium-fleet-card">

            <div className="premium-fleet-index">
              03
            </div>

            <h3>
              Trailer
            </h3>

            <p className="text-muted">
              Best for containers and large machinery
            </p>

          </div>


        </div>

      </section>


      {/* =========================================
          EXISTING SECTIONS
      ========================================= */}

      <WhyChooseSection />

      <PartnerSection />

      <ContactSection />


      {/* =========================================
          HOME PAGE STYLE
      ========================================= */}

      <style>{`

        .premium-home {
          width: 100%;

          overflow-x: hidden;

          background: #f6f8fc;
        }


        /* =================================================
           STATS SECTION
        ================================================= */

        .premium-home-stats {
          position: relative;

          z-index: 4;

          padding:
            16px
            0
            8px;

          background: #f6f8fc;
        }


        .premium-home-stats-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 13px;
        }


        .premium-stat-card {
          display: flex;

          align-items: center;

          gap: 13px;

          min-height: 92px;

          padding:
            15px
            16px;

          border:
            1px solid
            rgba(15, 49, 88, 0.08);

          border-radius:
            18px;

          background:
            rgba(
              255,
              255,
              255,
              0.96
            );

          box-shadow:
            0 12px 28px
            rgba(
              15,
              49,
              88,
              0.07
            );

          transition:
            transform
            0.2s ease,
            box-shadow
            0.2s ease;
        }


        .premium-stat-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 16px 34px
            rgba(
              15,
              49,
              88,
              0.10
            );
        }


        .premium-stat-icon {
          display: grid;

          place-items: center;

          width: 48px;

          height: 48px;

          flex:
            0
            0
            auto;

          border-radius:
            15px;

          color: #ff7a00;

          background: #fff1e5;
        }


        .premium-stat-card strong {
          display: block;

          color: #0b315d;

          font-family:
            var(--font-heading);

          font-size:
            1.5rem;

          font-weight: 800;

          line-height: 1;
        }


        .premium-stat-card span {
          display: block;

          margin-top: 5px;

          color: #64748b;

          font-size:
            0.79rem;

          font-weight: 600;

          line-height: 1.25;
        }


        /* =================================================
           FLEET SECTION
        ================================================= */

        .premium-fleet-preview {
          padding-top: 52px;

          padding-bottom: 60px;
        }


        .premium-section-heading {
          max-width: 650px;

          margin:
            0
            auto
            26px;

          text-align: center;
        }


        .premium-section-heading > span {
          display: inline-block;

          margin-bottom: 8px;

          color: #ff7a00;

          font-size:
            0.74rem;

          font-weight: 800;

          letter-spacing:
            0.16em;
        }


        .premium-section-heading h2 {
          margin:
            0
            0
            8px;

          color: #0b315d;

          font-size:
            clamp(
              1.9rem,
              4vw,
              2.55rem
            );

          font-weight: 800;

          letter-spacing:
            -0.025em;
        }


        .premium-section-heading p {
          margin: 0;

          color: #64748b;

          font-size:
            0.95rem;
        }


        .premium-fleet-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 15px;
        }


        .premium-fleet-card {
          position: relative;

          overflow: hidden;

          min-height: 140px;

          padding: 22px;

          border-radius:
            19px;

          background:
            linear-gradient(
              145deg,
              #ffffff,
              #f8fbff
            );
        }


        .premium-fleet-index {
          position: absolute;

          top: 14px;

          right: 17px;

          color:
            rgba(
              15,
              49,
              88,
              0.12
            );

          font-size:
            1.9rem;

          font-weight: 900;
        }


        .premium-fleet-card h3 {
          margin:
            29px
            0
            6px;

          color: #0b315d;
        }


        .premium-fleet-card p {
          margin: 0;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 992px) {

          .premium-home-stats-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }


          .premium-fleet-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }


          .premium-fleet-card:last-child {
            grid-column:
              1 / -1;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 768px) {

          .premium-home-stats {
            padding:
              10px
              0
              4px;
          }


          .premium-home-stats-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 8px;
          }


          .premium-stat-card {
            min-height: 75px;

            gap: 8px;

            padding:
              10px
              9px;

            border-radius:
              15px;
          }


          .premium-stat-icon {
            width: 38px;

            height: 38px;

            border-radius:
              12px;
          }


          .premium-stat-icon svg {
            width: 18px;

            height: 18px;
          }


          .premium-stat-card strong {
            font-size:
              1.16rem;
          }


          .premium-stat-card span {
            margin-top: 3px;

            font-size:
              0.64rem;
          }


          .premium-fleet-preview {
    padding-top: 22px;
    padding-bottom: 24px;
  }

  .premium-section-heading {
    margin-bottom: 12px;
  }

  .premium-section-heading > span {
    margin-bottom: 4px;

    font-size: 0.56rem;
    letter-spacing: 0.14em;
  }

  .premium-section-heading h2 {
    max-width: 310px;

    margin: 0 auto 5px;

    font-size: 1.32rem;
    line-height: 1.1;

    letter-spacing: -0.02em;
  }

  .premium-section-heading p {
    max-width: 300px;

    margin: 0 auto;

    font-size: 0.68rem;
    line-height: 1.35;
  }

  .premium-fleet-grid {
    display: grid;

    grid-template-columns: 1fr;

    gap: 7px;
  }

  .premium-fleet-card,
  .premium-fleet-card:last-child {
    grid-column: auto;

    min-height: 72px;

    padding: 11px 13px;

    border-radius: 13px;

    background:
      linear-gradient(
        145deg,
        #ffffff 0%,
        #f8fbff 100%
      );

    border:
      1px solid rgba(15, 49, 88, 0.08);

    box-shadow:
      0 7px 18px rgba(15, 49, 88, 0.06);
  }

  .premium-fleet-card h3 {
    margin: 8px 0 2px;

    color: #0b315d;

    font-size: 0.88rem;
    line-height: 1.15;
  }

  .premium-fleet-card p {
    margin: 0;

    color: #64748b;

    font-size: 0.64rem;
    line-height: 1.3;
  }

  .premium-fleet-index {
    top: 8px;
    right: 10px;

    font-size: 1.15rem;

    color:
      rgba(15, 49, 88, 0.10);
  }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 390px) {

          .premium-stat-card {
            padding:
              9px
              8px;
          }


          .premium-stat-icon {
            width: 35px;

            height: 35px;
          }


          .premium-stat-card strong {
            font-size:
              1.05rem;
          }


          .premium-stat-card span {
            font-size:
              0.59rem;
          }

        }

      `}</style>

    </div>

  );
};

export default Home;