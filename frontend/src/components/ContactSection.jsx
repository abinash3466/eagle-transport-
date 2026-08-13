import React from 'react';
import { PhoneCall, MessageCircle } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="contact-premium-section">
      <div className="container contact-premium-inner">
        <div className="contact-premium-copy">
          <span className="contact-premium-kicker">LET'S GET MOVING</span>
          <h2>Ready to Move Your Goods?</h2>
          <p>
            Get in touch with us for special requests or track your existing booking.
          </p>
        </div>

        <div className="contact-premium-actions">
          <a href="tel:+918428302003" className="contact-premium-btn contact-call">
            <PhoneCall size={18} />
            Call Now
          </a>

          <a
            href="https://wa.me/918428302003/"
            className="contact-premium-btn contact-whatsapp"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        .contact-premium-section {
          padding: 64px 0;
          background:
            radial-gradient(circle at top right, rgba(37,99,235,.08), transparent 34%),
            linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
          border-top: 1px solid rgba(15,49,88,.06);
        }

        .contact-premium-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 28px 30px;
          border: 1px solid rgba(15,49,88,.08);
          border-radius: 24px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 18px 45px rgba(15,49,88,.08);
        }

        .contact-premium-copy {
          max-width: 650px;
        }

        .contact-premium-kicker {
          display: inline-block;
          margin-bottom: 8px;
          color: #ff7a00;
          font-size: .72rem;
          font-weight: 900;
          letter-spacing: .15em;
        }

        .contact-premium-copy h2 {
          margin: 0 0 8px;
          color: #0b315d;
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          line-height: 1.08;
          letter-spacing: -.025em;
        }

        .contact-premium-copy p {
          margin: 0;
          color: #64748b;
          font-size: .95rem;
          line-height: 1.55;
        }

        .contact-premium-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .contact-premium-btn {
          min-height: 46px;
          padding: 0 18px;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(15,49,88,.12);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .contact-premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15,49,88,.16);
        }

        .contact-call {
          background: linear-gradient(135deg, #0f4a88 0%, #0b315d 100%);
        }

        .contact-whatsapp {
          background: linear-gradient(135deg, #2fd06f 0%, #1fa857 100%);
        }

        @media (max-width: 768px) {
          .contact-premium-section {
            padding: 24px 0 28px;
          }

          .contact-premium-inner {
            display: block;
            padding: 16px;
            border-radius: 17px;
            text-align: center;
          }

          .contact-premium-kicker {
            margin-bottom: 5px;
            font-size: .60rem;
          }

          .contact-premium-copy h2 {
            margin-bottom: 6px;
            font-size: 1.35rem;
          }

          .contact-premium-copy p {
            max-width: 320px;
            margin: 0 auto;
            font-size: .72rem;
            line-height: 1.4;
          }

          .contact-premium-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 13px;
          }

          .contact-premium-btn {
            min-height: 40px;
            padding: 0 10px;
            border-radius: 11px;
            font-size: .74rem;
          }

          .contact-premium-btn svg {
            width: 15px;
            height: 15px;
          }
        }
      `}</style>
    </section>
  );
};

export default ContactSection;