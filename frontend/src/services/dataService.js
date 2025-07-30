/**
 * Enhanced Data Service for Firebase operations
 * Handles accurate data storage and retrieval
 */

import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

export class DataService {
  // Save session with comprehensive data
  static async saveSession(userId, sessionData) {
    try {
      console.log('Saving session data:', sessionData)
      
      // Enhance session data with server timestamp
      const enhancedSessionData = {
        ...sessionData,
        userId,
        serverTimestamp: serverTimestamp(),
        version: '2.0', // Track data structure version
        
        // Ensure all time values are integers (seconds)
        totalTime: Math.round(sessionData.totalTime),
        totalPoseTime: Math.round(sessionData.totalPoseTime || 0),
        totalCorrectTime: Math.round(sessionData.totalCorrectTime || 0),
        
        // Ensure scores are valid
        avgScore: Math.max(0, Math.min(100, sessionData.avgScore || 0)),
        bestScore: Math.max(0, Math.min(100, sessionData.bestScore || 0)),
        accuracyRate: Math.max(0, Math.min(100, sessionData.accuracyRate || 0)),
        
        // Add derived metrics
        efficiency: sessionData.totalCorrectTime > 0 ? 
          Math.round((sessionData.totalCorrectTime / sessionData.totalTime) * 100) : 0,
        posesCompleted: sessionData.poseResults?.length || 0,
        
        // Duration in minutes for compatibility
        duration: Math.round((sessionData.totalTime || 0) / 60 * 100) / 100
      }

      // Save to sessions subcollection
      const sessionRef = await addDoc(
        collection(db, 'users', userId, 'sessions'), 
        enhancedSessionData
      )

      console.log('Session saved with ID:', sessionRef.id)

      // Update user statistics
      await this.updateUserStats(userId, enhancedSessionData)

      // Check and award achievements  
      await this.checkAchievements(userId, enhancedSessionData)

      return sessionRef.id
    } catch (error) {
      console.error('Error saving session:', error)
      throw error
    }
  }

  // Update user statistics with atomic operations
  static async updateUserStats(userId, sessionData) {
    try {
      const userRef = doc(db, 'users', userId)
      
      // Use atomic updates to prevent race conditions
      const updates = {
        'stats.totalSessions': increment(1),
        'stats.totalPracticeTime': increment(sessionData.duration),
        'stats.totalCorrectTime': increment(Math.round(sessionData.totalCorrectTime / 60 * 100) / 100),
        'stats.lastPracticeDate': new Date().toISOString(),
        'stats.lastSessionScore': sessionData.avgScore,
        'stats.updatedAt': serverTimestamp()
      }

      // Get current stats to calculate averages and bests
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const currentStats = userDoc.data().stats || {}
        
        // Calculate running average score
        const totalSessions = (currentStats.totalSessions || 0) + 1
        const currentAvg = currentStats.avgScore || 0
        const newAvg = Math.round(((currentAvg * (totalSessions - 1)) + sessionData.avgScore) / totalSessions)
        
        updates['stats.avgScore'] = newAvg
        updates['stats.bestScore'] = Math.max(currentStats.bestScore || 0, sessionData.bestScore)
        updates['stats.bestAccuracy'] = Math.max(currentStats.bestAccuracy || 0, sessionData.accuracyRate)
        
        // Track pose-specific stats
        if (sessionData.poseResults && sessionData.poseResults.length > 0) {
          sessionData.poseResults.forEach(pose => {
            const poseKey = `poseStats.${pose.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            updates[`${poseKey}.totalTime`] = increment(pose.totalTime / 60)
            updates[`${poseKey}.attempts`] = increment(pose.attempts || 1)
            updates[`${poseKey}.bestScore`] = Math.max(
              currentStats.poseStats?.[pose.name.toLowerCase().replace(/[^a-z0-9]/g, '')]?.bestScore || 0,
              pose.accuracy
            )
          })
        }
      }

      await updateDoc(userRef, updates)
      console.log('User stats updated:', updates)
    } catch (error) {
      console.error('Error updating user stats:', error)
    }
  }

  // Check and award achievements
  static async checkAchievements(userId, sessionData) {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) return

      const userData = userDoc.data()
      const currentStats = userData.stats || {}
      const currentAchievements = userData.achievements || []
      const newAchievements = []

      // Achievement definitions
      const achievements = [
        {
          id: 'first_session',
          name: 'First Steps',
          description: 'Complete your first yoga session',
          condition: () => currentStats.totalSessions === 1
        },
        {
          id: 'perfect_score',
          name: 'Perfect Form',
          description: 'Achieve 95% or higher accuracy',
          condition: () => sessionData.avgScore >= 95
        },
        {
          id: 'dedicated_practitioner',
          name: 'Dedicated Practitioner', 
          description: 'Complete 10 sessions',
          condition: () => currentStats.totalSessions === 10
        },
        {
          id: 'yoga_master',
          name: 'Yoga Master',
          description: 'Complete 50 sessions',
          condition: () => currentStats.totalSessions === 50
        },
        {
          id: 'time_keeper',
          name: 'Time Keeper',
          description: 'Practice for 60 minutes total',
          condition: () => currentStats.totalPracticeTime >= 60
        },
        {
          id: 'consistency_champion',
          name: 'Consistency Champion',
          description: 'Practice 7 days in a row',
          condition: () => this.checkConsistentPractice(userId, 7)
        }
      ]

      // Check each achievement
      for (const achievement of achievements) {
        const alreadyEarned = currentAchievements.some(a => a.id === achievement.id)
        
        if (!alreadyEarned && achievement.condition()) {
          newAchievements.push({
            ...achievement,
            earnedDate: new Date().toISOString(),
            sessionId: sessionData.id || 'unknown'
          })
        }
      }

      // Save new achievements
      if (newAchievements.length > 0) {
        await updateDoc(userRef, {
          achievements: [...currentAchievements, ...newAchievements],
          'stats.totalAchievements': currentAchievements.length + newAchievements.length
        })

        console.log('New achievements earned:', newAchievements)
      }

      return newAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      return []
    }
  }

  // Get user sessions with enhanced filtering
  static async getUserSessions(userId, options = {}) {
    try {
      const {
        limitCount = 50,
        orderByField = 'date',
        orderDirection = 'desc',
        startDate = null,
        endDate = null
      } = options

      let q = query(
        collection(db, 'users', userId, 'sessions'),
        orderBy(orderByField, orderDirection)
      )

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      if (startDate) {
        q = query(q, where('date', '>=', startDate))
      }

      if (endDate) {
        q = query(q, where('date', '<=', endDate))
      }

      const querySnapshot = await getDocs(q)
      const sessions = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        sessions.push({
          id: doc.id,
          ...data,
          // Ensure consistent date format
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })
      })

      console.log(`Retrieved ${sessions.length} sessions for user ${userId}`)
      return sessions
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return []
    }
  }

  // Get comprehensive user statistics
  static async getUserStats(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (!userDoc.exists()) {
        return this.getDefaultStats()
      }

      const userData = userDoc.data()
      const stats = userData.stats || {}

      // Get recent sessions for additional metrics
      const recentSessions = await this.getUserSessions(userId, { limitCount: 30 })
      
      // Calculate weekly data
      const weeklyData = this.calculateWeeklyData(recentSessions)
      
      // Calculate streaks
      const currentStreak = this.calculateCurrentStreak(recentSessions)
      const longestStreak = this.calculateLongestStreak(recentSessions)

      return {
        ...stats,
        weeklyData,
        currentStreak,
        longestStreak,
        recentSessions: recentSessions.slice(0, 10), // Last 10 sessions
        achievements: userData.achievements || [],
        totalAchievements: userData.achievements?.length || 0
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return this.getDefaultStats()
    }
  }

  // Calculate weekly practice data
  static calculateWeeklyData(sessions) {
    const weeklyData = Array(7).fill(0)
    const today = new Date()
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date)
      const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff >= 0 && daysDiff < 7) {
        const dayIndex = (today.getDay() - daysDiff + 7) % 7
        weeklyData[dayIndex] += session.duration || 0
      }
    })
    
    return weeklyData
  }

  // Calculate current practice streak
  static calculateCurrentStreak(sessions) {
    if (sessions.length === 0) return 0
    
    const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let currentDate = new Date(today)
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break
      }
    }
    
    return streak
  }

  // Calculate longest practice streak
  static calculateLongestStreak(sessions) {
    if (sessions.length === 0) return 0
    
    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date))
    const uniqueDates = [...new Set(sortedSessions.map(s => 
      new Date(s.date).toDateString()
    ))]
    
    let maxStreak = 0
    let currentStreak = 1
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1])
      const currDate = new Date(uniqueDates[i])
      const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24)
      
      if (daysDiff === 1) {
        currentStreak++
      } else {
        maxStreak = Math.max(maxStreak, currentStreak)
        currentStreak = 1
      }
    }
    
    return Math.max(maxStreak, currentStreak)
  }

  // Default stats structure
  static getDefaultStats() {
    return {
      totalSessions: 0,
      totalPracticeTime: 0,
      totalCorrectTime: 0,
      avgScore: 0,
      bestScore: 0,
      bestAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyData: Array(7).fill(0),
      recentSessions: [],
      achievements: [],
      totalAchievements: 0,
      poseStats: {}
    }
  }
}