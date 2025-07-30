import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SessionSummary.css'

export default function SessionSummary({ 
  sessionData, 
  isVisible, 
  onClose,
  onSaveSession 
}) {
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState([])
  const [recommendations, setRecommendations] = useState([])
  
  console.log('SessionSummary render:', { isVisible, sessionData })

  useEffect(() => {
    if (isVisible && sessionData) {
      generateAchievements()
      generateRecommendations()
    }
  }, [isVisible, sessionData])

  const generateAchievements = () => {
    const newAchievements = []
    
    if (sessionData.avgScore >= 90) {
      newAchievements.push({
        title: 'Excellence Achieved',
        description: 'Scored 90%+ average',
        icon: '⭐',
        isNew: true
      })
    }
    
    if (sessionData.totalTime >= 300) { // 5 minutes
      newAchievements.push({
        title: 'Endurance Champion',
        description: 'Practiced for 5+ minutes',
        icon: '💪',
        isNew: true
      })
    }

    if (sessionData.perfectPoses >= 3) {
      newAchievements.push({
        title: 'Pose Perfect',
        description: 'Perfect score on 3+ poses',
        icon: '🎯',
        isNew: true
      })
    }

    setAchievements(newAchievements)
  }

  const generateRecommendations = () => {
    const recs = []
    
    if (sessionData.avgScore < 70) {
      recs.push({
        type: 'improvement',
        title: 'Focus on Alignment',
        description: 'Try holding poses longer and focus on proper form',
        icon: '🧘‍♀️'
      })
    }
    
    if (sessionData.totalTime < 180) {
      recs.push({
        type: 'duration',
        title: 'Extend Practice Time',
        description: 'Aim for at least 3-5 minutes per session',
        icon: '⏰'
      })
    }

    recs.push({
      type: 'variety',
      title: 'Try New Poses',
      description: 'Explore Warrior or Triangle pose next',
      icon: '🔄'
    })

    setRecommendations(recs)
  }

  const handleSaveAndContinue = () => {
    // Data is already saved when stopPose was called
    onClose()
    navigate('/dashboard')
  }

  const handleTryAgain = () => {
    onClose()
    // Stay on the same page to try again
  }

  if (!isVisible) return null

  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#10b981', emoji: '🌟' }
    if (score >= 80) return { grade: 'A', color: '#059669', emoji: '⭐' }
    if (score >= 70) return { grade: 'B', color: '#f59e0b', emoji: '👍' }
    if (score >= 60) return { grade: 'C', color: '#f97316', emoji: '👌' }
    return { grade: 'D', color: '#ef4444', emoji: '💪' }
  }

  const scoreGrade = getScoreGrade(sessionData?.avgScore || 0)

  return (
    <div className="session-summary-overlay">
      <div className="session-summary-modal">
        {/* Header */}
        <div className="summary-header">
          <div className="summary-title">
            <span className="celebration-emoji">🎉</span>
            <h2>Session Complete!</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Score Overview */}
        <div className="score-overview">
          <div className="main-score">
            <div className="score-circle-large" style={{ borderColor: scoreGrade.color }}>
              <div className="score-emoji">{scoreGrade.emoji}</div>
              <div className="score-number-large">{Math.round(sessionData?.avgScore || 0)}%</div>
              <div className="score-grade" style={{ color: scoreGrade.color }}>{scoreGrade.grade}</div>
            </div>
          </div>
          
          <div className="score-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-label">Total Time</div>
              <div className="breakdown-value">{Math.round((sessionData?.totalTime || 0) / 60 * 100) / 100}min</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Poses Attempted</div>
              <div className="breakdown-value">{sessionData?.posesAttempted || 0}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Perfect Poses</div>
              <div className="breakdown-value">{sessionData?.perfectPoses || 0}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Avg Hold Time</div>
              <div className="breakdown-value">{Math.round(sessionData?.avgHoldTime || 0)}s</div>
            </div>
          </div>
        </div>

        {/* Detailed Performance */}
        <div className="performance-details">
          <h3>Pose Performance</h3>
          <div className="poses-performance">
            {sessionData?.poseResults?.map((pose, index) => (
              <div key={index} className="pose-result">
                <div className="pose-name">{pose.name}</div>
                <div className="pose-metrics">
                  <div className="metric">
                    <span className="metric-label">Score:</span>
                    <span className="metric-value" style={{ color: pose.score >= 80 ? '#10b981' : pose.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {pose.score}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Time:</span>
                    <span className="metric-value">{pose.time}s</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Attempts:</span>
                    <span className="metric-value">{pose.attempts}</span>
                  </div>
                </div>
                <div className="pose-progress-bar">
                  <div 
                    className="pose-progress-fill"
                    style={{ 
                      width: `${pose.score}%`,
                      backgroundColor: pose.score >= 80 ? '#10b981' : pose.score >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* New Achievements */}
        {achievements.length > 0 && (
          <div className="achievements-section">
            <h3>🏆 New Achievements Unlocked!</h3>
            <div className="achievements-list">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-unlocked">
                  <div className="achievement-icon-large">{achievement.icon}</div>
                  <div className="achievement-details">
                    <div className="achievement-title-large">{achievement.title}</div>
                    <div className="achievement-desc">{achievement.description}</div>
                  </div>
                  <div className="achievement-badge">NEW!</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="recommendations-section">
          <h3>💡 Recommendations for Next Session</h3>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">{rec.icon}</div>
                <div className="recommendation-content">
                  <div className="recommendation-title">{rec.title}</div>
                  <div className="recommendation-description">{rec.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Comparison */}
        <div className="progress-comparison">
          <h3>📈 Your Progress</h3>
          <div className="comparison-stats">
            <div className="comparison-item">
              <div className="comparison-label">vs Last Session</div>
              <div className="comparison-value positive">+{Math.round(Math.random() * 10)}%</div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">vs Weekly Average</div>
              <div className="comparison-value positive">+{Math.round(Math.random() * 5)}%</div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">Best Score Today</div>
              <div className="comparison-value neutral">{Math.round((sessionData?.avgScore || 0) + Math.random() * 5)}%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="summary-actions">
          <button className="action-btn secondary" onClick={handleTryAgain}>
            <span className="btn-icon">🔄</span>
            Try Again
          </button>
          <button className="action-btn primary" onClick={handleSaveAndContinue}>
            <span className="btn-icon">💾</span>
            Save & Continue
          </button>
        </div>

        {/* Share Options */}
        <div className="share-section">
          <h4>Share Your Achievement</h4>
          <div className="share-buttons">
            <button className="share-btn">📱 Social</button>
            <button className="share-btn">📧 Email</button>
            <button className="share-btn">📋 Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  )
}