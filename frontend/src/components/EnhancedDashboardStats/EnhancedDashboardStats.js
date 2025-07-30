/**
 * Enhanced Dashboard Statistics Component
 * Shows accurate and comprehensive yoga practice data
 */

import React, { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import { formatTime, formatDate, formatDateTime } from '../../utils/sessionTracking'
import './EnhancedDashboardStats.css'

export const EnhancedDashboardStats = () => {
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, all

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (user.uid) {
      try {
        // Load comprehensive stats
        const userStats = await DataService.getUserStats(user.uid)
        setStats(userStats)

        // Load sessions based on time range
        const sessionOptions = getSessionOptions(timeRange)
        const userSessions = await DataService.getUserSessions(user.uid, sessionOptions)
        setSessions(userSessions)

        console.log('Dashboard data loaded:', { userStats, userSessions })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    setLoading(false)
  }

  const getSessionOptions = (range) => {
    const now = new Date()
    let startDate = null

    switch (range) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        return { startDate: startDate.toISOString(), limitCount: 50 }
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        return { startDate: startDate.toISOString(), limitCount: 100 }
      default:
        return { limitCount: 200 }
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading your practice data...</div>
  }

  if (!stats) {
    return <div className="dashboard-error">Unable to load practice data</div>
  }

  return (
    <div className="enhanced-dashboard-stats">
      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button 
          className={timeRange === 'week' ? 'active' : ''}
          onClick={() => setTimeRange('week')}
        >
          This Week
        </button>
        <button 
          className={timeRange === 'month' ? 'active' : ''}
          onClick={() => setTimeRange('month')}
        >
          This Month
        </button>
        <button 
          className={timeRange === 'all' ? 'active' : ''}
          onClick={() => setTimeRange('all')}
        >
          All Time
        </button>
      </div>

      {/* Key Statistics */}
      <div className="stats-overview">
        <StatCard 
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle="practice sessions"
          icon="🧘‍♀️"
        />
        <StatCard 
          title="Practice Time"
          value={formatTime(Math.round(stats.totalPracticeTime * 60))}
          subtitle="total practice"
          icon="⏱️"
        />
        <StatCard 
          title="Average Score"
          value={`${stats.avgScore}%`}
          subtitle="accuracy"
          icon="🎯"
        />
        <StatCard 
          title="Current Streak"
          value={stats.currentStreak}
          subtitle="days"
          icon="🔥"
        />
      </div>

      {/* Weekly Activity Chart */}
      <div className="weekly-activity">
        <h3>Weekly Activity</h3>
        <WeeklyChart data={stats.weeklyData} />
      </div>

      {/* Performance Trends */}
      <div className="performance-trends">
        <h3>Performance Trends</h3>
        <PerformanceChart sessions={sessions} />
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h3>Recent Sessions</h3>
        <SessionsList sessions={stats.recentSessions} />
      </div>

      {/* Pose Statistics */}
      <div className="pose-statistics">
        <h3>Pose Performance</h3>
        <PoseStats poseStats={stats.poseStats} />
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h3>Achievements ({stats.totalAchievements})</h3>
        <AchievementsList achievements={stats.achievements} />
      </div>
    </div>
  )
}

// Individual stat card component
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  </div>
)

// Weekly activity chart
const WeeklyChart = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const maxValue = Math.max(...data, 1)

  return (
    <div className="weekly-chart">
      {data.map((value, index) => (
        <div key={index} className="chart-bar">
          <div 
            className="bar-fill"
            style={{ 
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: value > 0 ? '#4ade80' : '#e5e7eb'
            }}
          />
          <span className="bar-label">{days[index]}</span>
          <span className="bar-value">{Math.round(value)}m</span>
        </div>
      ))}
    </div>
  )
}

// Performance trend chart
const PerformanceChart = ({ sessions }) => {
  const recentSessions = sessions.slice(0, 10).reverse()
  const maxScore = Math.max(...recentSessions.map(s => s.avgScore || 0), 100)

  return (
    <div className="performance-chart">
      {recentSessions.map((session, index) => (
        <div key={index} className="performance-point">
          <div 
            className="performance-bar"
            style={{ 
              height: `${(session.avgScore / maxScore) * 100}%`,
              backgroundColor: session.avgScore >= 80 ? '#10b981' : 
                             session.avgScore >= 60 ? '#f59e0b' : '#ef4444'
            }}
            title={`${formatDate(session.date)}: ${session.avgScore}%`}
          />
          <span className="chart-date">{formatDate(session.date).split(' ')[1]}</span>
        </div>
      ))}
    </div>
  )
}

// Recent sessions list
const SessionsList = ({ sessions }) => (
  <div className="sessions-list">
    {sessions.slice(0, 5).map((session, index) => (
      <div key={index} className="session-item">
        <div className="session-info">
          <div className="session-date">{formatDateTime(session.date)}</div>
          <div className="session-poses">
            {session.poses?.join(', ') || session.poseResults?.map(p => p.name).join(', ') || 'Unknown poses'}
          </div>
        </div>
        <div className="session-stats">
          <span className="session-duration">{formatTime(session.totalTime || Math.round(session.duration * 60))}</span>
          <span className="session-score">{session.avgScore}%</span>
        </div>
      </div>
    ))}
    {sessions.length === 0 && (
      <div className="no-sessions">No recent sessions found</div>
    )}
  </div>
)

// Pose statistics component
const PoseStats = ({ poseStats }) => {
  const poses = Object.entries(poseStats || {})
    .sort(([,a], [,b]) => (b.totalTime || 0) - (a.totalTime || 0))
    .slice(0, 8)

  return (
    <div className="pose-stats-grid">
      {poses.map(([poseName, stats]) => (
        <div key={poseName} className="pose-stat-card">
          <h4 className="pose-name">{poseName.charAt(0).toUpperCase() + poseName.slice(1)}</h4>
          <div className="pose-stat-item">
            <span>Time: {formatTime(Math.round((stats.totalTime || 0) * 60))}</span>
          </div>
          <div className="pose-stat-item">
            <span>Best: {stats.bestScore || 0}%</span>
          </div>
          <div className="pose-stat-item">
            <span>Attempts: {stats.attempts || 0}</span>
          </div>
        </div>
      ))}
      {poses.length === 0 && (
        <div className="no-pose-stats">No pose statistics available</div>
      )}
    </div>
  )
}

// Achievements list
const AchievementsList = ({ achievements }) => (
  <div className="achievements-grid">
    {achievements.slice(0, 6).map((achievement, index) => (
      <div key={index} className="achievement-card">
        <div className="achievement-icon">🏆</div>
        <div className="achievement-info">
          <h4>{achievement.name}</h4>
          <p>{achievement.description}</p>
          <span className="achievement-date">
            Earned: {formatDate(achievement.earnedDate)}
          </span>
        </div>
      </div>
    ))}
    {achievements.length === 0 && (
      <div className="no-achievements">Complete your first session to earn achievements!</div>
    )}
  </div>
)

export default EnhancedDashboardStats