/**
 * Notification Service for Practice Reminders
 * Handles scheduling and sending practice reminders based on user preferences
 */

export class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
  }

  // Request notification permissions
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported in this browser')
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  // Schedule daily practice reminder
  async scheduleDailyReminder(userPreferences) {
    if (!await this.requestPermission()) {
      console.warn('Notification permission denied')
      return false
    }

    const { practiceTime, timezone, reminderEnabled } = userPreferences

    if (!reminderEnabled) {
      this.clearAllReminders()
      return false
    }

    // Calculate next reminder time
    const now = new Date()
    const [hours, minutes] = practiceTime.split(':').map(Number)
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    // Store reminder in localStorage for persistence
    localStorage.setItem('practiceReminder', JSON.stringify({
      time: reminderTime.toISOString(),
      preferences: userPreferences,
      enabled: true
    }))

    // Schedule the reminder
    this.scheduleNotification({
      title: '🧘 Time for Your Yoga Practice',
      body: 'Your personalized yoga session is ready. Let\'s maintain your streak!',
      icon: '/yoga-icon.png',
      badge: '/yoga-badge.png',
      tag: 'daily-practice',
      timestamp: reminderTime.getTime(),
      actions: [
        { action: 'practice', title: 'Start Practice' },
        { action: 'snooze', title: 'Remind in 15 mins' }
      ]
    }, reminderTime)

    return true
  }

  // Schedule achievement notification
  scheduleAchievementNotification(achievement) {
    if (this.permission !== 'granted') return

    new Notification(`🏆 Achievement Unlocked!`, {
      body: achievement.description,
      icon: '/achievement-icon.png',
      badge: '/yoga-badge.png',
      tag: 'achievement',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Achievement' }
      ]
    })
  }

  // Schedule streak milestone notification
  scheduleStreakNotification(streak) {
    if (this.permission !== 'granted') return

    new Notification(`🔥 ${streak} Day Streak!`, {
      body: `Amazing! You've practiced yoga for ${streak} days in a row. Keep it up!`,
      icon: '/streak-icon.png',
      badge: '/yoga-badge.png',
      tag: 'streak'
    })
  }

  // Schedule session completion notification
  scheduleSessionCompleteNotification(sessionData) {
    if (this.permission !== 'granted') return

    const score = sessionData.avgScore || 0
    let message = 'Session completed!'
    
    if (score >= 90) {
      message = `Excellent session! ${score}% average score. You're on fire! 🔥`
    } else if (score >= 70) {
      message = `Great practice! ${score}% average score. Well done! ⭐`
    } else if (score >= 50) {
      message = `Good effort! ${score}% average score. Keep improving! 💪`
    } else {
      message = 'Every practice counts! Keep going and you\'ll see improvement.'
    }

    new Notification('🧘 Yoga Session Complete', {
      body: message,
      icon: '/complete-icon.png',
      badge: '/yoga-badge.png',
      tag: 'session-complete'
    })
  }

  // Schedule notification at specific time
  scheduleNotification(options, targetTime) {
    const now = new Date()
    const delay = targetTime.getTime() - now.getTime()

    if (delay <= 0) {
      // Show immediately if time has passed
      this.showNotification(options)
      return
    }

    setTimeout(() => {
      this.showNotification(options)
    }, delay)
  }

  // Show notification immediately
  showNotification(options) {
    if (this.permission !== 'granted') return

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      actions: options.actions || []
    })

    // Auto-close after 10 seconds if not requiring interaction
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000)
    }

    // Handle notification clicks
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Navigate to appropriate page based on tag
      if (options.tag === 'daily-practice') {
        window.location.href = '/dashboard'
      } else if (options.tag === 'achievement') {
        window.location.href = '/history'
      }
    }

    return notification
  }

  // Clear all scheduled reminders
  clearAllReminders() {
    localStorage.removeItem('practiceReminder')
  }

  // Check and restore reminders on app load
  restoreReminders() {
    const savedReminder = localStorage.getItem('practiceReminder')
    if (!savedReminder) return

    try {
      const reminder = JSON.parse(savedReminder)
      const reminderTime = new Date(reminder.time)
      const now = new Date()

      if (reminder.enabled && reminderTime > now) {
        // Restore the scheduled reminder
        this.scheduleNotification({
          title: '🧘 Time for Your Yoga Practice',
          body: 'Your personalized yoga session is ready. Let\'s maintain your streak!',
          icon: '/yoga-icon.png',
          badge: '/yoga-badge.png',
          tag: 'daily-practice'
        }, reminderTime)
      } else if (reminder.enabled) {
        // Schedule next day's reminder
        this.scheduleDailyReminder(reminder.preferences)
      }
    } catch (error) {
      console.error('Error restoring reminders:', error)
      localStorage.removeItem('practiceReminder')
    }
  }

  // Get reminder status
  getReminderStatus() {
    const savedReminder = localStorage.getItem('practiceReminder')
    if (!savedReminder) return { enabled: false }

    try {
      const reminder = JSON.parse(savedReminder)
      return {
        enabled: reminder.enabled,
        nextReminder: new Date(reminder.time),
        preferences: reminder.preferences
      }
    } catch (error) {
      return { enabled: false }
    }
  }
}

// Global notification service instance
export const notificationService = new NotificationService()

// Practice time suggestions based on user routine
export const getPracticeTimeSuggestions = (routine) => {
  switch (routine) {
    case 'morning':
      return [
        { label: '6:00 AM - Early Bird', value: '06:00' },
        { label: '7:00 AM - Before Work', value: '07:00' },
        { label: '8:00 AM - Morning Energy', value: '08:00' },
        { label: '9:00 AM - Mid Morning', value: '09:00' }
      ]
    case 'evening':
      return [
        { label: '6:00 PM - After Work', value: '18:00' },
        { label: '7:00 PM - Dinner Break', value: '19:00' },
        { label: '8:00 PM - Wind Down', value: '20:00' },
        { label: '9:00 PM - Before Bed', value: '21:00' }
      ]
    case 'flexible':
    default:
      return [
        { label: '7:00 AM - Morning', value: '07:00' },
        { label: '12:00 PM - Lunch Break', value: '12:00' },
        { label: '6:00 PM - Evening', value: '18:00' },
        { label: '8:00 PM - Night', value: '20:00' }
      ]
  }
}

// Initialize notifications on app startup
export const initializeNotifications = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      notificationService.restoreReminders()
    })
  } else {
    notificationService.restoreReminders()
  }
}