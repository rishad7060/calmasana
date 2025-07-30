import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { enhancedPdfService } from '../../services/enhancedPdfService'
import { fallbackReportService } from '../../services/fallbackReportService'
import { achievementService } from '../../services/achievementService'
import { notificationService } from '../../services/notificationService'
import { useToast } from '../../contexts/ToastContext'
import './SessionSummary.css'

export default function SessionSummary({ 
  sessionData, 
  isVisible, 
  onClose,
  onSaveSession 
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const [achievements, setAchievements] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [progressComparison, setProgressComparison] = useState({
    vsLastSession: 0,
    vsWeeklyAverage: 0,
    bestScoreToday: 0
  })
  
  console.log('SessionSummary render:', { isVisible, sessionData })

  useEffect(() => {
    if (isVisible && sessionData) {
      generateAchievements()
      generateRecommendations()
      calculateProgressComparison()
      checkForNewAchievements()
      scheduleSessionCompleteNotification()
    }
  }, [isVisible, sessionData])

  // Check for new achievements after session
  const checkForNewAchievements = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.uid) return

      // Get user profile
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      
      // Get all sessions
      const sessionsRef = collection(db, 'users', user.uid, 'sessions')
      const allSessionsQuery = query(sessionsRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(allSessionsQuery)
      
      const allSessions = []
      querySnapshot.forEach((doc) => {
        allSessions.push({
          ...doc.data(),
          date: doc.data().date || new Date().toISOString()
        })
      })

      // Get previously unlocked achievements
      const previouslyUnlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]')
      
      // Check for new achievements
      const newAchievements = achievementService.checkAchievements(
        userProfile, 
        allSessions, 
        previouslyUnlocked
      )

      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements])
        
        // Update localStorage with new achievements
        const updatedUnlocked = [...previouslyUnlocked, ...newAchievements.map(a => a.id)]
        localStorage.setItem('unlockedAchievements', JSON.stringify(updatedUnlocked))
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  // Schedule session completion notification
  const scheduleSessionCompleteNotification = () => {
    notificationService.scheduleSessionCompleteNotification(sessionData)
  }

  // Download session PDF report
  const handleDownloadReport = async () => {
    try {
      toast.info('Generating your session report...')
      
      // Add a small delay to show the loading message
      setTimeout(async () => {
        try {
          const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
          
          // Try enhanced PDF first
          try {
            enhancedPdfService.downloadSessionReport(sessionData, userProfile)
            toast.success('📄 Professional session report downloaded successfully!')
          } catch (pdfError) {
            console.warn('PDF generation failed, using text fallback:', pdfError)
            
            // Fallback to text report
            fallbackReportService.downloadSessionReport(sessionData, userProfile)
            toast.success('📄 Session report (text) downloaded successfully!')
          }
        } catch (error) {
          console.error('Error generating report:', error)
          toast.error('Failed to generate report. Please try again.')
        }
      }, 100)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF report. Please try again.')
    }
  }

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

  const calculateProgressComparison = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!user.uid || !sessionData) {
      return
    }

    try {
      // Get recent sessions to calculate comparisons
      const sessionsRef = collection(db, 'users', user.uid, 'sessions')
      const recentQuery = query(sessionsRef, orderBy('date', 'desc'), limit(10))
      const querySnapshot = await getDocs(recentQuery)
      
      const recentSessions = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        recentSessions.push({
          ...data,
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })
      })

      // Calculate vs last session
      let vsLastSession = 0
      if (recentSessions.length > 1) {
        const lastSession = recentSessions[1] // Second item (first is current session)
        const currentScore = sessionData.avgScore || 0
        const lastScore = lastSession.avgScore || 0
        vsLastSession = currentScore - lastScore
      }

      // Calculate vs weekly average
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const weekSessions = recentSessions.filter(session => 
        new Date(session.date) >= oneWeekAgo
      )
      
      let vsWeeklyAverage = 0
      if (weekSessions.length > 1) {
        const weeklyScores = weekSessions.map(s => s.avgScore || 0).filter(s => s > 0)
        if (weeklyScores.length > 0) {
          const weeklyAvg = weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length
          vsWeeklyAverage = (sessionData.avgScore || 0) - weeklyAvg
        }
      }

      // Calculate best score today
      const today = new Date().toDateString()
      const todaySessions = recentSessions.filter(session => 
        new Date(session.date).toDateString() === today
      )
      
      const bestScoreToday = todaySessions.length > 0 ? 
        Math.max(...todaySessions.map(s => s.avgScore || 0)) : (sessionData.avgScore || 0)

      setProgressComparison({
        vsLastSession: Math.round(vsLastSession),
        vsWeeklyAverage: Math.round(vsWeeklyAverage),
        bestScoreToday: Math.round(bestScoreToday)
      })

    } catch (error) {
      console.error('Error calculating progress comparison:', error)
      // Fallback to basic values
      setProgressComparison({
        vsLastSession: 0,
        vsWeeklyAverage: 0,
        bestScoreToday: Math.round(sessionData.avgScore || 0)
      })
    }
  }

  const handleSaveAndContinue = () => {
    // Data is already saved when stopPose was called
    onClose()
    navigate('/dashboard', { state: { refresh: true } })
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
              <div className={`comparison-value ${progressComparison.vsLastSession > 0 ? 'positive' : progressComparison.vsLastSession < 0 ? 'negative' : 'neutral'}`}>
                {progressComparison.vsLastSession > 0 ? '+' : ''}{progressComparison.vsLastSession}%
              </div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">vs Weekly Average</div>
              <div className={`comparison-value ${progressComparison.vsWeeklyAverage > 0 ? 'positive' : progressComparison.vsWeeklyAverage < 0 ? 'negative' : 'neutral'}`}>
                {progressComparison.vsWeeklyAverage > 0 ? '+' : ''}{progressComparison.vsWeeklyAverage}%
              </div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">Best Score Today</div>
              <div className="comparison-value neutral">{progressComparison.bestScoreToday}%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="summary-actions">
          <button className="action-btn secondary" onClick={handleDownloadReport}>
            <span className="btn-icon">📊</span>
            Professional Report
          </button>
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
        {/* <div className="share-section">
          <h4>Share Your Achievement</h4>
          <div className="share-buttons">
            <button className="share-btn">📱 Social</button>
            <button className="share-btn">📧 Email</button>
            <button className="share-btn">📋 Copy Link</button>
          </div>
        </div> */}
      </div>
    </div>
  )
}