import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../config/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useToast } from '../../contexts/ToastContext'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const toast = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (isSignUp && !formData.name.trim()) {
      setError('Please enter your full name')
      setIsLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user
        
        // Update user profile with display name
        await updateProfile(user, {
          displayName: formData.name
        })
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: formData.name,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
          yogaProfile: null,
          sessions: [],
          achievements: [],
          weeklyStats: {}
        })
        
        // Store basic user data in localStorage for quick access
        const userData = {
          uid: user.uid,
          name: formData.name,
          email: user.email,
          isAuthenticated: true,
          onboardingCompleted: false
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Show success message
        toast.success('Account created successfully! Welcome to CalmAsana.')
        
        // Navigate to onboarding
        navigate('/onboarding')
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user
        
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userDocData = userDoc.data()
        
        // Store user data in localStorage
        const userData = {
          uid: user.uid,
          name: userDocData?.name || user.displayName || user.email.split('@')[0],
          email: user.email,
          isAuthenticated: true,
          onboardingCompleted: userDocData?.onboardingCompleted || false
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Show success message
        toast.success('Welcome back to CalmAsana!')
        
        // Navigate based on onboarding status
        if (userDocData?.onboardingCompleted) {
          navigate('/dashboard')
        } else {
          navigate('/onboarding')
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in.')
          break
        case 'auth/weak-password':
          setError('Password should be at least 6 characters')
          break
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up.')
          break
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.')
          break
        case 'auth/invalid-email':
          setError('Invalid email address format')
          break
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.')
          break
        default:
          setError('Authentication failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-element floating-1"></div>
        <div className="floating-element floating-2"></div>
        <div className="floating-element floating-3"></div>
      </div>
      
      <div className="auth-content">
        {/* Header */}
        <div className="auth-header">
          <div className="logo">
            <img 
              src="/CalmAsana-logo.png" 
              alt="CalmAsana" 
              className="logo-image"
            />
          </div>
          <button 
            className="back-home-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isSignUp ? 'Start your yoga journey today' : 'Continue your yoga practice'}</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={isSignUp}
                    style={{ paddingLeft: '45px' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="inline-loading-spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="link">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="link">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}