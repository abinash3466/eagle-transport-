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
    <nav style={styles.nav}>
      {/* 🌟 Dynamic Font Injection: Google Fonts lendhu Cinzel premium layout-ah load panrom */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
      `}</style>
      <div className="container" style={styles.navContainer}>
        <Link to="/" style={styles.logo}>
          <img className="logoImage" src={logo} alt="Eagle Logo" style={styles.logoImage} />
          <div>
            <span style={styles.logoText}>EAGLE</span>
            <span style={styles.logoSubText}>TRANSPORT</span>
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
        <div style={styles.mobileMenu}>
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
          .desktop-menu { display: none !important; }
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
 

navContainer:{
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
