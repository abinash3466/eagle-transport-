import React from 'react';
import { Truck, Clock, Map, CheckCircle } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { icon: <Truck size={32} />, value: '8+', label: 'Total Trucks' },
    { icon: <Clock size={32} />, value: '24/7', label: 'Booking Support' },
    { icon: <Map size={32} />, value: '3', label: 'Trip Levels' },
    { icon: <CheckCircle size={32} />, value: '100%', label: 'Easy Booking' },
  ];

  return (
    <section style={styles.section}>
      <div className="container">
        <div style={styles.grid}>
          {stats.map((stat, index) => (
            <div key={index} className="card" style={styles.card}>
              <div style={styles.iconWrapper}>{stat.icon}</div>
              <h3 style={styles.value}>{stat.value}</h3>
              <p style={styles.label}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '48px 0',
    backgroundColor: 'var(--white)',
    marginTop: '-40px',
    position: 'relative',
    zIndex: 10,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  card: {
    textAlign: 'center',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
  },
  iconWrapper: {
    color: 'var(--accent-orange)',
    backgroundColor: 'rgba(255, 138, 29, 0.1)',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  value: {
    fontSize: '2rem',
    color: 'var(--dark-blue)',
    marginBottom: '4px',
  },
  label: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  }
};

export default StatsSection;
