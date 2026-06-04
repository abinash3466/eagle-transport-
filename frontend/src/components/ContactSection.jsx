import React from 'react';
import { PhoneCall, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactSection = () => {
  return (
    <section style={styles.section}>
      <div className="container text-center">
        <h2 style={styles.title}>Ready to Move Your Goods?</h2>
        <p style={styles.subtitle}>Get in touch with us for special requests or track your existing booking.</p>
        
        <div style={styles.actions}>
          <a href="tel:+918428302003" className="btn btn-primary" style={styles.btn}>
            <PhoneCall size={20} /> Call Now
          </a>
          <a href="https://wa.me/918428302003/" className="btn btn-secondary" style={{...styles.btn, backgroundColor: '#25D366'}}>
            <MessageCircle size={20} /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: 'rgba(15, 74, 136, 0.03)',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '16px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1.2rem',
    marginBottom: '40px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '16px 32px',
    fontSize: '1.1rem',
  }
};

export default ContactSection;
