import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import UserHeader from '../../components/UserHeader/UserHeader'
import { useToast } from '../../contexts/ToastContext'
import { useTheme } from '../../contexts/ThemeContext'
import { notificationService, getPracticeTimeSuggestions } from '../../services/notificationService'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const toast = useToast()
  const { theme, setTheme } = useTheme()
  const [userData, setUserData] = useState(null)
  const [settings, setSettings] = useState({
    voiceGuidance: false,
    notifications: true,
    practiceReminders: true,
    practiceTime: '07:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    theme: theme || 'light',
    difficulty: 'beginner'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadUserSettings()
  }, [navigate])

  const loadUserSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (!user.uid || !user.isAuthenticated) {
        console.error('No authenticated user found')
        navigate('/auth')
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          
          // Load user settings if they exist
          if (data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings }))
          }
        } else {
          // If document doesn't exist, use data from localStorage
          setUserData({
            name: user.name || 'User',
            email: user.email || '',
            createdAt: new Date().toISOString(),
            yogaProfile: { 
              experience: { 
                level: 'Beginner',
                frequency: 'Not set',
                goals: []
              }
            }
          })
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
        // Fallback to localStorage data
        setUserData({
          name: user.name || 'User',
          email: user.email || '',
          createdAt: new Date().toISOString(),
          yogaProfile: { 
            experience: { 
              level: 'Beginner',
              frequency: 'Not set',
              goals: []
            }
          }
        })
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/auth')
    }
    
    setIsLoading(false)
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Handle theme change immediately
    if (key === 'theme') {
      setTheme(value)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (!user.uid || !user.isAuthenticated) {
        toast.error('Please log in to save settings')
        navigate('/auth')
        return
      }

      try {
        // Check if document exists first
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        if (userDoc.exists()) {
          // Update existing document
          await updateDoc(doc(db, 'users', user.uid), {
            settings: settings,
            updatedAt: new Date().toISOString()
          })
        } else {
          // Create new document with settings
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email || '',
            name: user.name || 'User',
            createdAt: new Date().toISOString(),
            settings: settings,
            updatedAt: new Date().toISOString()
          })
        }
        
        // Set up practice reminders if enabled
        if (settings.practiceReminders) {
          try {
            await notificationService.scheduleDailyReminder({
              practiceTime: settings.practiceTime,
              reminderDays: settings.reminderDays,
              reminderEnabled: true,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
            console.log('Notifications scheduled successfully')
          } catch (notifError) {
            console.warn('Failed to schedule notifications:', notifError)
            // Don't fail the entire save for notification issues
          }
        } else {
          notificationService.clearAllReminders()
        }

        // Show success message
        toast.success('Settings saved successfully!')
      } catch (error) {
        console.error('Error saving settings:', error)
        if (error.code === 'permission-denied') {
          toast.error('You do not have permission to save settings. Please try logging in again.')
        } else {
          toast.error('Failed to save settings. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      toast.error('An error occurred. Please try again.')
    }
    
    setIsSaving(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('user')
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetProfile = () => {
    if (window.confirm('Are you sure you want to reset your yoga profile? This will delete all your progress and preferences.')) {
      // Navigate to onboarding to recreate profile
      navigate('/onboarding')
    }
  }

  if (isLoading) {
    return (
      <div className="settings-container">
        <UserHeader />
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <UserHeader />
      
      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your yoga experience</p>
        </div>

        <div className="settings-sections">
          {/* Profile Section */}
          <div className="settings-section">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <div className="info-item">
                <label>Name:</label>
                <span>{userData?.name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{userData?.email || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Yoga Experience:</label>
                <span>{userData?.yogaProfile?.experience?.level || userData?.yogaProfile?.experience || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
            <button className="reset-profile-btn" onClick={resetProfile}>
              Reset Yoga Profile
            </button>
          </div>

          {/* Practice Settings */}
          <div className="settings-section">
            <h2>Practice Settings</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Voice Guidance</label>
                <span>Get audio feedback during practice</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.voiceGuidance}
                  onChange={(e) => handleSettingChange('voiceGuidance', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Difficulty Level</label>
                <span>Adjust pose recommendations</span>
              </div>
              <select 
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                className="setting-select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Practice Reminders</label>
                <span>Daily reminders to practice yoga</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.practiceReminders}
                  onChange={(e) => handleSettingChange('practiceReminders', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Achievement Notifications</label>
                <span>Get notified when you unlock achievements</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.practiceReminders && (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Practice Time</label>
                    <span>When would you like to be reminded?</span>
                  </div>
                  <select 
                    value={settings.practiceTime}
                    onChange={(e) => handleSettingChange('practiceTime', e.target.value)}
                    className="setting-select"
                  >
                    {getPracticeTimeSuggestions(userData?.yogaProfile?.health?.routine).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label>Reminder Days</label>
                    <span>Which days should we remind you?</span>
                  </div>
                  <div className="day-selector">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={settings.reminderDays.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked 
                              ? [...settings.reminderDays, day]
                              : settings.reminderDays.filter(d => d !== day)
                            handleSettingChange('reminderDays', newDays)
                          }}
                        />
                        <span className="day-label">{day.substring(0, 3).toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* App Settings */}
          <div className="settings-section">
            <h2>App Settings</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Theme</label>
                <span>Choose your preferred app theme</span>
              </div>
              <select 
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button 
              className="save-btn"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button 
              className="signout-btn"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}