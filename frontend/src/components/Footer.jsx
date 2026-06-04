import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          <div>
            <h3 style={styles.brand}>EAGLE TRANSPORT</h3>
            <p style={styles.tagline}>Safe. Fast. Trusted.</p>
            <p style={styles.desc}>Providing reliable and transparent truck booking services across India.</p>
          </div>
          <div>
            <h4 style={styles.heading}>Quick Links</h4>
            <ul style={styles.list}>
              <li><a href="/" style={styles.link}>Home</a></li>
              <li><a href="/trucks" style={styles.link}>Truck Types</a></li>
              <li><a href="/tracking" style={styles.link}>Track Your Booking</a></li>
            </ul>
          </div>
          <div>
            <h4 style={styles.heading}>Contact</h4>
            <ul style={styles.list}>
              <li style={styles.link}>📞 +91 8428302003</li>
              <li style={styles.link}>✉️ support@eagletransport.in</li>
              <li style={styles.link}>🏢 Ambasamudram, Tirunelveli.</li>
            </ul>
          </div>
        </div>
        <div style={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Eagle Transport. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--dark-blue)',
    color: 'white',
    padding: '64px 0 24px',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '48px',
  },
  brand: {
    color: 'white',
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  tagline: {
    color: 'var(--accent-orange)',
    fontWeight: '600',
    marginBottom: '16px',
  },
  desc: {
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '300px',
  },
  heading: {
    color: 'white',
    fontSize: '1.2rem',
    marginBottom: '20px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'color 0.2s',
  },
  bottom: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '24px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
  }
};

export default Footer;
