import React from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebase'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import './UserHeader.css'

export default function UserHeader() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('user')
      localStorage.removeItem('yogaHistory')
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLogoClick = () => {
    // If user is signed in, go to dashboard; otherwise go to landing page
    if (user.uid) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="user-header">
      <div className="user-header-content">
        {/* Logo */}
        <div className="logo" onClick={handleLogoClick}>
          <img 
            src="/CalmAsana-logo.png" 
            alt="CalmAsana" 
            className="logo-image"
          />
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="user-details">
            <span className="user-name">Welcome, {user.name || 'User'}!</span>
            <span className="user-status">Ready to practice?</span>
          </div>
          <ThemeToggle />
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}