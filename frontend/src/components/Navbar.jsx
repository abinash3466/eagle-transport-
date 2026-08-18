import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Sun, Moon, Truck } from 'lucide-react';
import logo from '../assets/eagle-logo.png';
import './eagle-theme-premium.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('eagle-theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-eagle-theme', theme);
    document.body.setAttribute('data-eagle-theme', theme);
    localStorage.setItem('eagle-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@600;700;800&display=swap');

        :root {
          --eagle-nav-bg: rgba(255, 255, 255, 0.94);
          --eagle-nav-border: rgba(8, 47, 89, 0.08);
          --eagle-nav-text: #18324d;
          --eagle-nav-muted: #5f7184;
          --eagle-nav-active: #0b4f8a;
          --eagle-toggle-bg: #edf3f8;
          --eagle-toggle-thumb: #ffffff;
          --eagle-menu-bg: rgba(255, 255, 255, 0.98);
          --eagle-menu-shadow: rgba(3, 29, 55, 0.18);
        }

        html[data-eagle-theme='dark'] {
          color-scheme: dark;
          --eagle-nav-bg: rgba(10, 18, 30, 0.94);
          --eagle-nav-border: rgba(255, 255, 255, 0.08);
          --eagle-nav-text: #f4f7fb;
          --eagle-nav-muted: #a7b3c2;
          --eagle-nav-active: #7ab8ff;
          --eagle-toggle-bg: #182536;
          --eagle-toggle-thumb: #25364a;
          --eagle-menu-bg: rgba(12, 22, 36, 0.98);
          --eagle-menu-shadow: rgba(0, 0, 0, 0.38);
        }

        body[data-eagle-theme='light'] {
          background: #f7f9fc;
          color: #172b3f;
          transition: background-color .25s ease, color .25s ease;
        }

        body[data-eagle-theme='dark'] {
          background: #08111d;
          color: #edf4fb;
          transition: background-color .25s ease, color .25s ease;
        }
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
                ...(location.pathname === link.path && theme === 'dark' ? styles.activeLinkDark : {}),
              }}
            >
              {link.name}
            </Link>
          ))}

          <button
            type="button"
            className="theme-toggle desktop-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className={`theme-toggle-track ${theme === 'dark' ? 'is-dark' : ''}`}>
              <span className="theme-toggle-thumb">
                {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </span>
            <span className="theme-toggle-label">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="mobile-actions">
          <button
            type="button"
            className="theme-toggle mobile-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button className="mobile-toggle" style={styles.mobileToggle} onClick={toggleMenu}>
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
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
                ...(location.pathname === link.path && theme === 'dark' ? styles.activeMobileLinkDark : {}),
              }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="mobile-login-section">
            <div className="mobile-login-label">SECURE ACCESS</div>

            <div className="mobile-login-grid">
              <Link
                to="/owner/login"
                className="mobile-login-card owner-login-card"
                style={styles.mobileLoginBtn}
                onClick={() => setIsOpen(false)}
              >
                <span className="mobile-login-icon">
                  <User size={17} />
                </span>

                <span className="mobile-login-copy">
                  <strong>Owner Login</strong>
                  <small>Control Panel</small>
                </span>
              </Link>

              <Link
                to="/driver"
                className="mobile-login-card driver-login-card"
                style={styles.mobileLoginBtn}
                onClick={() => setIsOpen(false)}
              >
                <span className="mobile-login-icon">
                  <Truck size={17} />
                </span>

                <span className="mobile-login-copy">
                  <strong>Driver Login</strong>
                  <small>Driver Access</small>
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
      <style>{`

  .eagle-navbar {
    background: var(--eagle-nav-bg) !important;
    border-bottom: 1px solid var(--eagle-nav-border) !important;
    box-shadow: 0 10px 32px rgba(7, 32, 58, 0.08) !important;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: background-color .25s ease, border-color .25s ease, box-shadow .25s ease;
  }

  html[data-eagle-theme='dark'] .eagle-navbar {
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.24) !important;
  }

  .eagle-navbar .desktop-menu a {
    color: var(--eagle-nav-text) !important;
  }

  .eagle-navbar .desktop-menu a:hover {
    color: #ff7a00 !important;
  }

  .eagle-navbar .theme-toggle {
    border: 1px solid var(--eagle-nav-border);
    color: var(--eagle-nav-text);
    cursor: pointer;
    font-family: 'Montserrat', Arial, sans-serif;
    transition: transform .2s ease, background .2s ease, border-color .2s ease;
  }

  .eagle-navbar .theme-toggle:active {
    transform: scale(.96);
  }

  .eagle-navbar .desktop-theme-toggle {
    height: 38px;
    padding: 4px 10px 4px 5px;
    border-radius: 999px;
    background: var(--eagle-toggle-bg);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 2px;
  }

  .theme-toggle-track {
    width: 38px;
    height: 26px;
    padding: 3px;
    border-radius: 999px;
    background: rgba(11, 79, 138, .12);
    display: flex;
    align-items: center;
    transition: background .25s ease;
  }

  .theme-toggle-track.is-dark {
    justify-content: flex-end;
    background: rgba(255, 122, 0, .16);
  }

  .theme-toggle-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--eagle-toggle-thumb);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff8a00;
    box-shadow: 0 3px 8px rgba(7, 32, 58, .15);
  }

  html[data-eagle-theme='dark'] .theme-toggle-thumb {
    color: #8fc6ff;
  }

  .theme-toggle-label {
    font-size: .73rem;
    font-weight: 800;
    letter-spacing: .2px;
    min-width: 31px;
  }

  .mobile-actions {
    display: none;
    align-items: center;
    gap: 8px;
  }

  .mobile-theme-toggle {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 12px;
    background: var(--eagle-toggle-bg);
    align-items: center;
    justify-content: center;
  }
  

  html[data-eagle-theme='dark'] .eagle-navbar .navbar-logo-text {
    color: #f4f7fb !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .navbar-logo-subtext {
    color: #ff9a2e !important;
  }

  @media (min-width: 769px) {
    .mobile-toggle { display: none !important; }
    .mobile-actions { display: none !important; }
  }
        
  @media (max-width: 768px) {

  .desktop-menu {
    display: none !important;
  }

  .mobile-actions {
    display: flex !important;
  }

  /* =========================
     PREMIUM MOBILE NAVBAR
  ========================= */

  .eagle-navbar {
    background: var(--eagle-nav-bg) !important;

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

    color: var(--eagle-nav-text) !important;
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
      var(--eagle-toggle-bg) !important;

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
  position: absolute !important;

  top: 74px !important;
  right: 14px !important;
  left: auto !important;

  width: 235px !important;

  margin: 0 !important;
  padding: 9px !important;

  box-sizing: border-box !important;

  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;

  z-index: 9999 !important;

  background: var(--eagle-menu-bg) !important;

  border: 1px solid rgba(8, 47, 89, 0.09) !important;
  border-radius: 16px !important;

  box-shadow:
    0 18px 45px rgba(3, 29, 55, 0.18),
    0 3px 10px rgba(3, 29, 55, 0.06) !important;

  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;

  animation: eagleMenuOpen 0.22s ease-out both;
}


/* small premium arrow */

.eagle-navbar .mobile-menu-panel::before {
  content: "";

  position: absolute;

  top: -6px;
  right: 17px;

  width: 12px;
  height: 12px;

  background: var(--eagle-menu-bg);

  border-left: 1px solid rgba(8, 47, 89, 0.08);
  border-top: 1px solid rgba(8, 47, 89, 0.08);

  transform: rotate(45deg);
}


  html[data-eagle-theme='dark'] .eagle-navbar .mobile-toggle {
    border-color: rgba(255, 255, 255, .08) !important;
    color: #f4f7fb !important;
    box-shadow: 0 5px 15px rgba(0, 0, 0, .2) !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-menu-panel {
    border-color: rgba(255, 255, 255, .08) !important;
    box-shadow: 0 18px 45px var(--eagle-menu-shadow) !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-menu-panel::before {
    border-left-color: rgba(255, 255, 255, .08);
    border-top-color: rgba(255, 255, 255, .08);
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-menu-panel a:not([href='/owner/login']) {
    color: #dce8f4 !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-menu-panel a[style*='edf5ff'] {
    color: #8fc6ff !important;
    background: rgba(74, 144, 226, .12) !important;
  }


  /* =========================================
     MOBILE TOP ACTIONS — COMPACT + CENTERED
  ========================================= */

  .eagle-navbar .mobile-actions {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    flex-shrink: 0 !important;
  }

  .eagle-navbar .mobile-theme-toggle,
  .eagle-navbar .mobile-toggle {
    width: 40px !important;
    min-width: 40px !important;
    height: 40px !important;

    padding: 0 !important;
    margin: 0 !important;

    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;

    border-radius: 12px !important;
    line-height: 1 !important;

    box-sizing: border-box !important;

    background:
      linear-gradient(
        145deg,
        rgba(239, 245, 251, .98),
        rgba(228, 237, 247, .96)
      ) !important;

    border:
      1px solid rgba(9, 54, 96, .10) !important;

    color: #0b416f !important;

    box-shadow:
      0 5px 14px rgba(6, 37, 68, .07),
      inset 0 1px 0 rgba(255,255,255,.85) !important;
  }

  .eagle-navbar .mobile-theme-toggle svg,
  .eagle-navbar .mobile-toggle svg {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
  }

  .eagle-navbar .mobile-theme-toggle {
    color: #f59e0b !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-theme-toggle,
  html[data-eagle-theme='dark'] .eagle-navbar .mobile-toggle {
    background:
      linear-gradient(
        145deg,
        #15283c 0%,
        #102135 100%
      ) !important;

    border-color:
      rgba(143, 190, 232, .12) !important;

    box-shadow:
      0 7px 18px rgba(0, 0, 0, .20),
      inset 0 1px 0 rgba(255,255,255,.025) !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-theme-toggle {
    color: #ffca46 !important;
  }

  html[data-eagle-theme='dark'] .eagle-navbar .mobile-toggle {
    color: #eef6ff !important;
  }


  /* =========================================
     LOGIN AREA — OWNER + DRIVER
  ========================================= */

  .eagle-navbar .mobile-login-section {
    margin-top: 5px !important;
    padding-top: 9px !important;

    border-top:
      1px solid rgba(8, 47, 89, .08) !important;
  }

  .eagle-navbar .mobile-login-label {
    margin:
      0
      3px
      7px !important;

    color: #8495a7 !important;

    font-family:
      'Montserrat',
      Arial,
      sans-serif !important;

    font-size: .56rem !important;
    line-height: 1 !important;
    font-weight: 800 !important;

    letter-spacing: .12em !important;
  }

  .eagle-navbar .mobile-login-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 6px !important;
  }

  .eagle-navbar .mobile-login-card {
    width: 100% !important;
    min-height: 48px !important;

    margin: 0 !important;
    padding: 7px 9px !important;

    display: grid !important;
    grid-template-columns: 34px minmax(0, 1fr) !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 9px !important;

    border-radius: 12px !important;

    text-align: left !important;
    text-decoration: none !important;

    box-sizing: border-box !important;
  }

  .eagle-navbar .mobile-login-card.owner-login-card {
    color: #ffffff !important;

    background:
      linear-gradient(
        135deg,
        #0b589d 0%,
        #0b3f72 100%
      ) !important;

    border:
      1px solid rgba(72, 149, 220, .28) !important;

    box-shadow:
      0 8px 18px rgba(8, 68, 119, .18) !important;
  }

  .eagle-navbar .mobile-login-card.driver-login-card {
    color: #ffffff !important;

    background:
      linear-gradient(
        135deg,
        #ff861d 0%,
        #e9630a 100%
      ) !important;

    border:
      1px solid rgba(255, 147, 54, .30) !important;

    box-shadow:
      0 8px 18px rgba(232, 99, 11, .17) !important;
  }

  .eagle-navbar .mobile-login-icon {
    width: 34px !important;
    height: 34px !important;

    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;

    border-radius: 10px !important;

    background:
      rgba(255, 255, 255, .13) !important;

    border:
      1px solid rgba(255,255,255,.12) !important;
  }

  .eagle-navbar .mobile-login-copy {
    min-width: 0 !important;

    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
  }

  .eagle-navbar .mobile-login-copy strong {
    color: inherit !important;

    font-size: .78rem !important;
    line-height: 1.05 !important;
    font-weight: 800 !important;
  }

  .eagle-navbar .mobile-login-copy small {
    color: rgba(255,255,255,.72) !important;

    font-size: .58rem !important;
    line-height: 1.1 !important;
    font-weight: 600 !important;
  }

  html[data-eagle-theme='dark']
  .eagle-navbar
  .mobile-login-section {
    border-top-color:
      rgba(255,255,255,.07) !important;
  }

  html[data-eagle-theme='dark']
  .eagle-navbar
  .mobile-login-label {
    color: #70869b !important;
  }

  html[data-eagle-theme='dark']
  .eagle-navbar
  .mobile-menu-panel
  .mobile-login-card {
    color: #ffffff !important;
  }

  html[data-eagle-theme='dark']
  .eagle-navbar
  .mobile-menu-panel
  .mobile-login-copy strong {
    color: #ffffff !important;
  }

 }


/* menu opening animation */

@keyframes eagleMenuOpen {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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

          .eagle-navbar .mobile-actions {
            gap: 6px !important;
          }

          .eagle-navbar .mobile-theme-toggle,
          .eagle-navbar .mobile-toggle {
            width: 38px !important;
            min-width: 38px !important;
            height: 38px !important;
            border-radius: 11px !important;
          }

          .eagle-navbar .mobile-menu-panel {
            width: 224px !important;
            right: 10px !important;
            padding: 8px !important;
            border-radius: 15px !important;
          }

          .eagle-navbar .mobile-login-card {
            min-height: 46px !important;
            grid-template-columns: 32px minmax(0,1fr) !important;
            padding: 6px 8px !important;
          }

          .eagle-navbar .mobile-login-icon {
            width: 32px !important;
            height: 32px !important;
            border-radius: 9px !important;
          }
        }
      `}</style>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--eagle-nav-bg)',
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
    color: 'var(--eagle-nav-text)',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  activeLink: {
    color: 'var(--primary-blue)',
  },
  activeLinkDark: {
    color: '#7ab8ff',
  },
  loginBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
  },
  mobileToggle: {
    color: 'var(--eagle-nav-text)',
    display: 'flex',
    alignItems: 'center',
  },

  mobileMenu: {
    backgroundColor: "var(--eagle-menu-bg)",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  mobileLink: {
    display: "flex",
    alignItems: "center",

    padding: "10px 12px",

    fontSize: "0.88rem",
    lineHeight: "1.2",
    fontWeight: "700",

    color: "var(--eagle-nav-text)",
    textDecoration: "none",

    borderRadius: "10px",
    borderBottom: "none",

    transition: "all 0.2s ease",
  },

  activeMobileLink: {
    color: "#0b4f8a",
    backgroundColor: "#edf5ff",
    boxShadow: "inset 3px 0 0 #ff7a00",
  },
  activeMobileLinkDark: {
    color: "#8fc6ff",
    backgroundColor: "rgba(74, 144, 226, 0.12)",
    boxShadow: "inset 3px 0 0 #ff8c00",
  },

  mobileLoginBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    minHeight: "42px",
    padding: "0 12px",

    marginTop: "5px",

    background:
      "linear-gradient(135deg, #0b4f8a 0%, #123f70 100%)",

    color: "#ffffff",

    borderRadius: "10px",

    fontSize: "0.85rem",
    fontWeight: "700",

    textDecoration: "none",

    boxShadow: "0 7px 16px rgba(8, 47, 89, 0.16)",
  },
};


export default Navbar;