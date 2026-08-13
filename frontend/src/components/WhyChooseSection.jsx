import React from 'react';
import { Zap, Map, MessageCircle, Navigation } from 'lucide-react';

const WhyChooseSection = () => {
  const reasons = [
    {
      title: 'Quick & Easy Booking',
      desc: 'Book a truck in less than 2 minutes using our intuitive online portal.',
      icon: <Zap size={26} />,
    },
    {
      title: 'Local to All-India Routes',
      desc: 'From city logistics to national highways, we have the right vehicle for you.',
      icon: <Map size={26} />,
    },
    {
      title: 'Instant WhatsApp Support',
      desc: 'Get updates and chat with our team 24/7 for complete peace of mind.',
      icon: <MessageCircle size={26} />,
    },
    {
      title: 'Real-Time Trip Tracking',
      desc: 'Securely track your goods live on the map from pickup to delivery.',
      icon: <Navigation size={26} />,
    },
  ];

  return (
    <section className="why-premium-section">
      <div className="container">
        <div className="why-premium-header">
          <span>WHY EAGLE TRANSPORT</span>
          <h2>Built for Better Logistics</h2>
          <p>
            We deliver trust along with your goods. Experience a new standard of logistics.
          </p>
        </div>

        <div className="why-premium-grid">
          {reasons.map((reason, index) => (
            <article className="why-premium-card" key={reason.title}>
              <div className="why-premium-card-top">
                <div className="why-premium-icon">{reason.icon}</div>
                <span className="why-premium-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3>{reason.title}</h3>
              <p>{reason.desc}</p>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .why-premium-section {
          padding: 70px 0;
          background:
            radial-gradient(circle at top left, rgba(37,99,235,.06), transparent 30%),
            #f4f7fb;
        }

        .why-premium-header {
          max-width: 650px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .why-premium-header > span {
          display: inline-block;
          margin-bottom: 8px;
          color: #ff7a00;
          font-size: .72rem;
          font-weight: 900;
          letter-spacing: .15em;
        }

        .why-premium-header h2 {
          margin: 0 0 10px;
          color: #0b315d;
          font-size: clamp(2rem, 4vw, 2.7rem);
          line-height: 1.08;
          letter-spacing: -.03em;
        }

        .why-premium-header p {
          margin: 0;
          color: #64748b;
          font-size: .95rem;
          line-height: 1.55;
        }

        .why-premium-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .why-premium-card {
          position: relative;
          min-width: 0;
          padding: 22px;
          border: 1px solid rgba(15,49,88,.08);
          border-radius: 20px;
          background: linear-gradient(145deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 12px 28px rgba(15,49,88,.07);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .why-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(15,49,88,.11);
        }

        .why-premium-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .why-premium-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #0f4a88;
          background: #eaf3ff;
        }

        .why-premium-number {
          color: rgba(15,49,88,.14);
          font-size: 1.6rem;
          font-weight: 900;
        }

        .why-premium-card h3 {
          margin: 0 0 7px;
          color: #0b315d;
          font-size: 1.05rem;
          line-height: 1.25;
        }

        .why-premium-card p {
          margin: 0;
          color: #64748b;
          font-size: .82rem;
          line-height: 1.5;
        }

        @media (max-width: 992px) {
          .why-premium-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .why-premium-section {
            padding: 28px 0 32px;
          }

          .why-premium-header {
            margin-bottom: 16px;
          }

          .why-premium-header > span {
            margin-bottom: 5px;
            font-size: .58rem;
          }

          .why-premium-header h2 {
            max-width: 290px;
            margin: 0 auto 6px;
            font-size: 1.45rem;
            line-height: 1.12;
          }

          .why-premium-header p {
            max-width: 315px;
            margin: 0 auto;
            font-size: .70rem;
            line-height: 1.4;
          }

          .why-premium-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .why-premium-card {
            min-height: 132px;
            padding: 12px;
            border-radius: 14px;
          }

          .why-premium-card-top {
            margin-bottom: 9px;
          }

          .why-premium-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }

          .why-premium-icon svg {
            width: 17px;
            height: 17px;
          }

          .why-premium-number {
            font-size: 1.08rem;
          }

          .why-premium-card h3 {
            margin-bottom: 4px;
            font-size: .76rem;
            line-height: 1.2;
          }

          .why-premium-card p {
            font-size: .61rem;
            line-height: 1.35;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseSection;