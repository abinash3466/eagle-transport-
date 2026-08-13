import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const Footer = () => {
  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="premium-footer">
        <div className="container premium-footer-container">

          {/* ================= BRAND ================= */}
          <div className="footer-brand-card">
            <div className="footer-brand-top">
              <div>
                <p className="footer-kicker">
                  EAGLE TRANSPORT
                </p>

                <h3>
                  Safe. Fast. Trusted.
                </h3>
              </div>

              <button
                type="button"
                className="footer-top-btn"
                onClick={goTop}
                aria-label="Back to top"
              >
                <ArrowUpRight size={18} />
              </button>
            </div>

            <p className="footer-brand-desc">
              Reliable and transparent truck booking
              services across India.
            </p>
          </div>


          {/* ================= CONTENT ================= */}
          <div className="footer-mobile-grid">

            {/* QUICK LINKS */}
            <div className="footer-mini-card">
              <span className="footer-mini-label">
                EXPLORE
              </span>

              <h4>Quick Links</h4>

              <nav className="footer-links">
                <a href="/">Home</a>
                <a href="/trucks">Truck Types</a>
                <a href="/tracking">
                  Track Booking
                </a>
              </nav>
            </div>


            {/* CONTACT */}
            <div className="footer-mini-card">
              <span className="footer-mini-label">
                CONNECT
              </span>

              <h4>Contact</h4>

              <div className="footer-contact-list">

                <a href="tel:+918428302003">
                  <span className="footer-icon">
                    <Phone size={14} />
                  </span>

                  <span>
                    +91 8428302003
                  </span>
                </a>

                <a href="mailto:support@eagletransport.in">
                  <span className="footer-icon">
                    <Mail size={14} />
                  </span>

                  <span className="footer-email">
                    support@eagletransport.in
                  </span>
                </a>

                <div>
                  <span className="footer-icon">
                    <MapPin size={14} />
                  </span>

                  <span>
                    Ambasamudram,
                    Tirunelveli
                  </span>
                </div>

              </div>
            </div>

          </div>


          {/* ================= BOTTOM ================= */}
          <div className="footer-bottom-premium">
            <span className="footer-bottom-dot" />

            <p>
              © {new Date().getFullYear()} Eagle Transport.
              All rights reserved.
            </p>
          </div>

        </div>
      </footer>


      <style>{`

        /* ==================================================
           DESKTOP
        ================================================== */

        .premium-footer {
          position: relative;

          overflow: hidden;

          padding: 52px 0 20px;

          color: #ffffff;

          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(34, 108, 190, 0.32),
              transparent 34%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(255, 122, 0, 0.10),
              transparent 28%
            ),
            linear-gradient(
              145deg,
              #041a31 0%,
              #062b50 50%,
              #041d37 100%
            );
        }


        .premium-footer::before {
          content: "";

          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          height: 3px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #ff7a00,
              transparent
            );
        }


        .premium-footer-container {
          position: relative;

          z-index: 2;
        }


        /* BRAND CARD */

        .footer-brand-card {
          padding: 25px;

          margin-bottom: 18px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.10
            );

          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.03)
            );

          backdrop-filter: blur(14px);

          -webkit-backdrop-filter:
            blur(14px);

          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.08),
            0 18px 40px
            rgba(0,0,0,.12);
        }


        .footer-brand-top {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 20px;
        }


        .footer-kicker {
          margin: 0 0 6px;

          color:
            rgba(
              255,
              255,
              255,
              0.52
            );

          font-size:
            0.67rem;

          font-weight: 800;

          letter-spacing:
            0.16em;
        }


        .footer-brand-card h3 {
          margin: 0;

          color: #ff871f;

          font-size: 1.55rem;

          line-height: 1.1;

          font-weight: 800;
        }


        .footer-brand-desc {
          max-width: 520px;

          margin:
            12px
            0
            0;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          font-size:
            0.90rem;

          line-height:
            1.55;
        }


        .footer-top-btn {
          width: 42px;
          height: 42px;

          flex:
            0
            0
            auto;

          display: grid;

          place-items: center;

          border: none;

          border-radius: 13px;

          color: #ffffff;

          background:
            linear-gradient(
              135deg,
              #ff9b35,
              #ff7600
            );

          cursor: pointer;

          box-shadow:
            0 10px 24px
            rgba(
              255,
              118,
              0,
              0.28
            );
        }


        /* CONTENT GRID */

        .footer-mobile-grid {
          display: grid;

          grid-template-columns:
            1fr
            1.35fr;

          gap: 14px;
        }


        .footer-mini-card {
          padding: 20px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );

          border-radius:
            20px;

          background:
            rgba(
              255,
              255,
              255,
              0.055
            );

          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.05);
        }


        .footer-mini-label {
          display: block;

          margin-bottom: 5px;

          color: #ff871f;

          font-size:
            0.60rem;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }


        .footer-mini-card h4 {
          margin:
            0
            0
            13px;

          color: #ffffff;

          font-size: 1rem;

          font-weight: 800;
        }


        /* LINKS */

        .footer-links {
          display: flex;

          flex-direction:
            column;

          gap: 10px;
        }


        .footer-links a {
          position: relative;

          width: fit-content;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          text-decoration: none;

          font-size:
            0.84rem;

          transition:
            color
            .2s ease,
            transform
            .2s ease;
        }


        .footer-links a:hover {
          color: #ffffff;

          transform:
            translateX(3px);
        }


        .footer-links a::before {
          content: "";

          display:
            inline-block;

          width: 5px;
          height: 5px;

          margin-right: 8px;

          border-radius:
            50%;

          background:
            #ff871f;

          vertical-align:
            middle;
        }


        /* CONTACT */

        .footer-contact-list {
          display: flex;

          flex-direction:
            column;

          gap: 10px;
        }


        .footer-contact-list a,
        .footer-contact-list > div {
          display: flex;

          align-items:
            flex-start;

          gap: 9px;

          min-width: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          text-decoration:
            none;

          font-size:
            0.82rem;

          line-height:
            1.4;
        }


        .footer-contact-list a:hover {
          color: #ffffff;
        }


        .footer-icon {
          width: 27px;
          height: 27px;

          flex:
            0
            0
            27px;

          display: grid;

          place-items: center;

          margin-top: -4px;

          border-radius:
            9px;

          color: #ff871f;

          background:
            rgba(
              255,
              135,
              31,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              135,
              31,
              0.16
            );
        }


        .footer-email {
          overflow-wrap:
            anywhere;
        }


        /* BOTTOM */

        .footer-bottom-premium {
          display: flex;

          align-items: center;

          justify-content:
            center;

          gap: 7px;

          margin-top: 16px;

          padding-top: 14px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        .footer-bottom-premium p {
          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.44
            );

          font-size:
            0.70rem;
        }


        .footer-bottom-dot {
          width: 5px;
          height: 5px;

          border-radius:
            50%;

          background:
            #ff871f;

          box-shadow:
            0 0 8px
            rgba(
              255,
              135,
              31,
              0.7
            );
        }


        /* ==================================================
           MOBILE PREMIUM
        ================================================== */

        @media (max-width: 768px) {

          .premium-footer {
            padding:
              18px
              0
              10px;
          }


          .footer-brand-card {
            padding:
              15px;

            margin-bottom:
              9px;

            border-radius:
              16px;
          }


          .footer-kicker {
            margin-bottom:
              4px;

            font-size:
              0.54rem;
          }


          .footer-brand-card h3 {
            font-size:
              1.05rem;
          }


          .footer-brand-desc {
            max-width:
              300px;

            margin-top:
              7px;

            font-size:
              0.68rem;

            line-height:
              1.4;
          }


          .footer-top-btn {
            width: 34px;
            height: 34px;

            border-radius:
              10px;
          }


          .footer-top-btn svg {
            width: 15px;
            height: 15px;
          }


          .footer-mobile-grid {
            grid-template-columns:
              0.85fr
              1.15fr;

            gap: 8px;
          }


          .footer-mini-card {
            padding:
              12px
              11px;

            border-radius:
              14px;
          }


          .footer-mini-label {
            margin-bottom:
              3px;

            font-size:
              0.50rem;
          }


          .footer-mini-card h4 {
            margin-bottom:
              8px;

            font-size:
              0.80rem;
          }


          .footer-links {
            gap: 7px;
          }


          .footer-links a {
            font-size:
              0.65rem;
          }


          .footer-links a::before {
            width: 4px;
            height: 4px;

            margin-right:
              5px;
          }


          .footer-contact-list {
            gap: 7px;
          }


          .footer-contact-list a,
          .footer-contact-list > div {
            gap: 6px;

            font-size:
              0.62rem;

            line-height:
              1.3;
          }


          .footer-icon {
            width: 23px;
            height: 23px;

            flex:
              0
              0
              23px;

            margin-top:
              -3px;

            border-radius:
              7px;
          }


          .footer-icon svg {
            width: 12px;
            height: 12px;
          }


          .footer-bottom-premium {
            margin-top:
              10px;

            padding-top:
              9px;
          }


          .footer-bottom-premium p {
            font-size:
              0.56rem;
          }

        }


        /* VERY SMALL MOBILE */

        @media (max-width: 360px) {

          .footer-mobile-grid {
            grid-template-columns:
              1fr;
          }


          .footer-mini-card {
            padding: 11px;
          }

        }

      `}</style>
    </>
  );
};

export default Footer;