import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import logo from '../assets/eagle-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trucks', path: '/trucks' },
    { name: 'Track Booking', path: '/tracking' },
  ];

  return (
    <nav className="eagle-navbar" style={styles.nav}>
      {/* 🌟 Dynamic Font Injection: Google Fonts lendhu Cinzel premium layout-ah load panrom */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
      `}</style>
      <div className="container navbar-container" style={styles.navContainer}>
        <Link className="navbar-logo" to="/" style={styles.logo}>
          <img className="logoImage" src={logo} alt="Eagle Logo" style={styles.logoImage} />
          <div>
            <span className="navbar-logo-text" style={styles.logoText}>EAGLE</span>
            <span className="navbar-logo-subtext" style={styles.logoSubText}>TRANSPORT</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div style={styles.desktopMenu} className="desktop-menu">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{
                ...styles.link,
                ...(location.pathname === link.path ? styles.activeLink : {}),
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" style={styles.mobileToggle} onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu-panel" style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{
                ...styles.mobileLink,
                ...(location.pathname === link.path ? styles.activeMobileLink : {}),
              }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/owner/dashboard" style={styles.mobileLoginBtn} onClick={() => setIsOpen(false)}>
            <User size={18} /> Owner Login
          </Link>
        </div>
      )}
      <style>{`
  
  @media (min-width: 769px) {
    .mobile-toggle { display: none !important; }
  }
        
  @media (max-width: 768px) {

  .desktop-menu {
    display: none !important;
  }

  /* =========================
     PREMIUM MOBILE NAVBAR
  ========================= */

  .eagle-navbar {
    background: rgba(255, 255, 255, 0.98) !important;

    box-shadow:
      0 4px 20px rgba(4, 35, 70, 0.08) !important;

    border-bottom:
      1px solid rgba(8, 50, 91, 0.06);
  }

  .eagle-navbar .navbar-container {
    width: 100% !important;
    max-width: 100% !important;

    height: 68px !important;

    padding: 0 18px !important;
    margin: 0 !important;

    box-sizing: border-box !important;

    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }


  /* =========================
     LOGO AREA
  ========================= */

  .eagle-navbar .navbar-logo {
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;
    overflow: visible !important;
  }

  .eagle-navbar .logoImage {
    width: 54px !important;
    height: 54px !important;

    object-fit: contain !important;
    flex-shrink: 0 !important;

    /* actual logo inside image becomes bigger */
    transform: scale(1.45) !important;
    transform-origin: center !important;

    margin-right: 2px !important;
  }


  /* EAGLE */

  .eagle-navbar .navbar-logo-text {
    display: block !important;

    font-family:
      "Cinzel",
      Georgia,
      serif !important;

    font-size: 1.4rem !important;

    font-weight: 900 !important;

    line-height: 0.92 !important;

    letter-spacing: 0.8px !important;

    color: #082f59 !important;
  }


  /* TRANSPORT */

  .eagle-navbar .navbar-logo-subtext {
    display: block !important;

    font-family:
      "Montserrat",
      Arial,
      sans-serif !important;

    font-size: 0.56rem !important;

    font-weight: 800 !important;

    letter-spacing: 4px !important;

    line-height: 1 !important;

    margin-top: 5px !important;

    color: #ff7a00 !important;
  }


  /* =========================
     HAMBURGER
  ========================= */

  .eagle-navbar .mobile-toggle {
    width: 42px !important;
    height: 42px !important;

    display: flex !important;

    align-items: center !important;
    justify-content: center !important;

    flex-shrink: 0 !important;

    padding: 0 !important;

    border:
      1px solid rgba(8, 47, 89, 0.08) !important;

    border-radius: 12px !important;

    background:
      #f6f9fc !important;

    color: #082f59 !important;

    cursor: pointer !important;

    box-shadow:
      0 4px 12px rgba(4, 35, 70, 0.05);

    transition:
      transform 0.2s ease,
      background 0.2s ease !important;
  }


  .eagle-navbar .mobile-toggle:active {
    transform: scale(0.94);
  }


  /* =========================
     MOBILE MENU
  ========================= */

  .eagle-navbar .mobile-menu-panel {
    width: calc(100% - 24px) !important;

    margin: 8px 12px 0 !important;

    padding: 12px 16px !important;

    box-sizing: border-box !important;

    position: absolute !important;

    top: 68px !important;
    left: 0 !important;

    z-index: 100 !important;

    border:
      1px solid rgba(8, 47, 89, 0.08) !important;

    border-radius: 16px !important;

    background:
      rgba(255, 255, 255, 0.98) !important;

    box-shadow:
      0 18px 45px rgba(3, 29, 55, 0.15) !important;
  }
}

        @media (max-width: 420px) {
          .eagle-navbar .navbar-container {
            padding: 0 12px !important;
          }

          .eagle-navbar .logoImage {
            width: 48px !important;
            height: 48px !important;
          }

          .eagle-navbar .navbar-logo-text {
            font-size: 1.35rem !important;
          }

          .eagle-navbar .navbar-logo-subtext {
            font-size: 0.62rem !important;
            letter-spacing: 3.4px !important;
          }
        }
      `}</style>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },


  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '80px',
    width: '100%',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    textDecoration: 'none',
    marginRight: 'auto' // 🔥 THIS LINE ADD
  },

  logoText: {
    display: 'block',
    fontFamily: "'Cinzel', serif",  // 🔥 Pure Luxury Serif Font
    fontSize: '1.9rem',             // Unga navbar container height-ku perfect scaling
    fontWeight: '900',              // Ultra bold look for solid impact
    color: '#0A2342',               // Deep Navy Blue
    lineHeight: '0.9',              // Sub-text oda gapping structure correct-ah ukaara
    letterSpacing: '1px',           // Clean modern kerning
    textTransform: 'uppercase',     // Inga uppercase add panniyachu, so neat-ah capital-la render aagum
  },

  logoSubText: {
    display: 'block',
    fontFamily: "'Cinzel', serif",  // Main text oda match aahura adhe font family
    fontSize: '0.85rem',            // Clean tagline proportion
    fontWeight: '700',
    color: '#ff8c00',               // Dynamic Accent Golden Orange
    lineHeight: '1',
    letterSpacing: '5.2px',         // 🔥 Mela irukura EAGLE oda boundary edges-ku exact-ah matching-ah stretch aaha indha width tracking!
    marginTop: '4px',
    textTransform: 'uppercase',     // Proper corporate layout standard
  },

  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  link: {
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  activeLink: {
    color: 'var(--primary-blue)',
  },
  loginBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
  },
  mobileToggle: {
    color: 'var(--dark-blue)',
    display: 'flex',
    alignItems: 'center',
  },
  mobileMenu: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-light)',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileLink: {
    padding: '12px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--bg-soft)',
  },
  activeMobileLink: {
    color: 'var(--primary-blue)',
  },
  mobileLoginBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'var(--primary-blue)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    marginTop: '8px',
  }
};


export default Navbar;