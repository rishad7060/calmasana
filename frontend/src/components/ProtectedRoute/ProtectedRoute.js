import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const location = useLocation()
  
  if (!user.isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  // If user hasn't completed onboarding and they're not on the onboarding page
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  
  return children
}