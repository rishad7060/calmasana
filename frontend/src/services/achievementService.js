/**
 * Achievement Service - Real-time achievement tracking based on user progress
 * Generates achievements from actual user data and AI-recommended plans
 */

import { notificationService } from './notificationService'

export class AchievementService {
  constructor() {
    this.achievements = this.initializeAchievements()
  }

  // Initialize all possible achievements
  initializeAchievements() {
    return {
      // Consistency Achievements
      first_session: {
        id: 'first_session',
        title: 'First Steps',
        description: 'Complete your first yoga session',
        icon: '🌱',
        type: 'milestone',
        condition: (data) => data.totalSessions >= 1,
        reward: 'Unlocked detailed progress tracking'
      },
      
      three_day_streak: {
        id: 'three_day_streak',
        title: 'Building Habits',
        description: 'Practice yoga for 3 consecutive days',
        icon: '🔥',
        type: 'streak',
        condition: (data) => data.currentStreak >= 3,
        reward: 'Unlocked voice guidance feature'
      },
      
      seven_day_streak: {
        id: 'seven_day_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day practice streak',
        icon: '⚡',
        type: 'streak',
        condition: (data) => data.currentStreak >= 7,
        reward: 'Unlocked advanced pose variations'
      },
      
      thirty_day_streak: {
        id: 'thirty_day_streak',
        title: 'Dedication Master',
        description: 'Practice yoga for 30 days straight',
        icon: '💎',
        type: 'streak',
        condition: (data) => data.currentStreak >= 30,
        reward: 'Unlocked custom routine builder'
      },

      // Performance Achievements
      perfect_session: {
        id: 'perfect_session',
        title: 'Pose Perfect',
        description: 'Achieve 95%+ average score in a session',
        icon: '⭐',
        type: 'performance',
        condition: (data) => data.bestSessionScore >= 95,
        reward: 'Unlocked precision analytics'
      },
      
      consistent_performer: {
        id: 'consistent_performer',
        title: 'Steady Progress',
        description: 'Maintain 80%+ average across 5 sessions',
        icon: '📈',
        type: 'performance',
        condition: (data) => {
          const recentSessions = data.recentSessions?.slice(0, 5) || []
          return recentSessions.length >= 5 && 
                 recentSessions.every(s => s.avgScore >= 80)
        },
        reward: 'Unlocked performance insights'
      },

      // Time-based Achievements
      endurance_warrior: {
        id: 'endurance_warrior',
        title: 'Endurance Warrior',
        description: 'Complete a 60+ minute session',
        icon: '⏰',
        type: 'time',
        condition: (data) => data.longestSession >= 3600, // 60 minutes in seconds
        reward: 'Unlocked extended practice plans'
      },
      
      century_hours: {
        id: 'century_hours',
        title: 'Century Club',
        description: 'Practice for 100+ total hours',
        icon: '💯',
        type: 'time',
        condition: (data) => data.totalPracticeTime >= 360000, // 100 hours in seconds
        reward: 'Unlocked instructor mode'
      },

      // Pose-specific Achievements
      balance_master: {
        id: 'balance_master',
        title: 'Balance Master',
        description: 'Perfect Tree pose 10 times',
        icon: '🌳',
        type: 'pose',
        condition: (data) => (data.posePerfections?.Tree || 0) >= 10,
        reward: 'Unlocked advanced balance poses'
      },
      
      strength_builder: {
        id: 'strength_builder',
        title: 'Strength Builder',
        description: 'Perfect Plank pose 15 times',
        icon: '💪',
        type: 'pose',
        condition: (data) => (data.posePerfections?.Plank || 0) >= 15,
        reward: 'Unlocked strength-focused routines'
      },
      
      flexibility_guru: {
        id: 'flexibility_guru',
        title: 'Flexibility Guru',
        description: 'Perfect Bridge pose 12 times',
        icon: '🌉',
        type: 'pose',
        condition: (data) => (data.posePerfections?.Bridge || 0) >= 12,
        reward: 'Unlocked flexibility enhancement guide'
      },

      // AI Plan Achievements
      plan_completer: {
        id: 'plan_completer',
        title: 'Plan Completer',
        description: 'Complete your first AI-generated plan',
        icon: '🤖',
        type: 'ai_plan',
        condition: (data) => data.completedAIPlans >= 1,
        reward: 'Unlocked personalized plan variations'
      },
      
      ai_student: {
        id: 'ai_student',
        title: 'AI Student',
        description: 'Follow 5 different AI recommendations',
        icon: '🎓',
        type: 'ai_plan',
        condition: (data) => data.completedAIPlans >= 5,
        reward: 'Unlocked AI progress analysis'
      },

      // Goal-based Achievements (Dynamic based on user goals)
      goal_achiever: {
        id: 'goal_achiever',
        title: 'Goal Achiever',
        description: 'Make significant progress towards your primary goal',
        icon: '🎯',
        type: 'goal',
        condition: (data) => this.checkGoalProgress(data),
        reward: 'Unlocked goal-specific insights'
      },

      // Session Quality
      mindful_practitioner: {
        id: 'mindful_practitioner',
        title: 'Mindful Practitioner',
        description: 'Complete 20 sessions with 70%+ mindfulness score',
        icon: '🧘',
        type: 'quality',
        condition: (data) => {
          const mindfulSessions = data.allSessions?.filter(s => 
            s.avgScore >= 70 && s.totalTime >= 600 // 10+ minutes
          ) || []
          return mindfulSessions.length >= 20
        },
        reward: 'Unlocked meditation integration'
      }
    }
  }

  // Check goal progress based on user's stated goals
  checkGoalProgress(data) {
    const userGoals = data.userProfile?.experience?.goals || []
    const recentSessions = data.recentSessions?.slice(0, 10) || []
    
    if (recentSessions.length < 5) return false

    // Flexibility goal - check progress in flexibility poses
    if (userGoals.includes('Flexibility')) {
      const flexibilityPoses = ['Bridge', 'Cobra', 'Cat-Cow', 'Child']
      const flexScores = recentSessions
        .flatMap(s => s.poseResults?.filter(p => flexibilityPoses.includes(p.name)) || [])
        .map(p => p.score)
      
      if (flexScores.length >= 5) {
        const avgFlexScore = flexScores.reduce((a, b) => a + b, 0) / flexScores.length
        return avgFlexScore >= 75
      }
    }

    // Strength goal - check progress in strength poses
    if (userGoals.includes('Strength')) {
      const strengthPoses = ['Plank', 'Warrior', 'Chair']
      const strengthScores = recentSessions
        .flatMap(s => s.poseResults?.filter(p => strengthPoses.includes(p.name)) || [])
        .map(p => p.score)
      
      if (strengthScores.length >= 5) {
        const avgStrengthScore = strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length
        return avgStrengthScore >= 75
      }
    }

    // Balance goal - check balance poses
    if (userGoals.includes('Balance')) {
      const balancePoses = ['Tree', 'Warrior']
      const balanceScores = recentSessions
        .flatMap(s => s.poseResults?.filter(p => balancePoses.includes(p.name)) || [])
        .map(p => p.score)
      
      if (balanceScores.length >= 5) {
        const avgBalanceScore = balanceScores.reduce((a, b) => a + b, 0) / balanceScores.length
        return avgBalanceScore >= 75
      }
    }

    // General improvement - recent sessions better than older ones
    if (recentSessions.length >= 10) {
      const recent5 = recentSessions.slice(0, 5)
      const older5 = recentSessions.slice(5, 10)
      
      const recentAvg = recent5.reduce((sum, s) => sum + s.avgScore, 0) / 5
      const olderAvg = older5.reduce((sum, s) => sum + s.avgScore, 0) / 5
      
      return recentAvg > olderAvg + 10 // 10+ point improvement
    }

    return false
  }

  // Calculate user data from sessions and profile
  calculateUserData(userProfile, allSessions) {
    if (!allSessions || allSessions.length === 0) {
      return {
        totalSessions: 0,
        currentStreak: 0,
        totalPracticeTime: 0,
        bestSessionScore: 0,
        longestSession: 0,
        posePerfections: {},
        completedAIPlans: 0,
        recentSessions: [],
        allSessions: [],
        userProfile
      }
    }

    // Sort sessions by date (newest first)
    const sortedSessions = allSessions.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Calculate streak
    const currentStreak = this.calculateStreak(sortedSessions)
    
    // Calculate pose perfections (95%+ scores)
    const posePerfections = {}
    sortedSessions.forEach(session => {
      session.poseResults?.forEach(pose => {
        if (pose.score >= 95) {
          posePerfections[pose.name] = (posePerfections[pose.name] || 0) + 1
        }
      })
    })

    // Count AI plan completions (sessions that followed AI recommendations)
    const completedAIPlans = sortedSessions.filter(s => s.isAIGenerated || s.planId).length

    return {
      totalSessions: sortedSessions.length,
      currentStreak,
      totalPracticeTime: sortedSessions.reduce((sum, s) => sum + (s.totalTime || 0), 0),
      bestSessionScore: Math.max(...sortedSessions.map(s => s.avgScore || 0)),
      longestSession: Math.max(...sortedSessions.map(s => s.totalTime || 0)),
      posePerfections,
      completedAIPlans,
      recentSessions: sortedSessions.slice(0, 20),
      allSessions: sortedSessions,
      userProfile
    }
  }

  // Calculate practice streak
  calculateStreak(sortedSessions) {
    if (sortedSessions.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Group sessions by date
    const sessionsByDate = {}
    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)
      const dateKey = sessionDate.toISOString().split('T')[0]
      sessionsByDate[dateKey] = true
    })

    // Check consecutive days backwards from today
    let currentDate = new Date(today)
    
    // If user practiced today, start counting from today
    // Otherwise start from yesterday
    const todayKey = today.toISOString().split('T')[0]
    if (!sessionsByDate[todayKey]) {
      currentDate.setDate(currentDate.getDate() - 1)
    }

    while (true) {
      const dateKey = currentDate.toISOString().split('T')[0]
      if (sessionsByDate[dateKey]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // Check for new achievements after a session
  checkAchievements(userProfile, allSessions, previouslyUnlocked = []) {
    const userData = this.calculateUserData(userProfile, allSessions)
    const newAchievements = []

    Object.values(this.achievements).forEach(achievement => {
      // Skip if already unlocked
      if (previouslyUnlocked.includes(achievement.id)) return

      // Check if condition is met
      if (achievement.condition(userData)) {
        newAchievements.push(achievement)
        
        // Show notification
        notificationService.scheduleAchievementNotification({
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          reward: achievement.reward
        })
      }
    })

    return newAchievements
  }

  // Get user's achievement progress
  getAchievementProgress(userProfile, allSessions) {
    const userData = this.calculateUserData(userProfile, allSessions)
    const progress = {}

    Object.values(this.achievements).forEach(achievement => {
      const isUnlocked = achievement.condition(userData)
      
      progress[achievement.id] = {
        ...achievement,
        unlocked: isUnlocked,
        progress: this.calculateAchievementProgress(achievement, userData)
      }
    })

    return progress
  }

  // Calculate progress percentage for achievements
  calculateAchievementProgress(achievement, userData) {
    switch (achievement.id) {
      case 'three_day_streak':
        return Math.min(100, (userData.currentStreak / 3) * 100)
      case 'seven_day_streak':
        return Math.min(100, (userData.currentStreak / 7) * 100)
      case 'thirty_day_streak':
        return Math.min(100, (userData.currentStreak / 30) * 100)
      case 'perfect_session':
        return Math.min(100, (userData.bestSessionScore / 95) * 100)
      case 'endurance_warrior':
        return Math.min(100, (userData.longestSession / 3600) * 100)
      case 'century_hours':
        return Math.min(100, (userData.totalPracticeTime / 360000) * 100)
      case 'balance_master':
        return Math.min(100, ((userData.posePerfections?.Tree || 0) / 10) * 100)
      case 'strength_builder':
        return Math.min(100, ((userData.posePerfections?.Plank || 0) / 15) * 100)
      case 'flexibility_guru':
        return Math.min(100, ((userData.posePerfections?.Bridge || 0) / 12) * 100)
      case 'plan_completer':
        return Math.min(100, (userData.completedAIPlans / 1) * 100)
      case 'ai_student':
        return Math.min(100, (userData.completedAIPlans / 5) * 100)
      case 'mindful_practitioner':
        const mindfulSessions = userData.allSessions?.filter(s => 
          s.avgScore >= 70 && s.totalTime >= 600
        ).length || 0
        return Math.min(100, (mindfulSessions / 20) * 100)
      default:
        return achievement.condition(userData) ? 100 : 0
    }
  }

  // Get achievements by category
  getAchievementsByCategory() {
    const categories = {
      milestone: [],
      streak: [],
      performance: [],
      time: [],
      pose: [],
      ai_plan: [],
      goal: [],
      quality: []
    }

    Object.values(this.achievements).forEach(achievement => {
      if (categories[achievement.type]) {
        categories[achievement.type].push(achievement)
      }
    })

    return categories
  }
}

// Global achievement service instance
export const achievementService = new AchievementService()