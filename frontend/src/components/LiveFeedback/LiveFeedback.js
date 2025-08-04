import React, { useState, useEffect } from 'react'
import './LiveFeedback.css'

export default function LiveFeedback({ 
  currentPose, 
  poseAccuracy, 
  isCorrect, 
  feedback, 
  improvements,
  poseTime,
  targetTime = 30
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [autoShowTimer, setAutoShowTimer] = useState(null)
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const [sessionPhase, setSessionPhase] = useState('starting') // starting, practicing, struggling, succeeding
  const [scoreHistory, setScoreHistory] = useState([])
  const [averageScore, setAverageScore] = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [lastCorrectTime, setLastCorrectTime] = useState(0)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Smart auto-show/hide logic based on pose performance and context
  useEffect(() => {
    if (poseAccuracy !== null && poseAccuracy !== undefined) {
      setScoreHistory(prev => {
        const newHistory = [...prev, poseAccuracy].slice(-20) // Keep last 20 scores
        const avg = newHistory.reduce((sum, score) => sum + score, 0) / newHistory.length
        setAverageScore(avg)
        return newHistory
      })

      // Update streak
      if (isCorrect) {
        setStreakCount(prev => prev + 1)
        setLastCorrectTime(Date.now())
      } else if (Date.now() - lastCorrectTime > 3000) { // Reset streak after 3s of incorrect pose
        setStreakCount(0)
      }

      // Smart session phase detection and auto-display logic
      if (isMobile) {
        // Auto-show conditions:
        // 1. When struggling (accuracy < 60% for more than 5 seconds)
        // 2. When achieving milestones (every 30 seconds of good pose)
        // 3. At the start of practice (first 15 seconds)
        // 4. When accuracy dramatically improves or drops
        
        const now = Date.now()
        const timeSinceStart = poseTime
        
        let shouldAutoShow = false
        let newPhase = sessionPhase
        
        // Starting phase - first 15 seconds
        if (timeSinceStart < 15) {
          shouldAutoShow = true
          newPhase = 'starting'
        }
        // Struggling phase - low accuracy for extended time
        else if (poseAccuracy < 60 && !isCorrect) {
          shouldAutoShow = true
          newPhase = 'struggling'
        }
        // Success milestones - every 30 seconds of good performance
        else if (isCorrect && Math.floor(timeSinceStart) % 30 === 0 && timeSinceStart > 0) {
          shouldAutoShow = true
          newPhase = 'succeeding'
        }
        // Major accuracy changes (> 30 point swing)
        else if (scoreHistory.length > 1) {
          const accuracyChange = Math.abs(poseAccuracy - scoreHistory[scoreHistory.length - 2])
          if (accuracyChange > 30) {
            shouldAutoShow = true
            newPhase = accuracyChange > 0 ? 'improving' : 'declining'
          }
        }
        
        if (shouldAutoShow && !isExpanded) {
          setIsExpanded(true)
          setSessionPhase(newPhase)
          setLastInteractionTime(now)
          
          // Auto-hide after appropriate time based on context
          const autoHideDelay = newPhase === 'struggling' ? 8000 : // 8s for help
                                newPhase === 'starting' ? 6000 :   // 6s for initial info
                                newPhase === 'succeeding' ? 4000 : // 4s for celebration
                                5000 // 5s default
          
          if (autoShowTimer) clearTimeout(autoShowTimer)
          const timer = setTimeout(() => {
            setIsExpanded(false)
          }, autoHideDelay)
          setAutoShowTimer(timer)
        }
      }
    }
  }, [poseAccuracy, isCorrect, poseTime, isMobile, isExpanded, scoreHistory, sessionPhase, autoShowTimer])

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981' // green
    if (score >= 70) return '#f59e0b' // yellow
    if (score >= 50) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent!'
    if (score >= 80) return 'Great!'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Keep trying!'
  }

  const progressPercentage = Math.min((poseTime / targetTime) * 100, 100)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoShowTimer) {
        clearTimeout(autoShowTimer)
      }
    }
  }, [autoShowTimer])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    setLastInteractionTime(Date.now())
    
    // Clear auto-timer if user manually interacts
    if (autoShowTimer) {
      clearTimeout(autoShowTimer)
      setAutoShowTimer(null)
    }
  }

  return (
    <div className={`live-feedback ${isMobile ? (isExpanded ? 'expanded' : 'collapsed') : ''} ${sessionPhase}`}>
      {/* Real-time Score Display */}
      <div className="score-display">
        <div className="score-circle" style={{ borderColor: getScoreColor(poseAccuracy || 0) }}>
          <div className="score-number">{Math.round(poseAccuracy || 0)}%</div>
          <div className="score-label">{getScoreLabel(poseAccuracy || 0)}</div>
        </div>
        
        <div className="score-details">
          <div className="detail-item">
            <span className="detail-label">Average</span>
            <span className="detail-value">{Math.round(averageScore)}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Streak</span>
            <span className="detail-value">{streakCount}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Hold Time</span>
          <span className="progress-time">{Math.round(poseTime)}s / {targetTime}s</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: progressPercentage >= 100 ? '#10b981' : '#3b82f6'
            }}
          ></div>
        </div>
      </div>

      {/* Live Feedback Messages */}
      <div className="feedback-messages">
        {isCorrect ? (
          <div className="feedback-message success">
            <div className="feedback-icon">✅</div>
            <div className="feedback-text">Perfect! Hold this position</div>
          </div>
        ) : (
          <div className="feedback-message warning">
            <div className="feedback-icon">⚠️</div>
            <div className="feedback-text">{feedback || 'Adjust your pose'}</div>
          </div>
        )}
      </div>

      {/* Improvement Suggestions */}
      {improvements && improvements.length > 0 && (
        <div className="improvements-section">
          <h4 className="improvements-title">💡 Tips to improve:</h4>
          <ul className="improvements-list">
            {improvements.map((tip, index) => (
              <li key={index} className="improvement-item">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pose Stability Indicator */}
      <div className="stability-indicator">
        <span className="stability-label">Stability</span>
        <div className="stability-bars">
          {[1, 2, 3, 4, 5].map(bar => (
            <div 
              key={bar}
              className={`stability-bar ${(averageScore / 20) >= bar ? 'active' : ''}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mini-chart">
        <div className="chart-title">Performance Trend</div>
        <div className="chart-container">
          {scoreHistory.map((score, index) => (
            <div 
              key={index}
              className="chart-bar"
              style={{ 
                height: `${score}%`,
                backgroundColor: getScoreColor(score),
                opacity: 0.7 + (index / scoreHistory.length) * 0.3
              }}
            ></div>
          ))}
        </div>
      </div>

    </div>
  )
}