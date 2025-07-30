import React from 'react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import Landing from './pages/Landing/Landing'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import Home from './pages/Home/Home'
import Yoga from './pages/Yoga/Yoga'
import EnhancedYoga from './pages/EnhancedYoga/EnhancedYoga'
import About from './pages/About/About'
import Tutorials from './pages/Tutorials/Tutorials'
import Onboarding from './pages/Onboarding/Onboarding'
import Poses from './pages/Poses/Poses'
import Settings from './pages/Settings/Settings'
import History from './pages/History/History'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'

import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Landing />}/>
            <Route path='/auth' element={<Auth />}/>
            <Route path='/onboarding' element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path='/home' element={<Home />}/>
            <Route path='/start' element={
              <ProtectedRoute>
                <EnhancedYoga />
              </ProtectedRoute>
            } />
            <Route path='/yoga-classic' element={
              <ProtectedRoute>
                <Yoga />
              </ProtectedRoute>
            } />
            <Route path='/poses' element={
              <ProtectedRoute>
                <Poses />
              </ProtectedRoute>
            } />
            <Route path='/settings' element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path='/history' element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path='/about' element={<About />} />
            <Route path='/tutorials' element={<Tutorials />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}


