import React, { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import UserHeader from '../../components/UserHeader/UserHeader'
import './History.css'

export default function History() {
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState('all') // all, week, month
  const [sortBy, setSortBy] = useState('date') // date, score, duration
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    averageScore: 0,
    bestScore: 0,
    favoritePose: 'None'
  })

  useEffect(() => {
    loadSessionHistory()
  }, [])

  useEffect(() => {
    filterAndSortSessions()
  }, [sessions, filterPeriod, sortBy])

  const loadSessionHistory = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (user.uid) {
      try {
        // Load sessions from Firebase
        const sessionsRef = collection(db, 'users', user.uid, 'sessions')
        const sessionsQuery = query(sessionsRef, orderBy('date', 'desc'))
        const querySnapshot = await getDocs(sessionsQuery)
        
        const allSessions = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          allSessions.push({
            id: doc.id,
            ...data,
            date: data.date || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          })
        })
        
        setSessions(allSessions)
        calculateStats(allSessions)
      } catch (error) {
        console.error('Error loading session history:', error)
        // Fall back to localStorage if Firebase fails
        const localHistory = JSON.parse(localStorage.getItem('yogaHistory') || '[]')
        setSessions(localHistory)
        calculateStats(localHistory)
      }
    } else {
      // Load from localStorage for non-authenticated users
      const localHistory = JSON.parse(localStorage.getItem('yogaHistory') || '[]')
      setSessions(localHistory)
      calculateStats(localHistory)
    }
    
    setIsLoading(false)
  }

  const calculateStats = (sessionData) => {
    if (sessionData.length === 0) {
      setStats({
        totalSessions: 0,
        totalTime: 0,
        averageScore: 0,
        bestScore: 0,
        favoritePose: 'None'
      })
      return
    }

    const totalSessions = sessionData.length
    const totalTime = sessionData.reduce((sum, session) => {
      // Handle both duration (minutes) and totalTime (seconds) formats
      const timeValue = session.duration || (session.totalTime ? session.totalTime / 60 : 0)
      return sum + timeValue
    }, 0)
    const scores = sessionData.map(session => session.avgScore || 0).filter(score => score > 0)
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    
    // Calculate favorite pose
    const poseCount = {}
    sessionData.forEach(session => {
      if (session.poses && Array.isArray(session.poses)) {
        session.poses.forEach(pose => {
          poseCount[pose] = (poseCount[pose] || 0) + 1
        })
      } else if (session.poseResults && Array.isArray(session.poseResults)) {
        session.poseResults.forEach(pose => {
          poseCount[pose.name] = (poseCount[pose.name] || 0) + 1
        })
      }
    })
    
    const favoritePose = Object.keys(poseCount).length > 0 ? 
      Object.keys(poseCount).reduce((a, b) => poseCount[a] > poseCount[b] ? a : b) : 'None'

    setStats({
      totalSessions,
      totalTime: Math.round(totalTime),
      averageScore,
      bestScore,
      favoritePose
    })
  }

  const filterAndSortSessions = () => {
    let filtered = [...sessions]
    
    // Apply date filter
    if (filterPeriod !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      if (filterPeriod === 'week') {
        filterDate.setDate(now.getDate() - 7)
      } else if (filterPeriod === 'month') {
        filterDate.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(session => new Date(session.date) >= filterDate)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.avgScore || 0) - (a.avgScore || 0)
        case 'duration':
          const aDuration = a.duration || (a.totalTime ? a.totalTime / 60 : 0)
          const bDuration = b.duration || (b.totalTime ? b.totalTime / 60 : 0)
          return bDuration - aDuration
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })
    
    setFilteredSessions(filtered)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'
    if (score >= 70) return '#f59e0b'
    if (score >= 50) return '#f97316'
    return '#ef4444'
  }

  if (isLoading) {
    return (
      <div className="history-container">
        <UserHeader />
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your practice history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <UserHeader />
      
      <div className="history-content">
        <div className="history-header">
          <h1>Practice History</h1>
          <p>Track your yoga journey and progress over time</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTime}min</div>
              <div className="stat-label">Total Practice Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{stats.bestScore}%</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🧘</div>
            <div className="stat-content">
              <div className="stat-number">{stats.favoritePose}</div>
              <div className="stat-label">Favorite Pose</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <div className="filter-group">
            <label>Time Period:</label>
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="score">Score</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="sessions-container">
          {filteredSessions.length > 0 ? (
            <div className="sessions-list">
              {filteredSessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-date">{formatDate(session.date)}</div>
                    <div 
                      className="session-score"
                      style={{ color: getScoreColor(session.avgScore || 0) }}
                    >
                      {session.avgScore || 0}%
                    </div>
                  </div>
                  
                  <div className="session-details">
                    <div className="session-poses">
                      <strong>Poses: </strong>
                      {Array.isArray(session.poses) ? 
                        session.poses.join(', ') : 
                        session.poseResults?.map(p => p.name).join(', ') || 'Unknown'
                      }
                    </div>
                    
                    <div className="session-metrics">
                      <div className="metric">
                        <span className="metric-icon">⏱️</span>
                        <span>
                          {session.duration ? 
                            `${Math.round(session.duration * 100) / 100} minutes` : 
                            session.totalTime ? 
                              `${Math.round(session.totalTime / 60 * 100) / 100} minutes` :
                              '0 minutes'
                          }
                        </span>
                      </div>
                      
                      <div className="metric">
                        <span className="metric-icon">🎯</span>
                        <span>{session.avgScore || 0}% avg score</span>
                      </div>
                      
                      {session.perfectPoses > 0 && (
                        <div className="metric">
                          <span className="metric-icon">⭐</span>
                          <span>{session.perfectPoses} perfect poses</span>
                        </div>
                      )}
                    </div>
                    
                    {session.improvement && (
                      <div className="session-improvement">
                        <span className="improvement-badge">{session.improvement}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-history">
              <div className="empty-icon">📝</div>
              <h3>No sessions found</h3>
              <p>
                {filterPeriod === 'all' ? 
                  "You haven't completed any yoga sessions yet. Start practicing to see your history here!" :
                  `No sessions found for the selected time period. Try changing the filter or practice more yoga!`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}