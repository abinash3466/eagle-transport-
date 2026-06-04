import React from 'react';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import WhyChooseSection from '../components/WhyChooseSection';
import PartnerSection from '../components/PartnerSection';
import ContactSection from '../components/ContactSection';

const Home = () => {
  return (
    <div className="fade-in">
      <HeroSection />
      <StatsSection />
      
      {/* Recent Bookings & Truck Types - Mocked for now */}
      <section className="container" style={{ padding: '80px 24px' }}>
        <h2 className="text-center" style={{ marginBottom: '48px', fontSize: '2.5rem' }}>Our Truck Fleet</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
           {/* We'll implement TruckCard here later */}
           <div className="card text-center">
             <h3>Heavy Truck</h3>
             <p className="text-muted">Best for inter-state heavy goods</p>
           </div>
           <div className="card text-center">
             <h3>Mini Truck</h3>
             <p className="text-muted">Best for local city deliveries</p>
           </div>
           <div className="card text-center">
             <h3>Trailer</h3>
             <p className="text-muted">Best for containers and large machinery</p>
           </div>
        </div>
      </section>

      <WhyChooseSection />
      <PartnerSection />
      <ContactSection />
    </div>
  );
};

export default Home;
