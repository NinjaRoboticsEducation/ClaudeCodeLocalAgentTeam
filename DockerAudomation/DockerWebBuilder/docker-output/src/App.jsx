import { useState, useEffect, useRef } from 'react'
import './App.css'

/* ========================================
   Brew & Bean — Artisanal Coffee Since 1984
   Complete single-page coffee shop website
   ======================================== */

// ---------- NAVIGATION ----------
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="nav">
      <div className="container nav-content">
        <a href="#home" id="nav-home" className="nav-brand">
          <span className="logo-mark">&#9670;</span>
          <div>
            <h2>Brew &amp; Bean</h2>
            <p className="tagline">Artisanal Coffee Since 1984</p>
          </div>
        </a>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-menu">
          <a href="#about" onClick={() => setMenuOpen(false)}>Our Story</a>
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#locations" onClick={() => setMenuOpen(false)}>Locations</a>
          <a href="#locations" className="nav-cta" onClick={() => setMenuOpen(false)}>Visit Us</a>
        </nav>

        <button
          className="mobile-menu-btn"
          id="mobile-menu-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}

// ---------- HERO SECTION ----------
function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            Open today · 6 AM — 8 PM
          </div>
          <h1>
            Where Every Cup<br />
            Tells a <span className="accent">Story</span>
          </h1>
          <p className="hero-subtitle">
            Hand-roasted, single-origin beans served in a cozy neighbourhood
            space. We&apos;ve been crafting the perfect cup for over four decades.
          </p>
          <div className="hero-actions">
            <a href="#menu" className="btn-primary" id="hero-cta-menu">
              Explore Our Menu ↗
            </a>
            <a href="#about" className="btn-secondary" id="hero-cta-story">
              Our Story
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-wrapper">
            <img
              src="./src/assets/hero.png"
              alt="Freshly brewed artisanal coffee at Brew and Bean"
              width="600"
              height="750"
            />
          </div>
          <div className="hero-float-card top">
            <p className="float-card-label">Since</p>
            <p className="float-card-value">
              19<span className="gold">84</span>
            </p>
          </div>
          <div className="hero-float-card bottom">
            <p className="float-card-label">Roast Rating</p>
            <p className="float-card-value">★★★★★</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- ABOUT SECTION ----------
function About() {
  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-image">
          <img
            src="./src/assets/hero.png"
            alt="Interior of Brew and Bean coffee shop"
            width="560"
            height="740"
          />
        </div>
        <div className="about-text">
          <p className="section-label">Our Story</p>
          <h2>Crafted with Passion, Served with Love</h2>
          <p>
            Founded in 1984 by coffee enthusiast Maria Santos,
            Brew &amp; Bean started as a tiny roastery in downtown&apos;s
            historic quarter. What began as a passion project quickly became
            the neighbourhood&apos;s favourite gathering spot.
          </p>
          <p>
            Today, we source beans directly from family farms across
            Ethiopia, Colombia, and Guatemala — ensuring every sip supports
            sustainable farming and delivers exceptional flavour.
          </p>
          <div className="about-values">
            <div className="value-item">
              <span className="value-icon">🌱</span>
              <span>Sustainably Sourced</span>
            </div>
            <div className="value-item">
              <span className="value-icon">🔥</span>
              <span>Small-Batch Roasted</span>
            </div>
            <div className="value-item">
              <span className="value-icon">🤝</span>
              <span>Community First</span>
            </div>
            <div className="value-item">
              <span className="value-icon">☕</span>
              <span>40 Years of Craft</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- MENU SECTION ----------
const menuCategories = [
  {
    icon: '☕',
    title: 'Espresso & Coffee',
    description: 'Classic and signature espresso drinks crafted with precision.',
    items: [
      { name: 'House Espresso', price: '$3.50' },
      { name: 'Cappuccino', price: '$5.00' },
      { name: 'Caramel Latte', price: '$5.50' },
      { name: 'Cold Brew', price: '$4.50' },
      { name: 'Affogato', price: '$6.00' },
    ],
  },
  {
    icon: '🍵',
    title: 'Specialty Drinks',
    description: 'Seasonal creations and house specials you won\'t find anywhere else.',
    items: [
      { name: 'Golden Turmeric Latte', price: '$6.00' },
      { name: 'Lavender Honey Latte', price: '$6.50' },
      { name: 'Matcha Oat Latte', price: '$5.50' },
      { name: 'Chai Spice Blend', price: '$5.00' },
      { name: 'Rose Mocha', price: '$6.50' },
    ],
  },
  {
    icon: '🥐',
    title: 'Fresh Pastries',
    description: 'Baked fresh every morning from our partnered local bakery.',
    items: [
      { name: 'Butter Croissant', price: '$4.00' },
      { name: 'Almond Danish', price: '$4.50' },
      { name: 'Blueberry Muffin', price: '$3.50' },
      { name: 'Cinnamon Roll', price: '$5.00' },
      { name: 'Banana Bread', price: '$4.00' },
    ],
  },
]

function Menu() {
  return (
    <section className="menu section" id="menu">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Our Menu</p>
          <h2>Sip, Savour, Repeat</h2>
          <p>Every item is crafted with care using premium, ethically-sourced ingredients.</p>
        </div>
        <div className="menu-grid">
          {menuCategories.map((cat) => (
            <div className="menu-card" key={cat.title} id={`menu-${cat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="menu-card-icon">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
              <div className="menu-items">
                {cat.items.map((item) => (
                  <div className="menu-item" key={item.name}>
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- TESTIMONIALS SECTION ----------
const testimonials = [
  {
    stars: 5,
    quote: 'The best cold brew in the city, hands down. The atmosphere feels like a warm hug every morning.',
    name: 'Sarah K.',
    role: 'Regular since 2019',
    initials: 'SK',
  },
  {
    stars: 5,
    quote: 'Their lavender honey latte changed my life. I drive 30 minutes just for this drink.',
    name: 'Marcus T.',
    role: 'Weekend visitor',
    initials: 'MT',
  },
  {
    stars: 5,
    quote: 'Perfect spot for remote work — great wifi, amazing pastries, and the friendliest baristas around.',
    name: 'Elena R.',
    role: 'Daily customer',
    initials: 'ER',
  },
]

function Testimonials() {
  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <p className="section-label">What People Say</p>
          <h2>Loved by Our Community</h2>
          <p>Don&apos;t just take our word for it — here&apos;s what our customers are saying.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name} id={`review-${t.initials.toLowerCase()}`}>
              <div className="testimonial-stars">
                {'★'.repeat(t.stars)}
              </div>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- LOCATIONS SECTION ----------
const locations = [
  {
    name: 'Downtown Flagship',
    emoji: '🏙️',
    address: '142 Main Street, Historic Quarter',
    hours: 'Mon–Fri: 6 AM — 8 PM\nSat–Sun: 7 AM — 9 PM',
    parking: 'Street parking & public garage nearby',
    access: 'Wheelchair accessible · Transit: Blue Line',
  },
  {
    name: 'Riverside Studio',
    emoji: '🌊',
    address: '28 River Walk, Arts District',
    hours: 'Mon–Fri: 7 AM — 7 PM\nSat–Sun: 8 AM — 6 PM',
    parking: 'Free lot behind building',
    access: 'Wheelchair accessible · Bike racks available',
  },
]

function Locations() {
  return (
    <section className="locations section" id="locations">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Find Us</p>
          <h2>Our Locations</h2>
          <p>Two cozy spots to enjoy your favourite brew.</p>
        </div>
        <div className="locations-grid">
          {locations.map((loc) => (
            <div className="location-card" key={loc.name} id={`location-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="location-map">{loc.emoji}</div>
              <div className="location-info">
                <h3>{loc.name}</h3>
                <div className="location-detail">
                  <span className="icon">📍</span>
                  <span>{loc.address}</span>
                </div>
                <div className="location-detail">
                  <span className="icon">🕐</span>
                  <span>{loc.hours.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</span>
                </div>
                <div className="location-detail">
                  <span className="icon">🅿️</span>
                  <span>{loc.parking}</span>
                </div>
                <div className="location-detail">
                  <span className="icon">♿</span>
                  <span>{loc.access}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- FOOTER ----------
function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>☕ Brew &amp; Bean</h3>
            <p>
              Handcrafted coffee, baked-fresh pastries, and a warm community
              space — proudly serving our neighbourhood since 1984.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="GitHub" id="social-github">GH</a>
              <a href="#" className="social-link" aria-label="Bluesky" id="social-bluesky">BS</a>
              <a href="#" className="social-link" aria-label="X / Twitter" id="social-x">X</a>
              <a href="#" className="social-link" aria-label="Discord" id="social-discord">DC</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Menu</h4>
            <a href="#menu">Coffee &amp; Espresso</a>
            <a href="#menu">Specialty Drinks</a>
            <a href="#menu">Fresh Pastries</a>
            <a href="#menu">Seasonal Specials</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">Our Story</a>
            <a href="#about">Sourcing</a>
            <a href="#testimonials">Reviews</a>
            <a href="#">Careers</a>
          </div>

          <div className="footer-col">
            <h4>Visit</h4>
            <a href="#locations">Downtown</a>
            <a href="#locations">Riverside</a>
            <a href="#locations">Hours &amp; Parking</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Brew &amp; Bean. All rights reserved. Made with ♥ and freshly ground beans.</p>
        </div>
      </div>
    </footer>
  )
}

// ---------- SCROLL ANIMATION HOOK ----------
function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const el = ref.current
    if (el) {
      const fadeElements = el.querySelectorAll('.fade-in')
      fadeElements.forEach((child) => observer.observe(child))
    }

    return () => observer.disconnect()
  }, [])

  return ref
}

// ---------- MAIN APP ----------
function App() {
  const appRef = useFadeIn()

  return (
    <main id="app-root" ref={appRef}>
      <NavBar />
      <Hero />
      <About />
      <Menu />
      <Testimonials />
      <Locations />
      <Footer />
    </main>
  )
}

export default App
