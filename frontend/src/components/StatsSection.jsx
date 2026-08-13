import React from 'react';
import { Truck, Clock, Map, CheckCircle } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { icon: <Truck size={24} />, value: '8+', label: 'Total Trucks' },
    { icon: <Clock size={24} />, value: '24/7', label: 'Booking Support' },
    { icon: <Map size={24} />, value: '3', label: 'Trip Levels' },
    { icon: <CheckCircle size={24} />, value: '100%', label: 'Easy Booking' },
  ];

  return (
    <section className="stats-premium-section">
      <div className="container stats-premium-grid">
        {stats.map((stat) => (
          <article className="stats-premium-card" key={stat.label}>
            <div className="stats-premium-icon">{stat.icon}</div>

            <div className="stats-premium-copy">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .stats-premium-section {
          position: relative;
          z-index: 5;
          padding: 16px 0 8px;
          background: #f4f7fb;
        }

        .stats-premium-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .stats-premium-card {
          min-width: 0;
          min-height: 88px;
          padding: 15px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(15,49,88,.08);
          border-radius: 18px;
          background: rgba(255,255,255,.96);
          box-shadow: 0 10px 24px rgba(15,49,88,.07);
        }

        .stats-premium-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #ff7a00;
          background: #fff0e2;
        }

        .stats-premium-copy strong {
          display: block;
          color: #0b315d;
          font-size: 1.42rem;
          line-height: 1;
          font-weight: 900;
        }

        .stats-premium-copy span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: .72rem;
          font-weight: 700;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .stats-premium-section {
            padding: 8px 0 4px;
          }

          .stats-premium-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .stats-premium-card {
            min-height: 64px;
            padding: 8px 9px;
            gap: 7px;
            border-radius: 13px;
          }

          .stats-premium-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }

          .stats-premium-icon svg {
            width: 16px;
            height: 16px;
          }

          .stats-premium-copy strong {
            font-size: 1rem;
          }

          .stats-premium-copy span {
            margin-top: 2px;
            font-size: .56rem;
          }
        }
      `}</style>
    </section>
  );
};

export default StatsSection;