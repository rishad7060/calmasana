import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { generateYogaRecommendations } from '../../services/geminiService'
import UserHeader from '../../components/UserHeader/UserHeader'
import { poseImages } from '../../utils/pose_images'
import './AllPoses.css'

// All available poses
const allPoses = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Traingle', 'Mountain', 'Child', 
  'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
]

// AI Model supported poses (with pose detection)
const aiSupportedPoses = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Traingle', 'Mountain', 'Child', 
  'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
]

// Pose details for display
const poseDetails = {
  'Tree': {
    difficulty: 'Beginner',
    duration: '30-60 seconds',
    benefits: ['Improves balance', 'Strengthens legs', 'Enhances focus'],
    description: 'A standing balance pose that grounds you while reaching skyward.'
  },
  'Chair': {
    difficulty: 'Beginner',
    duration: '30-45 seconds',
    benefits: ['Strengthens thighs', 'Builds endurance', 'Improves posture'],
    description: 'A powerful standing pose that builds strength and stamina.'
  },
  'Cobra': {
    difficulty: 'Beginner',
    duration: '15-30 seconds',
    benefits: ['Opens chest', 'Strengthens spine', 'Improves flexibility'],
    description: 'A gentle backbend that opens the heart and strengthens the back.'
  },
  'Warrior': {
    difficulty: 'Intermediate',
    duration: '45-60 seconds',
    benefits: ['Builds strength', 'Improves balance', 'Increases stamina'],
    description: 'A powerful standing pose that embodies the spirit of a warrior.'
  },
  'Dog': {
    difficulty: 'Beginner',
    duration: '30-60 seconds',
    benefits: ['Full body stretch', 'Strengthens arms', 'Energizes body'],
    description: 'An energizing pose that stretches the entire body.'
  },
  'Shoulderstand': {
    difficulty: 'Advanced',
    duration: '30-90 seconds',
    benefits: ['Improves circulation', 'Calms mind', 'Strengthens core'],
    description: 'An inversion that brings fresh blood flow to the brain.'
  },
  'Traingle': {
    difficulty: 'Beginner',
    duration: '30-45 seconds',
    benefits: ['Stretches sides', 'Opens hips', 'Improves balance'],
    description: 'A standing pose that creates length and space in the body.'
  },
  'Mountain': {
    difficulty: 'Beginner',
    duration: '30-60 seconds',
    benefits: ['Improves posture', 'Grounds energy', 'Builds awareness'],
    description: 'The foundation of all standing poses, promoting grounding and alignment.'
  },
  'Child': {
    difficulty: 'Beginner',
    duration: '60-180 seconds',
    benefits: ['Relieves stress', 'Rests body', 'Calms mind'],
    description: 'A restful pose that provides gentle stretch and relaxation.'
  },
  'Bridge': {
    difficulty: 'Intermediate',
    duration: '30-45 seconds',
    benefits: ['Opens chest', 'Strengthens glutes', 'Improves spine flexibility'],
    description: 'A backbend that opens the heart while strengthening the posterior chain.'
  },
  'Plank': {
    difficulty: 'Intermediate',
    duration: '30-60 seconds',
    benefits: ['Builds core strength', 'Tones arms', 'Improves endurance'],
    description: 'A foundational pose that builds full-body strength and stability.'
  },
  'Cat-Cow': {
    difficulty: 'Beginner',
    duration: '60-90 seconds',
    benefits: ['Warms spine', 'Improves flexibility', 'Massages organs'],
    description: 'A flowing movement that brings flexibility to the spine.'
  },
  'Downward Dog': {
    difficulty: 'Beginner',
    duration: '45-60 seconds',
    benefits: ['Stretches hamstrings', 'Strengthens arms', 'Energizes body'],
    description: 'An essential pose that combines strength and flexibility.'
  }
}

export default function AllPoses() {
  const [userData, setUserData] = useState(null)
  const [recommendedPoses, setRecommendedPoses] = useState([])
  const [filter, setFilter] = useState('all') // all, available, unavailable
  const [difficultyFilter, setDifficultyFilter] = useState('all') // all, beginner, intermediate, advanced

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          
          // Get recommended poses from user's plan
          if (data.yogaProfile) {
            const plan = await generateYogaRecommendations(data.yogaProfile)
            if (plan.poses && plan.poses.length > 0) {
              setRecommendedPoses(plan.poses.map(p => p.name))
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
  }

  const isPoseAvailable = (pose) => {
    return recommendedPoses.includes(pose)
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#10b981'
      case 'Intermediate': return '#f59e0b'
      case 'Advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const filteredPoses = allPoses.filter(pose => {
    const available = isPoseAvailable(pose)
    const details = poseDetails[pose]
    
    // Filter by availability
    if (filter === 'available' && !available) return false
    if (filter === 'unavailable' && available) return false
    
    // Filter by difficulty
    if (difficultyFilter !== 'all' && details.difficulty.toLowerCase() !== difficultyFilter) return false
    
    return true
  })

  return (
    <div className="all-poses-container">
      <UserHeader />
      
      <div className="all-poses-content">
        <div className="page-header">
          <h1>All Yoga Poses</h1>
          <p className="page-subtitle">Explore our complete collection of yoga poses</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Availability:</label>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Poses
              </button>
              <button 
                className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                onClick={() => setFilter('available')}
              >
                Available to Me
              </button>
              <button 
                className={`filter-btn ${filter === 'unavailable' ? 'active' : ''}`}
                onClick={() => setFilter('unavailable')}
              >
                Locked
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDifficultyFilter('all')}
              >
                All Levels
              </button>
              <button 
                className={`filter-btn ${difficultyFilter === 'beginner' ? 'active' : ''}`}
                onClick={() => setDifficultyFilter('beginner')}
              >
                Beginner
              </button>
              <button 
                className={`filter-btn ${difficultyFilter === 'intermediate' ? 'active' : ''}`}
                onClick={() => setDifficultyFilter('intermediate')}
              >
                Intermediate
              </button>
              <button 
                className={`filter-btn ${difficultyFilter === 'advanced' ? 'active' : ''}`}
                onClick={() => setDifficultyFilter('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Pose Cards Grid */}
        <div className="poses-grid">
          {filteredPoses.map((pose, index) => {
            const available = isPoseAvailable(pose)
            const details = poseDetails[pose]
            const isAiSupported = aiSupportedPoses.includes(pose)
            
            return (
              <div 
                key={index} 
                className={`pose-card ${!available ? 'unavailable' : ''}`}
              >
                {/* Availability Badge */}
                {!available && (
                  <div className="locked-badge">
                    <span>🔒 Locked</span>
                  </div>
                )}
                
                {/* Pose Image */}
                <div className="pose-image-container">
                  <img 
                    src={poseImages[pose]} 
                    alt={`${pose} pose`}
                    className="pose-image"
                    style={{ 
                      filter: available ? 'none' : 'grayscale(100%)',
                      opacity: available ? 1 : 0.7
                    }}
                  />
                  
                  {/* AI/Manual Badge */}
                  <div className={`mode-badge ${isAiSupported ? 'ai-mode' : 'manual-mode'}`}>
                    {isAiSupported ? '🤖 AI Guided' : '⏱️ Manual'}
                  </div>
                </div>

                {/* Pose Details */}
                <div className="pose-details">
                  <h3 className="pose-name">{pose}</h3>
                  
                  <div className="pose-meta">
                    <span 
                      className="difficulty-badge"
                      style={{ 
                        backgroundColor: getDifficultyColor(details.difficulty),
                        opacity: available ? 1 : 0.6
                      }}
                    >
                      {details.difficulty}
                    </span>
                    <span className="duration">⏱️ {details.duration}</span>
                  </div>

                  <p className="pose-description">{details.description}</p>

                  <div className="benefits-section">
                    <h4>Benefits:</h4>
                    <ul className="benefits-list">
                      {details.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {available ? (
                    <Link 
                      to={`/start?pose=${pose}`} 
                      className="practice-btn"
                    >
                      Practice Now →
                    </Link>
                  ) : (
                    <div className="unlock-info">
                      <p>Complete your personalized plan to unlock this pose</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredPoses.length === 0 && (
          <div className="empty-state">
            <h3>No poses found</h3>
            <p>Try adjusting your filters to see more poses</p>
          </div>
        )}
      </div>
    </div>
  )
}