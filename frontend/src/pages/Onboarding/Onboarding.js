import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import AIRecommendation from '../../components/AIRecommendation/AIRecommendation'
import { useToast } from '../../contexts/ToastContext'
import './Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAIRecommendation, setShowAIRecommendation] = useState(false)
  const [yogaProfileData, setYogaProfileData] = useState(null)
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  
  const [formData, setFormData] = useState({
    // Basic Info
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Yoga Experience
    experienceLevel: '',
    practiceFrequency: '',
    yogaGoals: [],
    
    // Health Information
    routine: '',
    medicalConditions: [],
    injuries: '',
    medications: '',
    pregnancyStatus: '',
    
    // Preferences
    sessionDuration: '',
    difficultyPreference: '',
    focusAreas: [],
    musicPreference: true,
    voiceFeedback: true
  })

  const steps = [
    {
      title: 'Basic Information',
      subtitle: 'Tell us about yourself'
    },
    {
      title: 'Yoga Experience',
      subtitle: 'Your yoga journey so far'
    },
    {
      title: 'Health & Wellness',
      subtitle: 'Help us personalize safely'
    },
    {
      title: 'Preferences',
      subtitle: 'Customize your experience'
    }
  ]

  const yogaGoalsOptions = [
    'Flexibility', 'Strength', 'Balance', 'Stress Relief', 
    'Better Sleep', 'Weight Loss', 'Mindfulness', 'Pain Management'
  ]

  const medicalConditionsOptions = [
    'None', 'Back Pain', 'Knee Problems', 'Shoulder Issues', 
    'High Blood Pressure', 'Anxiety', 'Depression', 'Arthritis',
    'Heart Condition', 'Diabetes', 'Asthma', 'Other'
  ]

  const focusAreasOptions = [
    'Core', 'Upper Body', 'Lower Body', 'Back', 
    'Hips', 'Shoulders', 'Full Body', 'Breathing'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.age || !formData.gender) {
          setError('Please fill in all required fields')
          return false
        }
        if (formData.age < 13 || formData.age > 100) {
          setError('Please enter a valid age (13-100)')
          return false
        }
        break
      case 1:
        if (!formData.experienceLevel || !formData.practiceFrequency || formData.yogaGoals.length === 0) {
          setError('Please complete all fields')
          return false
        }
        break
      case 2:
        if (!formData.routine || formData.medicalConditions.length === 0) {
          setError('Please provide your routine and medical information')
          return false
        }
        break
      case 3:
        if (!formData.sessionDuration || !formData.difficultyPreference || formData.focusAreas.length === 0) {
          setError('Please complete your preferences')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Prepare yoga profile data
      const yogaProfile = {
        basicInfo: {
          age: parseInt(formData.age),
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight
        },
        experience: {
          level: formData.experienceLevel,
          frequency: formData.practiceFrequency,
          goals: formData.yogaGoals
        },
        health: {
          routine: formData.routine,
          conditions: formData.medicalConditions,
          injuries: formData.injuries,
          medications: formData.medications,
          pregnancyStatus: formData.pregnancyStatus
        },
        preferences: {
          sessionDuration: formData.sessionDuration,
          difficulty: formData.difficultyPreference,
          focusAreas: formData.focusAreas,
          musicEnabled: formData.musicPreference,
          voiceFeedbackEnabled: formData.voiceFeedback
        },
        updatedAt: new Date().toISOString()
      }

      // Update user document in Firestore
      await updateDoc(doc(db, 'users', userData.uid), {
        yogaProfile: yogaProfile,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      })

      // Update local storage
      const updatedUserData = {
        ...userData,
        onboardingCompleted: true
      }
      localStorage.setItem('user', JSON.stringify(updatedUserData))

      // Show success message
      toast.success('Profile created successfully! Generating personalized recommendations...')
      
      // Show AI recommendation popup
      setYogaProfileData(yogaProfile)
      setShowAIRecommendation(true)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save your profile. Please try again.')
      setError('Failed to save your profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIRecommendationComplete = (recommendation) => {
    // Store the recommendation for future use
    localStorage.setItem('lastAIRecommendation', JSON.stringify(recommendation))
    setShowAIRecommendation(false)
    // The navigation to dashboard will be handled by the AIRecommendation component
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-step">
            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="13"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  <span>Male</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  <span>Female</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Height (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 5'8 or 170cm"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Weight (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 150lbs or 68kg"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="form-step">
            <div className="form-group">
              <label>Experience Level *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="experience"
                    value="beginner"
                    checked={formData.experienceLevel === 'beginner'}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  />
                  <span>
                    <strong>Beginner</strong>
                    <small>New to yoga or less than 6 months</small>
                  </span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="experience"
                    value="intermediate"
                    checked={formData.experienceLevel === 'intermediate'}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  />
                  <span>
                    <strong>Intermediate</strong>
                    <small>6 months to 2 years experience</small>
                  </span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="experience"
                    value="advanced"
                    checked={formData.experienceLevel === 'advanced'}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  />
                  <span>
                    <strong>Advanced</strong>
                    <small>More than 2 years experience</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>How often do you practice? *</label>
              <select
                value={formData.practiceFrequency}
                onChange={(e) => handleInputChange('practiceFrequency', e.target.value)}
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="3-5-week">3-5 times a week</option>
                <option value="1-2-week">1-2 times a week</option>
                <option value="occasionally">Occasionally</option>
                <option value="new">I'm just starting</option>
              </select>
            </div>

            <div className="form-group">
              <label>What are your yoga goals? * (Select all that apply)</label>
              <div className="checkbox-grid">
                {yogaGoalsOptions.map(goal => (
                  <label key={goal} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.yogaGoals.includes(goal)}
                      onChange={() => handleMultiSelect('yogaGoals', goal)}
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="form-step">
            <div className="form-group">
              <label>What's your daily routine? *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="routine"
                    value="morning"
                    checked={formData.routine === 'morning'}
                    onChange={(e) => handleInputChange('routine', e.target.value)}
                  />
                  <span>Morning person (practice before work)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="routine"
                    value="evening"
                    checked={formData.routine === 'evening'}
                    onChange={(e) => handleInputChange('routine', e.target.value)}
                  />
                  <span>Evening person (practice after work)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="routine"
                    value="flexible"
                    checked={formData.routine === 'flexible'}
                    onChange={(e) => handleInputChange('routine', e.target.value)}
                  />
                  <span>Flexible schedule</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Any medical conditions? * (Select all that apply)</label>
              <div className="checkbox-grid">
                {medicalConditionsOptions.map(condition => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.medicalConditions.includes(condition)}
                      onChange={() => handleMultiSelect('medicalConditions', condition)}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Any injuries or physical limitations?</label>
              <textarea
                placeholder="Please describe any injuries, surgeries, or physical limitations..."
                value={formData.injuries}
                onChange={(e) => handleInputChange('injuries', e.target.value)}
                rows="3"
              />
            </div>

            {formData.gender === 'female' && (
              <div className="form-group">
                <label>Pregnancy Status</label>
                <select
                  value={formData.pregnancyStatus}
                  onChange={(e) => handleInputChange('pregnancyStatus', e.target.value)}
                >
                  <option value="">Not applicable</option>
                  <option value="pregnant">Currently pregnant</option>
                  <option value="postpartum">Postpartum (within 6 months)</option>
                  <option value="trying">Trying to conceive</option>
                </select>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="form-step">
            <div className="form-group">
              <label>Preferred session duration *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="duration"
                    value="15"
                    checked={formData.sessionDuration === '15'}
                    onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                  />
                  <span>15 minutes (Quick practice)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="duration"
                    value="30"
                    checked={formData.sessionDuration === '30'}
                    onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                  />
                  <span>30 minutes (Standard)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="duration"
                    value="45"
                    checked={formData.sessionDuration === '45'}
                    onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                  />
                  <span>45 minutes (Extended)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="duration"
                    value="60"
                    checked={formData.sessionDuration === '60'}
                    onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                  />
                  <span>60 minutes (Full practice)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Difficulty preference *</label>
              <select
                value={formData.difficultyPreference}
                onChange={(e) => handleInputChange('difficultyPreference', e.target.value)}
              >
                <option value="">Select difficulty</option>
                <option value="gentle">Gentle (Low intensity)</option>
                <option value="moderate">Moderate (Balanced)</option>
                <option value="challenging">Challenging (High intensity)</option>
                <option value="adaptive">Adaptive (Adjust as I go)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Focus areas * (Select all that apply)</label>
              <div className="checkbox-grid">
                {focusAreasOptions.map(area => (
                  <label key={area} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area)}
                      onChange={() => handleMultiSelect('focusAreas', area)}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Additional preferences</label>
              <div className="preference-toggles">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.musicPreference}
                    onChange={(e) => handleInputChange('musicPreference', e.target.checked)}
                  />
                  <span>Background music during practice</span>
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.voiceFeedback}
                    onChange={(e) => handleInputChange('voiceFeedback', e.target.checked)}
                  />
                  <span>Voice guidance and feedback</span>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="logo">
          <img 
            src="/CalmAsana-logo.png" 
            alt="CalmAsana" 
            className="logo-image"
          />
        </div>
      </div>

      <div className="onboarding-content">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="step-indicator">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-circle">{index < currentStep ? '✓' : index + 1}</div>
              <div className="step-label">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="onboarding-card">
          <h1>{steps[currentStep].title}</h1>
          <p className="step-subtitle">{steps[currentStep].subtitle}</p>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {renderStepContent()}

          <div className="form-actions">
            {currentStep > 0 && (
              <button 
                className="btn-secondary"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </button>
            )}
            <button 
              className="btn-primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="inline-loading-spinner"></div>
                  <span>Saving...</span>
                </>
              ) : currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Recommendation Popup */}
      {showAIRecommendation && yogaProfileData && (
        <AIRecommendation 
          yogaProfile={yogaProfileData}
          onComplete={handleAIRecommendationComplete}
        />
      )}
    </div>
  )
}