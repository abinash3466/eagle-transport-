import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingForm from './BookingForm';


const HeroSection = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    const section = document.getElementById('booking-form');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTrackClick = () => {
    navigate('/tracking');
  };

  return (
    <section style={styles.hero}>
      <div style={styles.overlay}></div>
      <div className="container" style={styles.content}>
        <div style={styles.textContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            Premium Logistics Service
          </div>
          

          <h1 style={styles.heading}>Fast & Easy Truck Booking Across India.</h1>

          <p style={styles.desc}>
            Simple booking process. Clear truck options. Reliable service for District, State, and National loads.
          </p>

          <div style={styles.buttons}>
            <button
              className="btn btn-primary"
              onClick={handleBookingClick}
            >
              Book Truck Now <ArrowRight size={20} />
            </button>

            <button
              className="btn"
              style={styles.btnWhite}
              onClick={handleTrackClick}
            >
              Track Truck <MapPin size={20} />
            </button>
          </div>
        </div>

        <div id="booking-form" style={styles.formContainer}>
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    position: 'relative',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    backgroundImage: 'url(/hero-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  overlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'linear-gradient(120deg, rgba(39, 46, 55, 0.95) 0%, rgba(73, 73, 73, 0.75) 50%, rgba(10,35,66,0.4) 100%)',
  zIndex: 1,
},
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center',
    paddingTop: '64px',
    paddingBottom: '64px',
  },
  textContent: {
    color: 'white',
    maxWidth: '600px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent-orange)',
    borderRadius: '50%',
    boxShadow: '0 0 10px var(--accent-orange)',
  },
  heading: {
    fontSize: '4rem',
    color: 'white',
    marginBottom: '24px',
    lineHeight: '1.1',
  },
  desc: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '40px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  btnWhite: {
    backgroundColor: 'white',
    color: 'var(--dark-blue)',
    boxShadow: 'var(--shadow-md)',
  },
  formContainer: {
    animation: 'slideUp 0.8s ease-out forwards',
  },
};

// Responsive styles injected via CSS
const responsiveCss = `
  @media (max-width: 992px) {
    div[style*="gridTemplateColumns: '1fr 1fr'"] {
      grid-template-columns: 1fr !important;
      text-align: center;
    }
    div[style*="maxWidth: '600px'"] {
      margin: 0 auto;
    }
    div[style*="display: 'flex', gap: '16px'"] {
      justify-content: center;
    }
    h1[style*="fontSize: '4rem'"] {
      fontSize: 2.5rem !important;
    }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('hero-section-responsive-style')) {
  const style = document.createElement('style');
  style.id = 'hero-section-responsive-style';
  style.innerHTML = responsiveCss;
  document.head.appendChild(style);
}

export default HeroSection;