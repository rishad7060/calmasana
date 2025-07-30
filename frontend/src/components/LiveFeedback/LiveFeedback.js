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
  const [scoreHistory, setScoreHistory] = useState([])
  const [averageScore, setAverageScore] = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [lastCorrectTime, setLastCorrectTime] = useState(0)

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
    }
  }, [poseAccuracy, isCorrect])

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

  return (
    <div className="live-feedback">
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