import React from 'react';
import { Zap, Map, MessageCircle, Navigation } from 'lucide-react';

const WhyChooseSection = () => {
  const reasons = [
    { title: 'Quick & Easy Booking', desc: 'Book a truck in less than 2 minutes using our intuitive online portal.', icon: <Zap size={28} /> },
    { title: 'Local to All-India Routes', desc: 'From city logistics to national highways, we have the right vehicle for you.', icon: <Map size={28} /> },
    { title: 'Instant WhatsApp Support', desc: 'Get updates and chat with our team 24/7 for complete peace of mind.', icon: <MessageCircle size={28} /> },
    { title: 'Real-Time Trip Tracking', desc: 'Securely track your goods live on the map from pickup to delivery.', icon: <Navigation size={28} /> },
  ];

  return (
    <section style={styles.section}>
      <div className="container">
        <div style={styles.header}>
          <h2 style={styles.title}>Why Choose Eagle Transport</h2>
          <p style={styles.subtitle}>We deliver trust along with your goods. Experience a new standard of logistics.</p>
        </div>
        <div style={styles.grid}>
          {reasons.map((reason, index) => (
            <div key={index} className="card" style={styles.card}>
              <div style={styles.icon}>{reason.icon}</div>
              <h3 style={styles.cardTitle}>{reason.title}</h3>
              <p style={styles.cardDesc}>{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: 'var(--bg-soft)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    maxWidth: '600px',
    margin: '0 auto 48px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '16px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
  },
  card: {
    padding: '32px',
    borderTop: '4px solid var(--primary-blue)',
  },
  icon: {
    color: 'var(--primary-blue)',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '12px',
  },
  cardDesc: {
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  }
};

export default WhyChooseSection;
