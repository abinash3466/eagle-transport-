import React from 'react';

const PartnerSection = () => {
  const partners = [
    {
      name: 'Tata Motors',
      src: '/logos/tata.png',
      alt: 'Tata Motors Logo',
    },
    {
      name: 'Ashok Leyland',
      src: '/logos/ashok-leyland.png',
      alt: 'Ashok Leyland Logo',
    },
    {
      name: 'Mahindra',
      src: '/logos/mahindra.png',
      alt: 'Mahindra Logo',
    },
    {
      name: 'BharatBenz',
      src: '/logos/bharatbenz.png',
      alt: 'BharatBenz Logo',
    },
    {
      name: 'Eicher',
      src: '/logos/eicher.png',
      alt: 'Eicher Logo',
    },
    {
      name: 'Volvo',
      src: '/logos/volvo.png',
      alt: 'Volvo Logo',
    },
  ];

  return (
    <>
      <section style={styles.section}>
        <div className="container">
          <div style={styles.headingWrap}>
            <h2 style={styles.heading}>OUR TRUSTED PARTNERS</h2>
            <p style={styles.subHeading}>
              Working with Industry Leaders for Seamless Logistics and Performance
            </p>
          </div>

          <div style={styles.logoGrid}>
            {partners.map((partner, idx) => (
              <div key={idx} style={styles.cardWrap} className="partner-fade-up">
                <div style={styles.hexCard} className="partner-hex-card">
                  <img
                    src={partner.src}
                    alt={partner.alt}
                    style={styles.logoImage}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.dotsWrap}>
            <span style={{ ...styles.dot, ...styles.activeDot }} />
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.dot} />
          </div>
        </div>
      </section>

      <style>{`
        .partner-hex-card {
          transition: transform 0.45s ease, box-shadow 0.45s ease, filter 0.45s ease;
        }

        .partner-hex-card:hover {
          transform: translateY(-12px) scale(1.04);
          box-shadow: 0 28px 60px rgba(13, 45, 85, 0.18);
          filter: brightness(1.03);
        }

        .partner-fade-up {
          animation: partnerFadeUp 0.8s ease both;
        }

        .partner-fade-up:nth-child(1) { animation-delay: 0.05s; }
        .partner-fade-up:nth-child(2) { animation-delay: 0.12s; }
        .partner-fade-up:nth-child(3) { animation-delay: 0.19s; }
        .partner-fade-up:nth-child(4) { animation-delay: 0.26s; }
        .partner-fade-up:nth-child(5) { animation-delay: 0.33s; }
        .partner-fade-up:nth-child(6) { animation-delay: 0.40s; }

        @keyframes partnerFadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .partner-fade-up {
            animation-delay: 0s !important;
          }
        }

        @media (max-width: 992px) {
          .partner-hex-card:hover {
            transform: translateY(-8px) scale(1.02);
          }
        }
      `}</style>
    </>
  );
};

const styles = {
  section: {
    padding: '80px 0 90px',
    background: 'linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%)',
    borderTop: '1px solid rgba(15, 74, 136, 0.06)',
    borderBottom: '1px solid rgba(15, 74, 136, 0.06)',
    overflow: 'hidden',
  },

  headingWrap: {
    textAlign: 'center',
    marginBottom: '48px',
  },

  heading: {
    fontSize: 'clamp(2rem, 4vw, 3.4rem)',
    fontWeight: '900',
    color: '#0f3d72',
    marginBottom: '14px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    lineHeight: '1.1',
  },

  subHeading: {
    fontSize: 'clamp(1rem, 1.8vw, 1.35rem)',
    color: '#334e68',
    maxWidth: '860px',
    margin: '0 auto',
    lineHeight: '1.6',
    fontWeight: '500',
  },

  logoGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '28px',
  },

  cardWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hexCard: {
    width: '210px',
    height: '240px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)',
    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 40px rgba(13, 45, 85, 0.10)',
    border: '1px solid rgba(15, 74, 136, 0.07)',
    padding: '26px',
    position: 'relative',
  },

  logoImage: {
    width: '100%',
    maxWidth: '150px',
    maxHeight: '90px',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 6px 12px rgba(15, 58, 104, 0.08))',
  },

  dotsWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '34px',
  },

  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    backgroundColor: '#fbfbfb',
    display: 'inline-block',
  },

  activeDot: {
    width: '28px',
    borderRadius: '999px',
    backgroundColor: '#7f8790',
  },
};

export default PartnerSection;