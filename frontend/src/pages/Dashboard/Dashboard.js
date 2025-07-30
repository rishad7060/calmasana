import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { generateYogaRecommendations, generateDailyChallenge } from '../../services/geminiService'
import { enhancedPdfService } from '../../services/enhancedPdfService'
import { fallbackReportService } from '../../services/fallbackReportService'
import { achievementService } from '../../services/achievementService'
import { useToast } from '../../contexts/ToastContext'
import UserHeader from '../../components/UserHeader/UserHeader'
import Footer from '../../components/Footer/Footer'
import './Dashboard.css'

export default function Dashboard() {
  const toast = useToast()
  const location = useLocation()
  const [userData, setUserData] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [achievements, setAchievements] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [todaysPlan, setTodaysPlan] = useState(null)
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedData, setHasLoadedData] = useState(false)

  useEffect(() => {
    // Check if coming from a specific route that requires refresh
    const shouldRefresh = location.state?.refresh || !hasLoadedData
    
    if (shouldRefresh) {
      setHasLoadedData(false) // Force reload
      loadUserData()
    }
  }, [location])
  
  const loadUserData = async () => {
    console.log('Loading dashboard data...')
    
    // Check if we already have data cached
    if (hasLoadedData && userData) {
      // Use cached data, don't show loading
      console.log('Using cached dashboard data')
      return
    }
    
    setIsLoading(true)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (user.uid) {
      try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          console.log('User data loaded:', data)
          setUserData(data)
          
          // Load user's sessions and calculate weekly data
          await loadUserSessions(user.uid)
          
          // Generate personalized recommendations if profile exists
          if (data.yogaProfile) {
            const recommendations = await generateYogaRecommendations(data.yogaProfile)
            setTodaysPlan(recommendations)
            
            const challenge = await generateDailyChallenge(data.yogaProfile, data.sessions || [])
            setDailyChallenge(challenge)
          }
          
          // Load achievements
          loadAchievements(data, [])
          
          // Mark that we've loaded data
          setHasLoadedData(true)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // Set empty states instead of mock data
        setWeeklyData([])
        setRecentSessions([])
        setAchievements([])
      }
    }
    
    setIsLoading(false)
  }
  
  const loadUserSessions = async (userId) => {
    console.log('Loading user sessions for:', userId)
    try {
      // Get all sessions for the last 30 days to calculate weekly data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const sessionsRef = collection(db, 'users', userId, 'sessions')
      const allSessionsQuery = query(
        sessionsRef, 
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(allSessionsQuery)
      
      const allSessions = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        allSessions.push({ 
          id: doc.id, 
          ...data,
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })
      })
      
      console.log('Loaded sessions:', allSessions)
      
      // Set recent sessions (last 5)
      setRecentSessions(allSessions.slice(0, 5))
      
      // Calculate weekly data
      const weeklyStats = calculateWeeklyData(allSessions)
      setWeeklyData(weeklyStats)
      
      // Load achievements with session data
      if (userData) {
        loadAchievements(userData, allSessions)
      }
      
    } catch (error) {
      console.error('Error loading sessions:', error)
      setRecentSessions([])
      setWeeklyData([])
    }
  }
  
  const calculateWeeklyData = (sessions) => {
    // Get last 7 days
    const today = new Date()
    const weeklyData = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = dayNames[date.getDay()]
      
      // Filter sessions for this day
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.date)
        return sessionDate.toDateString() === date.toDateString()
      })
      
      // Calculate stats for the day
      const dayStats = {
        day: dayName,
        sessions: daySessions.length,
        avgScore: daySessions.length > 0 ? 
          Math.round(daySessions.reduce((sum, s) => sum + (s.avgScore || 0), 0) / daySessions.length) : 0,
        minutes: Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0))
      }
      
      weeklyData.push(dayStats)
    }
    
    return weeklyData
  }
  
  const loadAchievements = (userData, allSessions = []) => {
    const userStats = userData.stats || {}
    const userSessions = allSessions.length > 0 ? allSessions : recentSessions
    
    const allAchievements = [
      { 
        id: 1, 
        title: 'First Steps', 
        description: 'Complete your first session', 
        icon: '🎯', 
        earned: (userStats.totalSessions || 0) > 0 
      },
      { 
        id: 2, 
        title: 'Week Warrior', 
        description: 'Practice 7 days in a row', 
        icon: '🔥', 
        earned: checkConsecutiveDays(userSessions, 7)
      },
      { 
        id: 3, 
        title: 'Pose Perfect', 
        description: 'Score 95%+ on any pose', 
        icon: '⭐', 
        earned: (userStats.bestScore || 0) >= 95
      },
      { 
        id: 4, 
        title: 'Tree Master', 
        description: 'Hold Tree Pose for 60 seconds', 
        icon: '🌳', 
        earned: checkTreePoseTime(userSessions)
      },
      { 
        id: 5, 
        title: 'Flexibility Focus', 
        description: 'Complete 50 sessions', 
        icon: '🤸', 
        earned: (userStats.totalSessions || 0) >= 50
      },
      { 
        id: 6, 
        title: 'Mindful Master', 
        description: 'Practice for 30 days', 
        icon: '🧘', 
        earned: checkPracticeDays(userSessions, 30)
      }
    ]
    
    // Update based on user data
    if (userData.achievements) {
      userData.achievements.forEach(userAchievement => {
        const achievement = allAchievements.find(a => a.id === userAchievement.id)
        if (achievement) {
          achievement.earned = true
          achievement.date = userAchievement.earnedDate
        }
      })
    }
    
    setAchievements(allAchievements)
  }
  
  const checkConsecutiveDays = (sessions, targetDays) => {
    if (sessions.length === 0) return false
    
    const uniqueDays = [...new Set(sessions.map(s => new Date(s.date).toDateString()))]
    let consecutiveDays = 1
    let maxConsecutive = 1
    
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1])
      const currDate = new Date(uniqueDays[i])
      const diffDays = Math.abs((currDate - prevDate) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        consecutiveDays++
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays)
      } else {
        consecutiveDays = 1
      }
    }
    
    return maxConsecutive >= targetDays
  }
  
  const checkTreePoseTime = (sessions) => {
    return sessions.some(session => {
      if (session.poseResults && Array.isArray(session.poseResults)) {
        return session.poseResults.some(pose => 
          pose.name === 'Tree' && pose.time >= 60
        )
      }
      return session.poses && session.poses.includes('Tree') && (session.totalTimeSeconds || 0) >= 60
    })
  }
  
  const checkPracticeDays = (sessions, targetDays) => {
    const uniqueDays = [...new Set(sessions.map(s => new Date(s.date).toDateString()))]
    return uniqueDays.length >= targetDays
  }

  // Download comprehensive dashboard report
  const handleDownloadDashboardReport = async () => {
    try {
      // Get all user sessions for comprehensive report
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.uid) {
        toast.error('Please log in to download your report.')
        return
      }

      toast.info('Generating your comprehensive progress report...')

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

      // Add a small delay to show the loading message
      setTimeout(async () => {
        try {
          // Try enhanced PDF first
          try {
            enhancedPdfService.downloadDashboardReport(userData?.yogaProfile || {}, allSessions)
            toast.success('📊 Professional progress report downloaded successfully!')
          } catch (pdfError) {
            console.warn('PDF generation failed, using text fallback:', pdfError)
            
            // Fallback to text report
            fallbackReportService.downloadDashboardReport(userData?.yogaProfile || {}, allSessions)
            toast.success('📊 Progress report (text) downloaded successfully!')
          }
        } catch (error) {
          console.error('Error generating dashboard report:', error)
          toast.error('Failed to generate report. Please try again.')
        }
      }, 100)
    } catch (error) {
      console.error('Error generating dashboard report:', error)
      toast.error('Failed to generate report. Please try again.')
    }
  }

  // Calculate real stats from user data and weekly data
  const userStats = userData?.stats || {}
  const totalSessions = weeklyData.length > 0 ? weeklyData.reduce((sum, day) => sum + day.sessions, 0) : 0
  const totalMinutes = weeklyData.length > 0 ? weeklyData.reduce((sum, day) => sum + day.minutes, 0) : 0
  const avgScore = recentSessions.length > 0 ? 
    Math.round(recentSessions.reduce((sum, session) => sum + (session.avgScore || 0), 0) / recentSessions.length) : 0
  const earnedAchievements = achievements.filter(a => a.earned).length

  const maxSessions = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.sessions)) : 1
  const maxScore = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.avgScore)) : 100
  
  // Calculate trends (compare with previous week)
  const lastWeekSessions = userStats.lastWeekSessions || 0
  const lastWeekMinutes = userStats.lastWeekMinutes || 0
  const lastWeekScore = userStats.lastWeekScore || 0
  
  const sessionTrend = totalSessions - lastWeekSessions
  const minutesTrend = totalMinutes - lastWeekMinutes
  const scoreTrend = avgScore - lastWeekScore

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <UserHeader />
        <div className="dashboard-loading">
          <div className="loading-spinner-lg"></div>
          <p>Loading your yoga journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <UserHeader />
      
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1 className="welcome-title">Welcome back, {userData?.name || 'Yogi'}! 🧘‍♀️</h1>
            <p className="welcome-subtitle">Ready to continue your yoga journey? Let's see your progress.</p>
          </div>
          <div className="welcome-actions">
            <Link to="/start" className="start-practice-btn">
              <span className="btn-icon">🚀</span>
              Start Practice
            </Link>
            <button 
              onClick={() => {
                setHasLoadedData(false)
                loadUserData()
              }}
              className="refresh-btn"
              title="Refresh dashboard data"
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.75rem',
                cursor: 'pointer',
                color: '#4a5568',
                fontSize: '1.2rem',
                transition: 'all 0.2s ease'
              }}
            >
              🔄
            </button>
          </div>
        </div>
        
        {/* Today's Plan Card */}
        {todaysPlan && (
          <div className="todays-plan-card">
            <div className="plan-header">
              <h3>Today's Personalized Plan</h3>
              <span className="plan-duration">{todaysPlan.duration} minutes</span>
            </div>
            <p className="plan-intention">{todaysPlan.intention}</p>
            <div className="plan-poses">
              {todaysPlan.poses.map((pose, index) => (
                <div key={index} className="plan-pose">
                  <span className="pose-name">{pose.name}</span>
                  <span className="pose-duration">{pose.duration}s</span>
                </div>
              ))}
            </div>
            <Link to="/start" className="start-plan-btn">
              <span>▶</span>
              Start This Plan
            </Link>
          </div>
        )}
        
        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="daily-challenge-card">
            <div className="challenge-header">
              <h3>Daily Challenge</h3>
              <span className="challenge-badge">New!</span>
            </div>
            <div className="challenge-content">
              <div className="challenge-pose">{dailyChallenge.pose}</div>
              <div className="challenge-duration">Hold for {dailyChallenge.duration} seconds</div>
              <p className="challenge-description">{dailyChallenge.description}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card sessions">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{totalSessions}</div>
              <div className="stat-label">Sessions This Week</div>
              <div className={`stat-trend ${sessionTrend >= 0 ? 'positive' : 'negative'}`}>
                {sessionTrend >= 0 ? '+' : ''}{sessionTrend} from last week
              </div>
            </div>
          </div>

          <div className="stat-card time">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{totalMinutes}min</div>
              <div className="stat-label">Practice Time</div>
              <div className={`stat-trend ${minutesTrend >= 0 ? 'positive' : 'negative'}`}>
                {minutesTrend >= 0 ? '+' : ''}{minutesTrend}min from last week
              </div>
            </div>
          </div>

          <div className="stat-card score">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{avgScore || 0}%</div>
              <div className="stat-label">Average Score</div>
              <div className={`stat-trend ${scoreTrend >= 0 ? 'positive' : 'negative'}`}>
                {scoreTrend >= 0 ? '+' : ''}{scoreTrend}% from last week
              </div>
            </div>
          </div>

          <div className="stat-card achievements">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{earnedAchievements}</div>
              <div className="stat-label">Achievements</div>
              <div className="stat-trend neutral">{achievements.length - earnedAchievements} to unlock</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Weekly Progress Chart */}
          <div className="dashboard-card weekly-progress">
            <div className="card-header">
              <h3 className="card-title">Weekly Progress</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color sessions-color"></div>
                  <span>Sessions</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color score-color"></div>
                  <span>Avg Score</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-bars">
                {weeklyData.map((day, index) => (
                  <div key={index} className="chart-day">
                    <div className="chart-bar-group">
                      <div 
                        className="chart-bar sessions-bar"
                        style={{ height: `${(day.sessions / maxSessions) * 100}%` }}
                        title={`${day.sessions} sessions`}
                      ></div>
                      <div 
                        className="chart-bar score-bar"
                        style={{ height: `${(day.avgScore / maxScore) * 100}%` }}
                        title={`${day.avgScore}% avg score`}
                      ></div>
                    </div>
                    <div className="chart-day-label">{day.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="dashboard-card recent-sessions">
            <div className="card-header">
              <h3 className="card-title">Recent Sessions</h3>
              <Link to="/history" className="view-all-link">View All</Link>
            </div>
            <div className="sessions-list">
              {recentSessions.length > 0 ? (
                recentSessions.slice(0, 4).map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-date">
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="session-details">
                      <div className="session-poses">
                        {Array.isArray(session.poses) ? session.poses.join(', ') : session.poses}
                      </div>
                      <div className="session-stats">
                        <span className="session-duration">{session.duration}min</span>
                        <span className="session-score">{session.avgScore || 0}%</span>
                        <span className={`session-improvement ${session.improvement?.startsWith('+') ? 'positive' : ''}`}>
                          {session.improvement || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No sessions yet</h3>
                  <p>Start your first yoga practice to see your progress here.</p>
                  <Link to="/start" className="start-btn">Start Practice</Link>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="dashboard-card achievements-card">
            <div className="card-header">
              <h3 className="card-title">Achievements</h3>
              <div className="achievement-progress">
                {earnedAchievements}/{achievements.length}
              </div>
            </div>
            <div className="achievements-grid">
              {achievements.slice(0, 6).map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">{achievement.description}</div>
                    {achievement.earned && (
                      <div className="achievement-date">
                        Earned {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {achievement.earned && <div className="achievement-check">✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="actions-grid">
              <Link to="/start" className="action-item">
                <div className="action-icon">🧘</div>
                <div className="action-text">Start Practice</div>
              </Link>
              <Link to="/all-poses" className="action-item">
                <div className="action-icon">🎯</div>
                <div className="action-text">All Poses</div>
              </Link>
              <Link to="/history" className="action-item">
                <div className="action-icon">📈</div>
                <div className="action-text">View History</div>
              </Link>
              <button onClick={handleDownloadDashboardReport} className="action-item action-button">
                <div className="action-icon">📋</div>
                <div className="action-text">Progress Report</div>
              </button>
              <Link to="/settings" className="action-item">
                <div className="action-icon">⚙️</div>
                <div className="action-text">Settings</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}