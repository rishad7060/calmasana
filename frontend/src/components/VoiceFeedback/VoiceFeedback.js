import React, { useState, useEffect, useRef } from 'react'
import './VoiceFeedback.css'

export default function VoiceFeedback({ 
  isEnabled, 
  currentPose, 
  poseAccuracy, 
  isCorrect, 
  poseTime,
  onToggleVoice 
}) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(isEnabled || false)
  const [lastSpokenMessage, setLastSpokenMessage] = useState('')
  const [voiceSettings, setVoiceSettings] = useState({
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    voice: null
  })
  const [availableVoices, setAvailableVoices] = useState([])
  const speechRef = useRef(null)
  const lastFeedbackTime = useRef(0)

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
      
      // Set default voice to a female English voice if available
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]
      
      setVoiceSettings(prev => ({ ...prev, voice: preferredVoice }))
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  useEffect(() => {
    if (isVoiceEnabled && currentPose) {
      provideFeedback()
    }
  }, [isVoiceEnabled, isCorrect, poseAccuracy, currentPose])

  const speak = (text, priority = 'normal') => {
    if (!isVoiceEnabled || !text) return

    // Cancel current speech for high priority messages
    if (priority === 'high') {
      speechSynthesis.cancel()
    }

    // Prevent speaking the same message too frequently
    const now = Date.now()
    if (text === lastSpokenMessage && now - lastFeedbackTime.current < 3000) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = voiceSettings.volume
    utterance.rate = voiceSettings.rate
    utterance.pitch = voiceSettings.pitch
    
    if (voiceSettings.voice) {
      utterance.voice = voiceSettings.voice
    }

    utterance.onend = () => {
      setLastSpokenMessage('')
    }

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error)
    }

    speechSynthesis.speak(utterance)
    setLastSpokenMessage(text)
    lastFeedbackTime.current = now
  }

  const provideFeedback = () => {
    const messages = generateFeedbackMessages()
    
    if (messages.primary) {
      speak(messages.primary, messages.priority)
    }
  }

  const generateFeedbackMessages = () => {
    if (!currentPose) return {}

    // Pose-specific encouragement
    const poseEncouragement = {
      'Tree': 'Find your balance, engage your core',
      'Warrior': 'Feel strong and grounded, reach up tall',
      'Chair': 'Sit back into your imaginary chair, keep your chest up',
      'Cobra': 'Lift your chest, keep your shoulders down',
      'Dog': 'Press your hands down, lengthen your spine',
      'Triangle': 'Reach long through your side body',
      'Shoulderstand': 'Keep your neck relaxed, engage your core'
    }

    if (isCorrect) {
      if (poseAccuracy >= 95) {
        return {
          primary: `Excellent ${currentPose} pose! Perfect form!`,
          priority: 'normal'
        }
      } else if (poseAccuracy >= 85) {
        return {
          primary: `Great ${currentPose}! Hold this position`,
          priority: 'normal'
        }
      } else {
        return {
          primary: `Good ${currentPose}, keep holding`,
          priority: 'normal'
        }
      }
    } else {
      if (poseAccuracy < 50) {
        return {
          primary: `Adjust your ${currentPose} pose. ${poseEncouragement[currentPose] || 'Focus on your alignment'}`,
          priority: 'high'
        }
      } else {
        return {
          primary: `Almost there! ${poseEncouragement[currentPose] || 'Small adjustments needed'}`,
          priority: 'normal'
        }
      }
    }
  }

  const handleVoiceToggle = () => {
    const newState = !isVoiceEnabled
    setIsVoiceEnabled(newState)
    
    if (newState) {
      speak('Voice guidance enabled', 'high')
    } else {
      speechSynthesis.cancel()
    }
    
    if (onToggleVoice) {
      onToggleVoice(newState)
    }
  }

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value)
    setVoiceSettings(prev => ({ ...prev, volume }))
    speak('Volume adjusted', 'high')
  }

  const handleRateChange = (e) => {
    const rate = parseFloat(e.target.value)
    setVoiceSettings(prev => ({ ...prev, rate }))
    speak('Speed adjusted', 'high')
  }

  const handleVoiceChange = (e) => {
    const voiceIndex = parseInt(e.target.value)
    const selectedVoice = availableVoices[voiceIndex]
    setVoiceSettings(prev => ({ ...prev, voice: selectedVoice }))
    speak('Voice changed', 'high')
  }

  const testVoice = () => {
    speak(`Hello! I'm your yoga voice guide. I'll help you perfect your ${currentPose || 'yoga'} practice.`, 'high')
  }

  const giveEncouragement = () => {
    const encouragements = [
      "You're doing amazing! Keep it up!",
      "Breathe deeply and stay focused",
      "Feel the strength in your body",
      "You're getting stronger with each pose",
      "Listen to your body and find your balance",
      "Great effort! You're improving every day"
    ]
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
    speak(randomEncouragement, 'high')
  }

  return (
    <div className="voice-feedback-container">
      {/* Voice Toggle Button */}
      <button 
        className={`voice-toggle-btn ${isVoiceEnabled ? 'active' : ''}`}
        onClick={handleVoiceToggle}
        title={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
      >
        <span className="voice-icon">
          {isVoiceEnabled ? '🔊' : '🔇'}
        </span>
        <span className="voice-text">
          {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
        </span>
      </button>

      {/* Voice Settings Panel */}
      {isVoiceEnabled && (
        <div className="voice-settings-panel">
          <div className="settings-header">
            <h4>🎙️ Voice Settings</h4>
          </div>

          {/* Volume Control */}
          <div className="setting-group">
            <label className="setting-label">
              Volume: {Math.round(voiceSettings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={handleVolumeChange}
              className="setting-slider"
            />
          </div>

          {/* Speed Control */}
          <div className="setting-group">
            <label className="setting-label">
              Speed: {voiceSettings.rate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={handleRateChange}
              className="setting-slider"
            />
          </div>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div className="setting-group">
              <label className="setting-label">Voice:</label>
              <select
                value={availableVoices.indexOf(voiceSettings.voice)}
                onChange={handleVoiceChange}
                className="voice-select"
              >
                {availableVoices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="voice-actions">
            <button 
              className="voice-action-btn test"
              onClick={testVoice}
            >
              🎵 Test Voice
            </button>
            <button 
              className="voice-action-btn encourage"
              onClick={giveEncouragement}
            >
              💪 Encourage Me
            </button>
          </div>

          {/* Voice Status */}
          <div className="voice-status">
            <div className="status-indicator">
              <div className={`status-dot ${isVoiceEnabled ? 'active' : ''}`}></div>
              <span className="status-text">
                {isVoiceEnabled ? 'Voice guidance active' : 'Voice guidance inactive'}
              </span>
            </div>
            {lastSpokenMessage && (
              <div className="last-message">
                Last: "{lastSpokenMessage}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Cues Visualization */}
      {isVoiceEnabled && (
        <div className="audio-visualizer">
          <div className="sound-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>
      )}
    </div>
  )
}