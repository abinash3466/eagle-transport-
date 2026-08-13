import React from 'react';

const PartnerSection = () => {
  const partners = [
    { name: 'Tata Motors', src: '/logos/tata.png', alt: 'Tata Motors Logo' },
    { name: 'Ashok Leyland', src: '/logos/ashok-leyland.png', alt: 'Ashok Leyland Logo' },
    { name: 'Mahindra', src: '/logos/mahindra.png', alt: 'Mahindra Logo' },
    { name: 'BharatBenz', src: '/logos/bharatbenz.png', alt: 'BharatBenz Logo' },
    { name: 'Eicher', src: '/logos/eicher.png', alt: 'Eicher Logo' },
    { name: 'Volvo', src: '/logos/volvo.png', alt: 'Volvo Logo' },
  ];

  return (
    <section className="partners-premium-section">
      <div className="container">
        <div className="partners-premium-header">
          <span>TRUSTED BRANDS</span>
          <h2>Brands That Power Our Journey</h2>
          <p>Working with industry leaders for seamless logistics and performance.</p>
        </div>

        <div className="partners-premium-grid">
          {partners.map((partner) => (
            <div className="partners-premium-card" key={partner.name}>
              <img
                src={partner.src}
                alt={partner.alt}
                loading="lazy"
              />
              <span>{partner.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .partners-premium-section {
          padding: 64px 0 68px;
          background: linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);
          border-top: 1px solid rgba(15,74,136,.05);
          border-bottom: 1px solid rgba(15,74,136,.05);
        }

        .partners-premium-header {
          max-width: 680px;
          margin: 0 auto 30px;
          text-align: center;
        }

        .partners-premium-header > span {
          display: inline-block;
          margin-bottom: 7px;
          color: #ff7a00;
          font-size: .70rem;
          font-weight: 900;
          letter-spacing: .15em;
        }

        .partners-premium-header h2 {
          margin: 0 0 8px;
          color: #0b315d;
          font-size: clamp(2rem, 4vw, 2.7rem);
          line-height: 1.08;
          text-transform: uppercase;
          letter-spacing: -.02em;
        }

        .partners-premium-header p {
          margin: 0;
          color: #64748b;
          font-size: .92rem;
          line-height: 1.5;
        }

        .partners-premium-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .partners-premium-card {
          min-width: 0;
          min-height: 118px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid rgba(15,49,88,.08);
          border-radius: 18px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 10px 24px rgba(15,49,88,.06);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .partners-premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 32px rgba(15,49,88,.10);
        }

        .partners-premium-card img {
          width: 100%;
          max-width: 105px;
          height: 48px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 4px 8px rgba(15,58,104,.06));
        }

        .partners-premium-card span {
          color: #51657c;
          font-size: .70rem;
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 992px) {
          .partners-premium-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .partners-premium-section {
            padding: 28px 0 32px;
          }

          .partners-premium-header {
            margin-bottom: 15px;
          }

          .partners-premium-header > span {
            margin-bottom: 4px;
            font-size: .57rem;
          }

          .partners-premium-header h2 {
            margin-bottom: 5px;
            font-size: 1.38rem;
          }

          .partners-premium-header p {
            max-width: 315px;
            margin: 0 auto;
            font-size: .68rem;
            line-height: 1.4;
          }

          .partners-premium-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 7px;
          }

          .partners-premium-card {
            min-height: 80px;
            padding: 8px 6px;
            gap: 5px;
            border-radius: 12px;
          }

          .partners-premium-card img {
            max-width: 72px;
            height: 34px;
          }

          .partners-premium-card span {
            font-size: .55rem;
            line-height: 1.1;
          }
        }
      `}</style>
    </section>
  );
};

export default PartnerSection;