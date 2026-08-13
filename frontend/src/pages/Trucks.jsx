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
    use: 'Best for parcels and local delivery.',
    image: '/truck-images/mini-truck.png',
    rateKey: 'Mini Truck (TATA Ace)',
  },

  {
    id: 2,
    name: 'Pickup Truck',
    capacity: '2 - 3 Tons',
    route: 'District Level',
    use: 'Ideal for furniture and shop supply.',
    image: '/truck-images/pickup-truck.png',
    rateKey: 'Pickup Truck',
  },

  {
    id: 3,
    name: '20ft / 22ft / 24ft Container',
    capacity: '12 Tons',
    route: 'District / State',
    use: 'Secure choice for commercial cargo.',
    image: '/truck-images/20ft-container.png',
    rateKey: '20ft / 22ft / 24ft Container',
  },


  {
    id: 4,
    name: '32 ft Container Truck (SXL)',
    capacity: '10-15 Tons',
    route: 'National Route',
    use: 'Reliable for medium industrial loads.',
    image: '/truck-images/32ft-container-sxl.png',
    rateKey: '32 ft Container Truck (SXL)',
  },

  {
    id: 5,
    name: '32 ft Container Truck (MXL)',
    capacity: '15-25 Tons',
    route: 'All India',
    use: 'Built for heavy industrial transport.',
    image: '/truck-images/32ft-container-mxl.png',
    rateKey: '32 ft Container Truck (MXL)',
  },

  {
    id: 6,
    name: '19 ft Open Truck',
    capacity: '12 Tons',
    route: 'State',
    use: 'Perfect for bulk and construction loads.',
    image: '/truck-images/19ft-open-truck.png',
    rateKey: '19 ft Open Truck',
  },

  {
    id: 7,
    name: '10 Tyre Truck',
    capacity: '19 Tons',
    route: 'All India',
    use: 'Heavy-duty transport across India.',
    image: '/truck-images/10-tyre-truck.png',
    rateKey: '10 Tyre Truck',
  },

  {
    id: 8,
    name: '12 Tyre Truck',
    capacity: '25 Tons',
    route: 'All India',
    use: 'For long-distance bulk delivery.',
    image: '/truck-images/12-tyre-truck.png',
    rateKey: '12 Tyre Truck',
  },

  {
    id: 9,
    name: '14 Tyre Truck',
    capacity: '30 Tons',
    route: 'All India',
    use: 'Best for machinery and steel loads.',
    image: '/truck-images/14-tyre-truck.png',
    rateKey: '14 Tyre Truck',
  },

  {
    id: 10,
    name: '16 Tyre Truck',
    capacity: 'Up to 35 Tons',
    route: 'All India',
    use: 'High-capacity truck for heavy cargo.',
    image: '/truck-images/16-tyre-truck.png',
    rateKey: '16 Tyre Truck',
  },

  {
    id: 11,
    name: 'Trailer Truck (40/45/48/53 ft)',
    capacity: '20-50 Tons',
    route: 'All India (Ports & Industrial Hubs)',
    use: 'For oversized and long-haul loads.',
    image: '/truck-images/trailer-truck.png',
    rateKey: '40 ft Trailer',
    isTrailerGroup: true,
  },
];

const features = [
  {
    icon: <Truck size={22} />,
    title: 'Multiple Truck Types',
    text: 'Right truck for every load.',
  },
  {
    icon: <MapPinned size={22} />,
    title: 'District to India Routes',
    text: 'Local, state & all-India service.',
  },
  {
    icon: <PackageCheck size={22} />,
    title: 'Safe Goods Handling',
    text: 'Reliable transport for every cargo.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Trusted Booking',
    text: 'Easy booking with live support.',
  },
];

const Trucks = () => {
  return (
    <div style={styles.page} className="trucks-page">
      {/* Hero */}
      <section style={styles.heroSection} className="trucks-hero">
        <div style={styles.heroOverlay} className="trucks-hero-overlay"></div>
        <div style={styles.container}>
          <div style={styles.heroContent} className="trucks-hero-content">
            <span style={styles.badge} className="trucks-hero-badge">Eagle Transport Fleet</span>
            <h1 style={styles.heroTitle} className="trucks-hero-title">Our Truck Fleet</h1>
            <p style={styles.heroText} className="trucks-hero-text">
              Choose the right truck for your load, route and distance.
            </p>

            <div style={styles.heroButtons} className="trucks-hero-buttons">
              <Link to="/tracking" style={styles.primaryBtn}>Track Booking</Link>
              <Link to="/" style={styles.secondaryBtn}>Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.featureSection} className="trucks-feature-section">
        <div style={styles.container}>
          <div style={styles.sectionHead} className="trucks-section-head">
            <h2 style={styles.sectionTitle} className="trucks-section-title">Why Choose Our Fleet?</h2>
            <p style={styles.sectionText} className="trucks-section-text">
              Smart truck options for every journey.
            </p>
          </div>

          <div style={styles.featureGrid} className="trucks-feature-grid">
            {features.map((item, index) => (
              <div key={index} style={styles.featureCard} className="trucks-feature-card">
                <div style={styles.featureIcon} className="trucks-feature-icon">{item.icon}</div>
                <h3 style={styles.featureTitle} className="trucks-feature-title">{item.title}</h3>
                <p style={styles.featureText} className="trucks-feature-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trucks */}
      <section style={styles.truckSection} className="trucks-list-section">
        <div style={styles.container}>
          <div style={styles.sectionHead} className="trucks-section-head">
            <h2 style={styles.sectionTitle} className="trucks-section-title">Available Truck Types</h2>
            <p style={styles.sectionText} className="trucks-section-text">
              Pick by load, distance and route.
            </p>
          </div>

          <div style={styles.truckGrid} className="trucks-grid">
            {truckData.map((truck) => (
              <div key={truck.id} style={styles.truckCard} className="trucks-card">
                <div style={styles.imageWrap} className="trucks-image-wrap">
                  <img
                    src={truck.image}
                    alt={truck.name}
                    style={styles.truckImage} className="trucks-image"
                  />
                </div>

                <div style={styles.cardBody} className="trucks-card-body">
                  <h3 style={styles.truckName} className="trucks-card-title">{truck.name}</h3>

                  <div style={styles.infoPillWrap} className="trucks-pill-wrap">
                    <span style={styles.infoPill} className="trucks-pill">Capacity: {truck.capacity}</span>
                    <span style={styles.infoPill} className="trucks-pill">Route: {truck.route}</span>
                  </div>

                  <p style={styles.truckDesc} className="trucks-card-desc">{truck.use}</p>

                  <div style={styles.priceTag} className="trucks-price-tag">
                    {truck.isTrailerGroup
                      ? `Base Rate: From ₹${TRUCK_RATES[truck.rateKey]} / km`
                      : `Base Rate: ₹${TRUCK_RATES[truck.rateKey]} / km`}
                  </div>

                  <div style={styles.cardFooter}>
                    <Link to="/" style={styles.cardBtn} className="trucks-card-btn">
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
      <section style={styles.ctaSection} className="trucks-cta-section">
        <div style={styles.container}>
          <div style={styles.ctaBox} className="trucks-cta-box">
            <h2 style={styles.ctaTitle} className="trucks-cta-title">Need Help Choosing?</h2>
            <p style={styles.ctaText} className="trucks-cta-text">
              Tell us your load and route. We’ll suggest the right truck.
            </p>
            <div style={styles.ctaButtons} className="trucks-cta-buttons">
              <a
                href="https://wa.me/918428302003?text=Hello%20Eagle%20Transport%2C%20help%20me%20choose%20the%20right%20truck."
                target="_blank"
                rel="noreferrer"
                style={styles.primaryBtn}
              >
                WhatsApp
              </a>
              <a href="tel:+918428302003" style={styles.secondaryBtnDark}>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Desktop/laptop inline styles remain untouched. */
        @media (max-width: 768px) {
          .trucks-page { background:#f4f7fb !important; }

@media (max-width: 768px) {

  /* =========================================
     TRUCKS PAGE - MOBILE HERO
     ========================================= */

  .trucks-hero {
    position: relative !important;

    /* 1st image hero size feel */
    min-height: 355px !important;
    height: 355px !important;

    padding: 0 !important;
    overflow: hidden !important;

    background-image:
      url('/truck-images/trucks-mobile-hero.png') !important;

    background-size: cover !important;
    background-position: 72% center !important;
    background-repeat: no-repeat !important;
  }


  /* DARK PREMIUM OVERLAY */
  .trucks-hero-overlay {
    position: absolute !important;
    inset: 0 !important;

    background:
      linear-gradient(
        90deg,
        rgba(3, 20, 40, 0.95) 0%,
        rgba(3, 22, 43, 0.88) 40%,
        rgba(4, 24, 46, 0.58) 68%,
        rgba(5, 20, 38, 0.25) 100%
      ) !important;
  }


  .trucks-hero .container {
    position: relative !important;
    z-index: 2 !important;

    width: 100% !important;
    max-width: 100% !important;

    margin: 0 !important;
    padding: 0 !important;
  }


 /* =========================================
   TRUCKS HERO - MOBILE CLEAN VERSION
========================================= */

.trucks-hero-content {
  width: 100% !important;
  max-width: 320px !important;

  padding: 0 !important;

  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;

  text-align: left !important;

  /* full content konjam mela */
  transform: translateY(-18px) !important;
}


/* =========================================
   BADGE
========================================= */

.trucks-hero-badge {
  width: fit-content !important;

  margin: 0 0 14px !important;

  padding: 7px 11px !important;

  display: inline-flex !important;
  align-items: center !important;

  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 999px !important;

  background: rgba(255, 255, 255, 0.10) !important;

  color: #ffffff !important;

  font-size: 10px !important;
  font-weight: 700 !important;

  backdrop-filter: blur(8px) !important;
}


/* =========================================
   TITLE
========================================= */

.trucks-hero-title {
  width: 100% !important;
  max-width: 285px !important;

  margin: 0 0 12px !important;

  font-size: 30px !important;
  line-height: 1.02 !important;

  font-weight: 900 !important;

  letter-spacing: -0.8px !important;

  color: #ffffff !important;
}


/* =========================================
   DESCRIPTION
========================================= */

.trucks-hero-text {
  width: 100% !important;
  max-width: 285px !important;

  margin: 0 0 10px !important;

  font-size: 12px !important;
  line-height: 1.4 !important;

  font-weight: 500 !important;

  color: rgba(255, 255, 255, 0.92) !important;
}


/* =========================================
   BUTTONS
========================================= */

.trucks-hero-buttons {
  width: auto !important;

  display: flex !important;
  align-items: center !important;

  gap: 10px !important;

  margin-top: 22px !important;

  transform: none !important;
}

.trucks-hero-buttons a {
  width: auto !important;

  min-width: 130px !important;
  height: 40px !important;
  min-height: 40px !important;

  padding: 0 16px !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  border-radius: 11px !important;

  font-size: 11px !important;
  font-weight: 700 !important;

  white-space: nowrap !important;
}


  /* HERO ENTRY ANIMATION */
  @keyframes trucksHeroEnter {

    from {
      opacity: 0;
      transform: translateY(15px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

}

          .trucks-feature-section{ padding:24px 0 16px !important; }
          .trucks-list-section{ padding:16px 0 30px !important; }

          .trucks-feature-section .container,
          .trucks-list-section .container,
          .trucks-cta-section .container{
            width:calc(100% - 28px) !important;
            margin:0 auto !important;
          }

          .trucks-section-head{ margin-bottom:12px !important; }

          .trucks-section-title{
            max-width:300px !important;
            margin:0 auto 4px !important;
            font-size:1.30rem !important;
            line-height:1.08 !important;
            letter-spacing:-.025em !important;
          }

          .trucks-section-text{
            max-width:300px !important;
            margin:0 auto !important;
            font-size:.65rem !important;
            line-height:1.35 !important;
          }

          .trucks-feature-grid{
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:8px !important;
          }

          .trucks-feature-card{
            min-height:112px !important;
            padding:11px !important;
            border-radius:13px !important;
            box-shadow:0 8px 18px rgba(15,49,88,.06) !important;
            animation:cardIn .5s ease both;
            transition:transform .2s ease, box-shadow .2s ease !important;
          }

          .trucks-feature-card:nth-child(2){animation-delay:.05s;}
          .trucks-feature-card:nth-child(3){animation-delay:.10s;}
          .trucks-feature-card:nth-child(4){animation-delay:.15s;}

          .trucks-feature-card:active{
            transform:scale(.98);
          }

          .trucks-feature-icon{
            width:32px !important;
            height:32px !important;
            margin-bottom:8px !important;
            border-radius:9px !important;
          }

          .trucks-feature-icon svg{
            width:16px !important;
            height:16px !important;
          }

          .trucks-feature-title{
            margin-bottom:3px !important;
            font-size:.72rem !important;
            line-height:1.16 !important;
          }

          .trucks-feature-text{
            font-size:.57rem !important;
            line-height:1.30 !important;
          }

          .trucks-grid{
            grid-template-columns:1fr !important;
            gap:9px !important;
          }

          .trucks-card{
            display:grid !important;
            grid-template-columns:98px minmax(0,1fr) !important;
            border-radius:14px !important;
            box-shadow:0 8px 20px rgba(10,48,92,.07) !important;
            animation:cardIn .5s ease both;
            transition:transform .2s ease, box-shadow .2s ease !important;
          }

          .trucks-card:active{
            transform:scale(.99);
          }

          .trucks-image-wrap{
            min-height:0 !important;
            padding:9px !important;
          }

          .trucks-image{
            width:100% !important;
            max-width:90px !important;
            height:80px !important;
          }

          .trucks-card-body{
            min-width:0 !important;
            padding:10px 10px 9px !important;
          }

          .trucks-card-title{
            margin-bottom:5px !important;
            font-size:.76rem !important;
            line-height:1.15 !important;
          }

          .trucks-pill-wrap{
            gap:4px !important;
            margin-bottom:5px !important;
          }

          .trucks-pill{
            padding:3px 5px !important;
            font-size:.49rem !important;
          }

          .trucks-card-desc{
            margin-bottom:5px !important;
            font-size:.55rem !important;
            line-height:1.28 !important;
          }

          .trucks-price-tag{
            margin-bottom:5px !important;
            padding:4px 6px !important;
            border-radius:7px !important;
            font-size:.53rem !important;
          }

          .trucks-card-btn{
            gap:4px !important;
            padding:5px 7px !important;
            border-radius:7px !important;
            font-size:.55rem !important;
          }

          .trucks-card-btn svg{
            width:11px !important;
            height:11px !important;
          }

          .trucks-cta-section{
            padding:0 0 26px !important;
          }

          .trucks-cta-box{
            padding:16px 13px !important;
            border-radius:16px !important;
            animation:cardIn .5s ease both;
          }

          .trucks-cta-title{
            margin-bottom:5px !important;
            font-size:1.15rem !important;
            line-height:1.1 !important;
          }

          .trucks-cta-text{
            max-width:300px !important;
            margin:0 auto 10px !important;
            font-size:.64rem !important;
            line-height:1.35 !important;
          }

          .trucks-cta-buttons{
            display:grid !important;
            grid-template-columns:1fr 1fr !important;
            gap:7px !important;
          }

          .trucks-cta-buttons a{
            min-height:38px !important;
            padding:0 7px !important;
            border-radius:9px !important;
            font-size:.66rem !important;
          }

          @keyframes truckHeroIn{
            from{opacity:0;transform:translateY(14px);}
            to{opacity:1;transform:translateY(0);}
          }

          @keyframes cardIn{
            from{opacity:0;transform:translateY(12px);}
            to{opacity:1;transform:translateY(0);}
          }

          @media (prefers-reduced-motion: reduce){
            .trucks-hero-content,
            .trucks-feature-card,
            .trucks-card,
            .trucks-cta-box{
              animation:none !important;
              transition:none !important;
            }
          }
        }
      `}</style>
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

    /* Home page hero madhiri balanced desktop height */
    height: '520px',
    minHeight: '520px',
    padding: '0',

    backgroundImage: 'url("/truck-images/trucks-hero-bg.png")',

    /* Hero full area fill aagum */
    backgroundSize: 'cover',

    /* Main parking + trucks visible */
    backgroundPosition: 'center center',

    backgroundRepeat: 'no-repeat',

    overflow: 'hidden',

    display: 'flex',
    alignItems: 'center',
  },


  heroOverlay: {
    position: 'absolute',
    inset: 0,

    /* Left text readable,
       right side image visible
    */
    background: `
    linear-gradient(
      90deg,
      rgba(3, 20, 40, 0.88) 0%,
      rgba(3, 22, 43, 0.72) 38%,
      rgba(4, 24, 46, 0.38) 68%,
      rgba(5, 20, 38, 0.12) 100%
    )
  `,
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