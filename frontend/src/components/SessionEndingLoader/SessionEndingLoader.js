/**
 * Enhanced Session Ending Loader
 * Premium UX for session completion with progress tracking
 */

import React, { useState, useEffect } from 'react'
import './SessionEndingLoader.css'

export const SessionEndingLoader = ({ 
  isVisible, 
  onComplete,
  sessionData = {},
  steps = [
    { id: 1, label: 'Analyzing Performance', duration: 800 },
    { id: 2, label: 'Calculating Scores', duration: 600 }, 
    { id: 3, label: 'Saving to Cloud', duration: 1000 },
    { id: 4, label: 'Generating Insights', duration: 700 }
  ]
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      // Reset state when hidden
      setCurrentStep(0)
      setProgress(0)
      setCompleted(false)
      return
    }

    // Start the loading sequence
    let stepIndex = 0
    let progressValue = 0
    
    const runStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex)
        
        const step = steps[stepIndex]
        const stepProgress = 100 / steps.length
        const stepDuration = step.duration
        const progressInterval = 50 // Update every 50ms
        const incrementPerInterval = stepProgress / (stepDuration / progressInterval)
        
        const progressTimer = setInterval(() => {
          progressValue += incrementPerInterval
          setProgress(Math.min(progressValue, (stepIndex + 1) * stepProgress))
          
          if (progressValue >= (stepIndex + 1) * stepProgress) {
            clearInterval(progressTimer)
            stepIndex++
            
            if (stepIndex < steps.length) {
              setTimeout(runStep, 100)
            } else {
              // All steps completed
              setTimeout(() => {
                setCompleted(true)
                setTimeout(() => {
                  onComplete?.()
                }, 500)
              }, 200)
            }
          }
        }, progressInterval)
      }
    }

    // Start first step after a brief delay
    const startTimer = setTimeout(runStep, 300)
    
    return () => {
      clearTimeout(startTimer)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="session-ending-overlay">
      <div className="session-ending-modal">
        {/* Header */}
        <div className="ending-header">
          <div className="success-animation">
            {completed ? (
              <div className="checkmark-animation">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            ) : (
              <div className="processing-animation">
                <div className="processing-ring"></div>
                <div className="processing-inner">
                  <span className="processing-icon">🧘‍♀️</span>
                </div>
              </div>
            )}
          </div>
          
          <h2 className="ending-title">
            {completed ? 'Session Complete!' : 'Processing Your Session...'}
          </h2>
          
          <p className="ending-subtitle">
            {completed 
              ? 'Great job! Your progress has been saved.' 
              : 'Please wait while we analyze your practice'
            }
          </p>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          {/* Overall Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>
            <div className="progress-text">
              {Math.round(progress)}% Complete
            </div>
          </div>

          {/* Step Indicators */}
          <div className="steps-container">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`step-item ${index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'}`}
              >
                <div className="step-indicator">
                  {index < currentStep ? (
                    <span className="step-check">✓</span>
                  ) : index === currentStep ? (
                    <div className="step-spinner"></div>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Preview */}
        <div className="session-preview">
          <div className="preview-stats">
            <div className="preview-stat">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">
                {sessionData.totalTime ? `${Math.round(sessionData.totalTime/60)}min` : '--'}
              </span>
              <span className="stat-label">Duration</span>
            </div>
            
            <div className="preview-stat">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">
                {sessionData.avgScore ? `${Math.round(sessionData.avgScore)}%` : '--'}
              </span>
              <span className="stat-label">Score</span>
            </div>
            
            <div className="preview-stat">
              <span className="stat-icon">🧘</span>
              <span className="stat-value">
                {sessionData.posesAttempted || 1}
              </span>
              <span className="stat-label">Poses</span>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="loading-message">
          {!completed && (
            <p>
              <span className="loading-dots">
                Processing your yoga session
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionEndingLoader