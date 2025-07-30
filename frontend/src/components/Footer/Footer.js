import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <img 
                src="/CalmAsana-logo.png" 
                alt="CalmAsana" 
                className="logo-image"
              />
            </div>
            <p className="footer-description">Your personal yoga journey, powered by AI.</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/start">Practice</Link></li>
              <li><Link to="/history">History</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4>Support</h4>
            <ul>
              <li>help@calmasana.com</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>FAQ</li>
            </ul>
          </div>
          
          <div className="footer-social">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">📘 Facebook</a>
              <a href="#" className="social-link">📸 Instagram</a>
              <a href="#" className="social-link">🐦 Twitter</a>
              <a href="#" className="social-link">📺 YouTube</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 CalmAsana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}