/**
 * Enhanced Session Tracker Component
 * Drop-in replacement for existing session tracking in EnhancedYoga
 */

import React, { useState, useEffect, useRef } from 'react'
import { SessionTracker } from '../../utils/sessionTracking'
import { DataService } from '../../services/dataService'

export const useEnhancedSessionTracking = () => {
  const trackerRef = useRef(new SessionTracker())
  const [currentStats, setCurrentStats] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const statsInterval = useRef(null)

  // Start session tracking
  const startSession = (pose) => {
    const tracker = trackerRef.current
    tracker.startSession(pose)
    tracker.startPose(pose)
    setIsTracking(true)

    // Update stats every second
    statsInterval.current = setInterval(() => {
      const stats = tracker.getCurrentStats()
      setCurrentStats(stats)
    }, 1000)

    console.log('Enhanced session tracking started for:', pose)
    return tracker.sessionStart
  }

  // Log pose detection
  const logDetection = (pose, accuracy, isCorrect) => {
    const tracker = trackerRef.current
    tracker.logDetection(pose, accuracy, isCorrect)
  }

  // Switch to different pose
  const switchPose = (newPose) => {
    const tracker = trackerRef.current
    tracker.endPose()
    tracker.startPose(newPose)
  }

  // End session and save data
  const endSession = async () => {
    const tracker = trackerRef.current
    const sessionData = tracker.endSession()
    
    if (statsInterval.current) {
      clearInterval(statsInterval.current)
    }
    
    setIsTracking(false)
    setCurrentStats(null)

    // Save to Firebase
    if (sessionData) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.uid) {
          await DataService.saveSession(user.uid, sessionData)
          console.log('Session saved successfully')
        }
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }

    // Reset tracker for next session
    tracker.reset()
    
    return sessionData
  }

  // Get current session statistics
  const getStats = () => {
    return trackerRef.current.getCurrentStats()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current)
      }
    }
  }, [])

  return {
    startSession,
    endSession,
    logDetection,
    switchPose,
    getStats,
    currentStats,
    isTracking
  }
}

// Component for displaying real-time stats
export const RealtimeStats = ({ stats, pose }) => {
  if (!stats) return null

  return (
    <div className="realtime-stats">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.sessionTime}s</span>
          <span className="stat-label">Session Time</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.poseTime}s</span>
          <span className="stat-label">Pose Time</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.accuracyRate}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.avgScore}</span>
          <span className="stat-label">Avg Score</span>
        </div>
      </div>
      
      <div className="detection-info">
        <div className="detection-count">
          <span>{stats.correctDetections}/{stats.totalDetections}</span>
          <span> correct detections</span>
        </div>
      </div>
    </div>
  )
}

// Enhanced pose detection wrapper
export const enhancedPoseDetection = (originalDetection, sessionTracker) => {
  return (detector, poseClassifier, countAudio, currentPose, threshold = 0.97) => {
    // Call original detection logic
    const result = originalDetection(detector, poseClassifier, countAudio)
    
    // Extract accuracy from classification result
    if (result && result.classification) {
      result.classification.array().then((data) => {
        const classNo = getClassNumber(currentPose) // You'll need to implement this
        const accuracy = data[0][classNo]
        const isCorrect = accuracy > threshold
        
        // Log detection with enhanced tracker
        sessionTracker.logDetection(currentPose, accuracy, isCorrect)
      })
    }
    
    return result
  }
}

// Session summary component
export const EnhancedSessionSummary = ({ sessionData, onClose }) => {
  if (!sessionData) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="enhanced-session-summary">
      <div className="summary-header">
        <h2>Session Complete!</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="summary-content">
        <div className="main-stats">
          <div className="stat-card">
            <h3>Total Time</h3>
            <p className="stat-value">{formatTime(sessionData.totalTime)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <p className="stat-value">{sessionData.avgScore}%</p>
          </div>
          <div className="stat-card">
            <h3>Accuracy Rate</h3>
            <p className="stat-value">{sessionData.accuracyRate}%</p>
          </div>
          <div className="stat-card">
            <h3>Perfect Poses</h3>
            <p className="stat-value">{sessionData.perfectPoses}</p>
          </div>
        </div>

        <div className="pose-breakdown">
          <h3>Pose Performance</h3>
          {sessionData.poseResults.map((pose, index) => (
            <div key={index} className="pose-result">
              <div className="pose-name">{pose.name}</div>
              <div className="pose-stats">
                <span>Time: {formatTime(pose.totalTime)}</span>
                <span>Accuracy: {pose.accuracy}%</span>
                <span>Attempts: {pose.attempts}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="session-insights">
          <h3>Session Insights</h3>
          <p>Improvement: {sessionData.improvement}</p>
          <p>Detection Efficiency: {sessionData.efficiency}%</p>
          <p>Total Detections: {sessionData.totalDetections}</p>
        </div>
      </div>
    </div>
  )
}