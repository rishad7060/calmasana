import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Detection',
      description: 'Advanced pose recognition technology analyzes your form in real-time.',
      color: 'feature-violet'
    },
    {
      icon: '🎯',
      title: 'Real-time Feedback',
      description: 'Get instant corrections and guidance during your practice sessions.',
      color: 'feature-emerald'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Track your improvement with detailed insights and performance metrics.',
      color: 'feature-blue'
    },
    {
      icon: '🏆',
      title: 'Expert Guidance',
      description: 'Poses designed by certified yoga instructors and wellness experts.',
      color: 'feature-amber'
    },
    {
      icon: '⚡',
      title: 'Instant Results',
      description: 'See your pose accuracy and get corrections immediately.',
      color: 'feature-rose'
    },
    {
      icon: '🔒',
      title: 'Safety First',
      description: 'Poses adapted for your skill level and physical capabilities.',
      color: 'feature-indigo'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '8+', label: 'Yoga Poses' },
    { number: '98%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Available' }
  ]

  const poses = [
    { 
      name: 'Tree Pose', 
      description: 'Build balance and focus while strengthening your core and legs.',
      image: '🌳',
      color: 'pose-green'
    },
    { 
      name: 'Warrior Pose', 
      description: 'Develop strength, stability, and confidence through powerful stances.',
      image: '⚔️',
      color: 'pose-purple'
    },
    { 
      name: 'Cobra Pose', 
      description: 'Open your chest and strengthen your spine with gentle backbends.',
      image: '🐍',
      color: 'pose-orange'
    },
    { 
      name: 'Chair Pose', 
      description: 'Build lower body strength and endurance with this powerful pose.',
      image: '🪑',
      color: 'pose-blue'
    },
    { 
      name: 'Triangle Pose', 
      description: 'Stretch and strengthen your entire body with this classic pose.',
      image: '📐',
      color: 'pose-pink'
    },
    { 
      name: 'Downward Dog', 
      description: 'Energize your body and calm your mind with this foundational pose.',
      image: '🐕',
      color: 'pose-indigo'
    }
  ]

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">
              <span>🧘</span>
            </div>
            <span className="logo-text">CalmAsana</span>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#poses" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Poses</a>
            <a href="#about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            <ThemeToggle />
            <Link to="/auth" className="nav-btn secondary" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/auth" className="nav-btn primary" onClick={() => setIsMobileMenuOpen(false)}>
              Get Started
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-element hero-float-1"></div>
          <div className="floating-element hero-float-2"></div>
          <div className="floating-element hero-float-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            AI-Powered Yoga Experience
          </div>
          
          <h1 className="hero-title">
            Transform Your
            <span className="hero-title-gradient">Yoga Journey</span>
            With AI Precision
          </h1>
          
          <p className="hero-description">
            Experience personalized yoga like never before. Our AI analyzes your poses in real-time, 
            providing instant feedback and guidance to perfect your practice.
          </p>
          
          <div className="hero-buttons">
            <Link to="/auth" className="hero-btn primary">
              Start Your Journey
              <span className="btn-arrow">→</span>
            </Link>
            <button className="hero-btn secondary">
              Watch Demo
              <span className="play-icon">▶️</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Why Choose CalmAsana?</h2>
            <p className="section-description">
              Experience the future of yoga with our intelligent platform designed for your success.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${feature.color}`}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Poses Section */}
      <section id="poses" className="poses-section">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Master These Poses</h2>
            <p className="section-description">
              Start with our curated collection of yoga poses, each with AI-powered guidance.
            </p>
          </div>

          <div className="poses-grid">
            {poses.map((pose, index) => (
              <div key={index} className={`pose-card ${pose.color}`}>
                <div className="pose-icon">{pose.image}</div>
                <h3 className="pose-title">{pose.name}</h3>
                <p className="pose-description">{pose.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-content">
          <div className="about-content">
            <h2 className="section-title">About CalmAsana</h2>
            <p className="about-text">
              CalmAsana represents the perfect fusion of ancient yoga wisdom and cutting-edge AI technology. 
              Our platform creates deeply personalized experiences that evolve with your practice, ensuring 
              every session is optimized for your unique needs and goals.
            </p>
            <div className="about-stats">
              <span className="about-icon">👥</span>
              <span>Trusted by thousands of yoga enthusiasts worldwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Practice?</h2>
          <p className="cta-description">
            Join thousands of users who have discovered their perfect yoga routine with CalmAsana's intelligent platform.
          </p>
          <Link to="/auth" className="cta-button">
            Start Free Today
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <span>🧘</span>
                </div>
                <span className="logo-text">CalmAsana</span>
              </div>
              <p className="footer-description">Your personal yoga journey, powered by AI.</p>
            </div>
            
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#poses">Poses</a></li>
                <li><a href="#about">About</a></li>
                <li><Link to="/auth">Sign In</Link></li>
              </ul>
            </div>
            
            <div className="footer-contact">
              <h4>Contact</h4>
              <ul>
                <li>support@calmasana.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
            
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">Facebook</a>
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">Twitter</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 CalmAsana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}