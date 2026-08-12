import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  PackageCheck,
  MapPinned,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { TRUCK_RATES } from '../utils/pricingCalculator';

const truckData = [
  {
    id: 1,
    name: 'Mini Truck (TATA Ace)',
    capacity: '1 - 2 Tons',
    route: 'Local / Short Distance',
    use: 'Best for grocery loads, parcels, small business goods and local delivery.',
    image: '/truck-images/mini-truck.png',
    rateKey: 'Mini Truck (TATA Ace)',
  },

  {
    id: 2,
    name: 'Pickup Truck',
    capacity: '2 - 3 Tons',
    route: 'District Level',
    use: 'Suitable for furniture, agriculture goods, shop supply and light transport.',
    image: '/truck-images/pickup-truck.png',
    rateKey: 'Pickup Truck',
  },

  {
    id: 3,
    name: '20ft / 22ft / 24ft Container',
    capacity: '12 Tons',
    route: 'District / State',
    use: 'Ideal for medium business cargo, storage goods and commercial shipment.',
    image: '/truck-images/20ft-container.png',
    rateKey: '20ft / 22ft / 24ft Container',
  },


  {
    id: 4,
    name: '32 ft Container Truck (SXL)',
    capacity: '10-15 Tons',
    route: 'National Route',
    use: 'Secure closed-body transport vehicle for medium industrial and logistics delivery.',
    image: '/truck-images/32ft-container-sxl.png',
    rateKey: '32 ft Container Truck (SXL)',
  },

  {
    id: 5,
    name: '32 ft Container Truck (MXL)',
    capacity: '15-25 Tons',
    route: 'All India',
    use: 'Built for heavy industrial parts, automotive components, and raw materials.',
    image: '/truck-images/32ft-container-mxl.png',
    rateKey: '32 ft Container Truck (MXL)',
  },

  {
    id: 6,
    name: '19 ft Open Truck',
    capacity: '12 Tons',
    route: 'State',
    use: 'Open-body truck suitable for construction materials and bulk loading.',
    image: '/truck-images/19ft-open-truck.png',
    rateKey: '19 ft Open Truck',
  },

  {
    id: 7,
    name: '10 Tyre Truck',
    capacity: '19 Tons',
    route: 'All India',
    use: 'Heavy-duty open-body truck for industrial goods and large cargo transport.',
    image: '/truck-images/10-tyre-truck.png',
    rateKey: '10 Tyre Truck',
  },

  {
    id: 8,
    name: '12 Tyre Truck',
    capacity: '25 Tons',
    route: 'All India',
    use: 'Perfect for long-distance heavy transport and bulk commercial delivery.',
    image: '/truck-images/12-tyre-truck.png',
    rateKey: '12 Tyre Truck',
  },

  {
    id: 9,
    name: '14 Tyre Truck',
    capacity: '30 Tons',
    route: 'All India',
    use: 'Large open-body truck suitable for machinery, steel and industrial logistics.',
    image: '/truck-images/14-tyre-truck.png',
    rateKey: '14 Tyre Truck',
  },

  {
    id: 10,
    name: '16 Tyre Truck',
    capacity: 'Up to 35 Tons',
    route: 'All India',
    use: 'High-capacity truck for large scale transport, heavy machinery and long routes.',
    image: '/truck-images/16-tyre-truck.png',
    rateKey: '16 Tyre Truck',
  },

  {
    id: 11,
    name: 'Trailer Truck (40/45/48/53 ft)',
    capacity: '20-50 Tons',
    route: 'All India (Ports & Industrial Hubs)',
    use: 'Engineered for the heaviest loads, machinery, and long-haul logistics.',
    image: '/truck-images/trailer-truck.png',
    rateKey: '40 ft Trailer',
    isTrailerGroup: true,
  },
];

const features = [
  {
    icon: <Truck size={22} />,
    title: 'Multiple Truck Types',
    text: 'Choose the correct truck based on your load, route and transport requirement.',
  },
  {
    icon: <MapPinned size={22} />,
    title: 'District to India Routes',
    text: 'Book trucks for local delivery, state transport and all India long-distance routes.',
  },
  {
    icon: <PackageCheck size={22} />,
    title: 'Safe Goods Handling',
    text: 'Reliable trucks for household items, business cargo, industrial material and more.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Trusted Booking',
    text: 'Easy booking process with tracking, support and secure transport service.',
  },
];

const Trucks = () => {
  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>Eagle Transport Fleet</span>
            <h1 style={styles.heroTitle}>Our Truck Fleet</h1>
            <p style={styles.heroText}>
              View all available trucks and choose the right vehicle for your goods,
              route and load capacity. From local trips to national delivery, Eagle Transport
              gives you the right truck at the right time.
            </p>

            <div style={styles.heroButtons}>
              <Link to="/tracking" style={styles.primaryBtn}>Track Booking</Link>
              <Link to="/" style={styles.secondaryBtn}>Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.featureSection}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Why Choose Our Fleet?</h2>
            <p style={styles.sectionText}>
              Flexible truck options for every type of transport need.
            </p>
          </div>

          <div style={styles.featureGrid}>
            {features.map((item, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>{item.icon}</div>
                <h3 style={styles.featureTitle}>{item.title}</h3>
                <p style={styles.featureText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trucks */}
      <section style={styles.truckSection}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Available Truck Types</h2>
            <p style={styles.sectionText}>
              Select the perfect vehicle based on load size, distance and transport purpose.
            </p>
          </div>

          <div style={styles.truckGrid}>
            {truckData.map((truck) => (
              <div key={truck.id} style={styles.truckCard}>
                <div style={styles.imageWrap}>
                  <img
                    src={truck.image}
                    alt={truck.name}
                    style={styles.truckImage}
                  />
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.truckName}>{truck.name}</h3>

                  <div style={styles.infoPillWrap}>
                    <span style={styles.infoPill}>Capacity: {truck.capacity}</span>
                    <span style={styles.infoPill}>Route: {truck.route}</span>
                  </div>

                  <p style={styles.truckDesc}>{truck.use}</p>

                  <div style={styles.priceTag}>
                    {truck.isTrailerGroup
                      ? `Base Rate: From ₹${TRUCK_RATES[truck.rateKey]} / km`
                      : `Base Rate: ₹${TRUCK_RATES[truck.rateKey]} / km`}
                  </div>

                  <div style={styles.cardFooter}>
                    <Link to="/" style={styles.cardBtn}>
                      Book This Truck <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaBox}>
            <h2 style={styles.ctaTitle}>Need Help Choosing the Right Truck?</h2>
            <p style={styles.ctaText}>
              Our Eagle Transport team helps you choose the correct truck based on your goods,
              route and ton capacity.
            </p>
            <div style={styles.ctaButtons}>
              <a
                href="https://wa.me/918428302003?text=Hello%20Eagle%20Transport%2C%20help%20me%20choose%20the%20right%20truck."
                target="_blank"
                rel="noreferrer"
                style={styles.primaryBtn}
              >
                WhatsApp Support
              </a>
              <a href="tel:+918428302003" style={styles.secondaryBtnDark}>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    background: '#f6f9fc',
    minHeight: '100vh',
  },

  container: {
    width: 'min(1200px, calc(100% - 40px))',
    margin: '0 auto',
  },

  heroSection: {
    position: 'relative',
    padding: '90px 0 80px',
    backgroundImage: 'url("/truck-images/trucks-hero-bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
  },

  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(9,41,79,0.78), rgba(9,41,79,0.45))',
  },

  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '720px',
    color: '#fff',
  },

  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '20px',
    backdropFilter: 'blur(8px)',
  },

  heroTitle: {
    fontSize: '3.1rem',
    fontWeight: '900',
    lineHeight: '1.1',
    marginBottom: '16px',
    color: 'rgba(255,255,255,0.92)',
  },

  heroText: {
    fontSize: '1.08rem',
    lineHeight: '1.8',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: '28px',
    maxWidth: '640px',
  },

  heroButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
  },

  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    borderRadius: '14px',
    background: '#ff8a1d',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '700',
    boxShadow: '0 10px 25px rgba(255,138,29,0.28)',
  },

  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    borderRadius: '14px',
    background: '#fff',
    color: '#123d72',
    textDecoration: 'none',
    fontWeight: '700',
    border: '2px solid #fff',
  },

  secondaryBtnDark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    borderRadius: '14px',
    background: 'transparent',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '700',
    border: '2px solid rgba(255,255,255,0.35)',
  },

  featureSection: {
    padding: '70px 0 30px',
  },

  truckSection: {
    padding: '30px 0 80px',
  },

  sectionHead: {
    textAlign: 'center',
    marginBottom: '34px',
  },

  sectionTitle: {
    fontSize: '2.2rem',
    color: '#123d72',
    marginBottom: '10px',
    fontWeight: '800',
  },

  sectionText: {
    color: '#5e7791',
    fontSize: '1rem',
    maxWidth: '720px',
    margin: '0 auto',
    lineHeight: '1.7',
  },

  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '22px',
  },

  featureCard: {
    background: '#fff',
    borderRadius: '22px',
    padding: '26px 22px',
    boxShadow: '0 12px 28px rgba(12,55,101,0.07)',
    border: '1px solid rgba(18,61,114,0.06)',
  },

  featureIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#eef5ff',
    color: '#123d72',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },

  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#123d72',
    marginBottom: '8px',
  },

  featureText: {
    color: '#617b95',
    lineHeight: '1.7',
    fontSize: '0.95rem',
  },

  truckGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '26px',
  },

  truckCard: {
    background: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 14px 34px rgba(10,48,92,0.08)',
    border: '1px solid rgba(18,61,114,0.06)',
    transition: 'transform 0.3s ease',
  },

  imageWrap: {
    background: 'linear-gradient(180deg, #eef5ff 0%, #f7fbff 100%)',
    padding: '22px',
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  truckImage: {
    width: '100%',
    maxWidth: '280px',
    height: '180px',
    objectFit: 'contain',
    display: 'block',
  },

  cardBody: {
    padding: '24px',
  },

  truckName: {
    fontSize: '1.35rem',
    color: '#123d72',
    fontWeight: '800',
    marginBottom: '14px',
  },

  infoPillWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
  },

  infoPill: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#31567f',
    background: '#eef5ff',
    borderRadius: '999px',
    padding: '8px 12px',
  },

  truckDesc: {
    color: '#607890',
    lineHeight: '1.8',
    fontSize: '0.96rem',
    marginBottom: '18px',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-start',
  },

  cardBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#123d72',
    fontWeight: '800',
    background: '#f5f9ff',
    padding: '12px 16px',
    borderRadius: '12px',
  },

  ctaSection: {
    padding: '0 0 80px',
  },

  ctaBox: {
    background: 'linear-gradient(135deg, #0f4a88, #0a2f5a)',
    color: '#fff',
    borderRadius: '28px',
    padding: '40px 28px',
    textAlign: 'center',
    boxShadow: '0 18px 40px rgba(8,47,90,0.20)',
  },

  ctaTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#fff',
  },

  ctaText: {
    color: 'rgba(255,255,255,0.88)',
    maxWidth: '760px',
    margin: '0 auto 24px',
    lineHeight: '1.8',
  },

  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  priceTag: {
    marginBottom: '18px',
    background: '#e8fff1',
    color: '#0f9d58',
    fontWeight: '800',
    padding: '10px 14px',
    borderRadius: '12px',
    display: 'inline-block',
    fontSize: '0.92rem',
  },
};

export default Trucks;