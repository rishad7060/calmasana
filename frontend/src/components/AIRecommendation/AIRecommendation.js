import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateYogaRecommendations } from '../../services/geminiService'
import './AIRecommendation.css'

export default function AIRecommendation({ yogaProfile, onComplete }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [recommendation, setRecommendation] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    generateRecommendation()
  }, [])

  const generateRecommendation = async () => {
    try {
      setIsLoading(true)
      const result = await generateYogaRecommendations(yogaProfile)
      setRecommendation(result)
    } catch (error) {
      console.error('Error generating recommendation:', error)
      setError('Failed to generate recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (onComplete) {
      onComplete(recommendation)
    }
    navigate('/dashboard')
  }

  return (
    <div className="ai-recommendation-overlay">
      <div className="ai-recommendation-modal">
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <h2>Your AI-Powered Yoga Plan is Ready!</h2>
          <p>Based on your profile, our AI has created a personalized yoga journey just for you.</p>
        </div>

        {isLoading ? (
          <div className="ai-loading">
            <div className="loading-spinner"></div>
            <p>Our AI is analyzing your profile...</p>
            <div className="loading-steps">
              <div className="step active">Reviewing your health information</div>
              <div className="step">Considering your experience level</div>
              <div className="step">Creating personalized sequences</div>
            </div>
          </div>
        ) : error ? (
          <div className="ai-error">
            <p>{error}</p>
            <button onClick={generateRecommendation} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : recommendation ? (
          <div className="ai-content">
            <div className="recommendation-card">
              <h3>{recommendation.title}</h3>
              <p className="session-intention">{recommendation.intention}</p>
              
              <div className="session-overview">
                <div className="overview-item">
                  <span className="overview-label">Duration</span>
                  <span className="overview-value">{recommendation.duration} minutes</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Poses</span>
                  <span className="overview-value">{recommendation.poses.length} poses</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Difficulty</span>
                  <span className="overview-value">{yogaProfile.preferences.difficulty}</span>
                </div>
              </div>

              <div className="poses-preview">
                <h4>Your Personalized Sequence:</h4>
                <div className="pose-list">
                  {recommendation.poses.map((pose, index) => (
                    <div key={index} className="pose-item">
                      <span className="pose-number">{index + 1}</span>
                      <div className="pose-details">
                        <span className="pose-name">{pose.name}</span>
                        <span className="pose-duration">{pose.duration}s</span>
                      </div>
                      <div className="pose-benefit">{pose.benefits}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ai-tips">
                <h4>AI Tips for Your Practice:</h4>
                {recommendation.tips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-icon">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <div className="ai-insights">
                <div className="insight-box">
                  <h5>Why this plan?</h5>
                  <p>Based on your {yogaProfile.experience.level} experience level and goals of {yogaProfile.experience.goals.join(', ')}, 
                     we've created a {recommendation.duration}-minute session focusing on {yogaProfile.preferences.focusAreas.join(', ')}.</p>
                </div>
                {yogaProfile.health.conditions.some(c => c !== 'None') && (
                  <div className="insight-box caution">
                    <h5>Health Considerations</h5>
                    <p>We've adjusted your plan considering your health conditions. All poses include modifications for your safety.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleContinue} className="continue-btn">
                Start Your Journey
                <span className="btn-arrow">→</span>
              </button>
              <button onClick={generateRecommendation} className="regenerate-btn">
                Generate Different Plan
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}