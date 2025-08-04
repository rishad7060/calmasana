import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import backend from '@tensorflow/tfjs-backend-webgl'
import Webcam from 'react-webcam'
import { count } from '../../utils/music'; 
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { generateYogaRecommendations, AI_SUPPORTED_POSES } from '../../services/geminiService'
 
import Instructions from '../../components/Instrctions/Instructions';
import UserHeader from '../../components/UserHeader/UserHeader';
import LiveFeedback from '../../components/LiveFeedback/LiveFeedback';
import VoiceFeedback from '../../components/VoiceFeedback/VoiceFeedback';
import SessionSummary from '../../components/SessionSummary/SessionSummary';
import SessionEndingLoader from '../../components/SessionEndingLoader/SessionEndingLoader';

import './EnhancedYoga.css'
 
import DropDown from '../../components/DropDown/DropDown';
import { poseImages } from '../../utils/pose_images';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper'

let skeletonColor = 'rgb(255,255,255)'

// All available poses (prioritizing AI-supported ones)
let poseList = [
  // AI-supported poses first (prioritized)
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle',
  // Manual poses last
  'Mountain', 'Child', 'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
]

let interval
let flag = false

function EnhancedYoga() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [searchParams] = useSearchParams()

  // Enhanced state management
  const [startingTime, setStartingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [poseTime, setPoseTime] = useState(0)
  const [bestPerform, setBestPerform] = useState(0)
  const [currentPose, setCurrentPose] = useState('Tree')
  const [isStartPose, setIsStartPose] = useState(false)
  const [personalizedPlan, setPersonalizedPlan] = useState(null)
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0)
  const [userData, setUserData] = useState(null)

  // New enhanced states
  const [poseAccuracy, setPoseAccuracy] = useState(0)
  const [isCorrectPose, setIsCorrectPose] = useState(false)
  const [sessionData, setSessionData] = useState({
    startTime: null,
    endTime: null,
    totalTime: 0,
    avgScore: 0,
    posesAttempted: 0,
    perfectPoses: 0,
    avgHoldTime: 0,
    poseResults: []
  })
  const [showSummary, setShowSummary] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [improvements, setImprovements] = useState([])
  const [poseHistory, setPoseHistory] = useState([])
  const [sessionScores, setSessionScores] = useState([])
  const [cameraError, setCameraError] = useState('')
  const [modelLoading, setModelLoading] = useState(false)
  const [availablePoses, setAvailablePoses] = useState(poseList)
  const [sessionEnding, setSessionEnding] = useState(false)
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(true)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [performanceAutoTimer, setPerformanceAutoTimer] = useState(null)
  const [lastAccuracyCheck, setLastAccuracyCheck] = useState(0)
  const [isReferenceExpanded, setIsReferenceExpanded] = useState(false)

  // Check mobile layout on mount and resize
  useEffect(() => {
    const checkMobileLayout = () => {
      setIsMobileLayout(window.innerWidth <= 768)
      if (window.innerWidth <= 768) {
        setShowPerformanceOverlay(false) // Hide by default on mobile
      }
    }
    
    checkMobileLayout()
    window.addEventListener('resize', checkMobileLayout)
    return () => window.removeEventListener('resize', checkMobileLayout)
  }, [])

  // Initialize session and load user data
  useEffect(() => {
    loadUserDataAndPlan()
    
    // Set initial pose from URL parameter
    const poseFromUrl = searchParams.get('pose')
    if (poseFromUrl && poseList.includes(poseFromUrl)) {
      setCurrentPose(poseFromUrl)
    }
  }, [])
  
  const loadUserDataAndPlan = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          
          // Generate personalized plan if user has profile
          if (data.yogaProfile) {
            const plan = await generateYogaRecommendations(data.yogaProfile)
            setPersonalizedPlan(plan)
            
            // Set available poses to recommended ones only
            if (plan.poses && plan.poses.length > 0) {
              const recommendedPoses = plan.poses.map(p => p.name)
              setAvailablePoses(recommendedPoses)
              setCurrentPose(plan.poses[0].name)
            }
          } else {
            // If no profile, show a default recommended set for new users
            const defaultRecommended = ['Tree', 'Mountain', 'Child', 'Cobra', 'Warrior']
            setAvailablePoses(defaultRecommended)
            setCurrentPose('Tree')
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
  }
  
  // Initialize session
  useEffect(() => {
    if (isStartPose && !sessionData.startTime) {
      setSessionData(prev => ({
        ...prev,
        startTime: Date.now(),
        posesAttempted: prev.posesAttempted + 1
      }))
    }
  }, [isStartPose])

  // Track pose time and accuracy with smart overlay control
  useEffect(() => {
    const timeDiff = (currentTime - startingTime)/1000
    if(flag) {
      setPoseTime(timeDiff)
      
      // For manual poses (non-AI supported), calculate accuracy based on hold time
      if (!AI_SUPPORTED_POSES.includes(currentPose) && timeDiff > 0) {
        // Gradually increase accuracy based on hold time
        // 0-5s: 0-30%, 5-10s: 30-60%, 10-20s: 60-85%, 20s+: 85-95%
        let calculatedAccuracy = 0
        if (timeDiff >= 20) {
          calculatedAccuracy = Math.min(95, 85 + (timeDiff - 20) * 0.5) // Max 95%
        } else if (timeDiff >= 10) {
          calculatedAccuracy = 60 + (timeDiff - 10) * 2.5 // 60-85%
        } else if (timeDiff >= 5) {
          calculatedAccuracy = 30 + (timeDiff - 5) * 6 // 30-60%
        } else if (timeDiff >= 2) {
          calculatedAccuracy = (timeDiff - 2) * 10 // 0-30%
        }
        
        setPoseAccuracy(Math.round(calculatedAccuracy))
        setIsCorrectPose(calculatedAccuracy >= 60)
        
        // Smart performance overlay control for mobile
        if (isMobileLayout) {
          const accuracyDifference = Math.abs(calculatedAccuracy - lastAccuracyCheck)
          
          // Auto-show performance overlay when:
          // 1. Major accuracy changes (>25 points)
          // 2. Reaching milestones (60%, 80%, 90%)
          // 3. First 10 seconds of practice
          if (timeDiff < 10 || 
              accuracyDifference > 25 || 
              (calculatedAccuracy >= 60 && lastAccuracyCheck < 60) ||
              (calculatedAccuracy >= 80 && lastAccuracyCheck < 80) ||
              (calculatedAccuracy >= 90 && lastAccuracyCheck < 90)) {
            
            setShowPerformanceOverlay(true)
            
            // Auto-hide after contextual delay
            if (performanceAutoTimer) clearTimeout(performanceAutoTimer)
            const delay = timeDiff < 10 ? 5000 : // 5s for initial display
                         calculatedAccuracy >= 80 ? 3000 : // 3s for success
                         4000 // 4s for regular updates
            
            const timer = setTimeout(() => {
              setShowPerformanceOverlay(false)
            }, delay)
            setPerformanceAutoTimer(timer)
          }
          
          setLastAccuracyCheck(calculatedAccuracy)
        }
        
        // Update feedback based on performance
        if (calculatedAccuracy >= 85) {
          setFeedback('Excellent form! Keep holding this position.')
        } else if (calculatedAccuracy >= 60) {
          setFeedback('Good job! Continue holding for better score.')
        } else if (calculatedAccuracy >= 30) {
          setFeedback('Keep going! Hold steady to improve your score.')
        } else if (timeDiff >= 2) {
          setFeedback('Getting started... Focus on your form and hold the pose.')
        }
      }
    }
    if((currentTime - startingTime)/1000 > bestPerform) {
      setBestPerform(timeDiff)
    }
  }, [currentTime, isMobileLayout, lastAccuracyCheck, performanceAutoTimer])

  // Reset states when pose changes
  useEffect(() => {
    setCurrentTime(0)
    setPoseTime(0)
    setBestPerform(0)
    setPoseAccuracy(0)
    setIsCorrectPose(false)
    setFeedback('')
    setSessionScores([])
  }, [currentPose])

  // Track session scores
  useEffect(() => {
    if (poseAccuracy > 0) {
      setSessionScores(prev => [...prev.slice(-19), poseAccuracy]) // Keep last 20 scores
    }
  }, [poseAccuracy])
  
  // Debug showSummary state
  useEffect(() => {
    console.log('showSummary state changed:', showSummary)
  }, [showSummary])


  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    No_Pose: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
    // Temporary mapping for manual poses (until model is retrained)
    Mountain: 6,        // Map to Tree (similar standing pose)
    Child: 1,           // Map to Cobra (similar floor pose)
    Bridge: 4,          // Map to Shoulderstand (similar inversion)
    Plank: 2,           // Map to Dog (similar arm support)
    'Cat-Cow': 2,       // Map to Dog (similar on hands and knees)
    'Downward Dog': 2   // Map to Dog (same pose, different name)
  }

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
    return center
  }

  function get_pose_size(landmarks, torso_size_multiplier=2.5) {
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center_new = tf.expandDims(pose_center_new, 1)
    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2])
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d,'euclidean', 0))
    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
    return pose_size
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center = tf.expandDims(pose_center, 1)
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2])
    landmarks = tf.sub(landmarks, pose_center)
    let pose_size = get_pose_size(landmarks)
    landmarks = tf.div(landmarks, pose_size)
    return landmarks
  }

  function landmarks_to_embedding(landmarks) {
    // normalize landmarks 2D
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    let embedding = tf.reshape(landmarks, [1,34])
    return embedding
  }

  const runMovenet = async () => {
    try {
      setModelLoading(true)
      setCameraError('')
      
      console.log('Loading MoveNet detector...')
      const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      console.log('MoveNet detector loaded successfully')
      
      console.log('Loading pose classifier from cloud...')
      const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json')
      console.log('Pose classifier loaded:', poseClassifier)
      console.log('Model input shape:', poseClassifier.inputs[0].shape)
      console.log('Model output shape:', poseClassifier.outputs[0].shape)
      
      const countAudio = new Audio(count)
      countAudio.loop = true
      
      setModelLoading(false)
      console.log('All models loaded successfully')
      
      interval = setInterval(() => {
        detect(detector, poseClassifier, countAudio)
      }, 100)
    } catch (error) {
      console.error('Detailed error loading models:', error)
      console.error('Error stack:', error.stack)
      
      let errorMessage = 'Failed to load AI models. '
      if (error.message.includes('model.json')) {
        errorMessage += 'Model file not found. Please ensure model.json and weights are in the public folder.'
      } else if (error.message.includes('WebGL')) {
        errorMessage += 'WebGL not supported in your browser.'
      } else {
        errorMessage += error.message
      }
      
      setCameraError(errorMessage)
      setModelLoading(false)
    }
  }

  const detect = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0
      const video = webcamRef.current.video
      const pose = await detector.estimatePoses(video)
      const ctx = canvasRef.current.getContext('2d')
      
      // Keep canvas at original video dimensions for proper coordinate mapping
      const canvas = canvasRef.current
      const videoWidth = video.videoWidth || 640
      const videoHeight = video.videoHeight || 480
      canvas.width = videoWidth
      canvas.height = videoHeight
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        const keypoints = pose[0].keypoints
        
        let input = keypoints.map((keypoint) => {
          if(keypoint.score > 0.3) {  // Lowered threshold for better detection
            if(!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
              let connections = keypointConnections[keypoint.name]
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase()
                  const connectedKeypoint = keypoints[POINTS[conName]]
                  if (connectedKeypoint && connectedKeypoint.score > 0.3) {
                    drawSegment(ctx, [keypoint.x, keypoint.y],
                        [connectedKeypoint.x, connectedKeypoint.y]
                    , skeletonColor)
                  }
                })
              } catch(err) {
                // Connection not found, skip
              }
            }
          } else {
            notDetected += 1
          } 
          return [keypoint.x, keypoint.y]
        }) 
        
        console.log('Keypoints detected:', keypoints.length, 'Not detected:', notDetected)
        
        if(notDetected > 8) {  // Increased threshold to be less strict
          skeletonColor = 'rgb(255,255,255)'
          setPoseAccuracy(0)
          setIsCorrectPose(false)
          setFeedback('Please ensure your full body is visible in the camera')
          return
        }
        
        const processedInput = landmarks_to_embedding(input)
        console.log('Processed input shape:', processedInput.shape)
        
        const classification = poseClassifier.predict(processedInput)
        
        classification.array().then((data) => { 
          const classNo = CLASS_NO[currentPose]
          console.log('Current pose:', currentPose, 'ClassNo:', classNo)
          console.log('Full prediction array:', data[0])
          console.log('All class probabilities:', data[0].map((prob, idx) => `Class ${idx}: ${(prob * 100).toFixed(1)}%`))
          
          if (classNo === undefined) {
            console.warn('Unknown pose:', currentPose)
            setFeedback(`Pose "${currentPose}" not recognized in classification system`)
            return
          }
          
          const probability = data[0][classNo]
          const accuracy = Math.round(probability * 100)
          console.log('Target class probability:', probability, 'Accuracy:', accuracy)
          
          setPoseAccuracy(accuracy)
          
          if (accuracy > 97) {
            setIsCorrectPose(true)
            skeletonColor = 'rgb(0, 255, 0)'
            setFeedback('Perfect pose! Hold this position')
            generateImprovements(accuracy, 'excellent')
            
            if (!flag) {
              countAudio.play()
              setStartingTime(Date.now())
              flag = true
            }
            setCurrentTime(Date.now())
          } else if (accuracy > 80) {
            setIsCorrectPose(true)
            skeletonColor = 'rgb(255, 255, 0)'
            setFeedback('Great form! Small adjustments will make it perfect')
            generateImprovements(accuracy, 'good')
            
            if (!flag) {
              setStartingTime(Date.now())
              flag = true
            }
            setCurrentTime(Date.now())
          } else if (accuracy > 60) {
            setIsCorrectPose(false)
            skeletonColor = 'rgb(255, 165, 0)'
            setFeedback('Getting closer! Focus on your alignment')
            generateImprovements(accuracy, 'fair')
            flag = false
          } else {
            setIsCorrectPose(false)
            skeletonColor = 'rgb(255, 0, 0)'
            setFeedback('Adjust your pose - check the reference image')
            generateImprovements(accuracy, 'poor')
            flag = false
            countAudio.pause()
            countAudio.currentTime = 0
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const generateImprovements = (accuracy, level) => {
    const poseImprovements = {
      'Tree': {
        excellent: ['Perfect balance! Try closing your eyes for an extra challenge'],
        good: ['Engage your core more', 'Press your foot firmly into your thigh'],
        fair: ['Keep your standing leg straight', 'Find a focal point to help with balance'],
        poor: ['Start with your toe on the ground for support', 'Use a wall for balance if needed']
      },
      'Warrior': {
        excellent: ['Excellent warrior! Feel the strength in your legs'],
        good: ['Sink deeper into your front thigh', 'Reach your arms higher'],
        fair: ['Keep your front knee over your ankle', 'Square your hips forward'],
        poor: ['Step your feet wider apart', 'Bend your front knee to 90 degrees']
      },
      'Chair': {
        excellent: ['Perfect chair pose! You\'re sitting in an invisible chair'],
        good: ['Sit back a little more', 'Keep your chest lifted'],
        fair: ['Shift more weight to your heels', 'Keep your knees together'],
        poor: ['Bend your knees more', 'Keep your arms reaching up']
      }
    }

    const improvements = poseImprovements[currentPose]?.[level] || 
                        ['Focus on proper alignment', 'Breathe deeply and hold steady']
    setImprovements(improvements)
  }

  const startYoga = () => {
    setIsStartPose(true)
    
    // Check if the current pose has AI support
    console.log('Starting yoga with pose:', currentPose, 'AI supported:', AI_SUPPORTED_POSES.includes(currentPose))
    
    if (AI_SUPPORTED_POSES.includes(currentPose)) {
      console.log('Using AI detection for', currentPose)
      runMovenet()
    } else {
      console.log('Using manual practice for', currentPose)
      // For poses without AI support, start a timer-based session
      setSessionData(prev => ({
        ...prev,
        startTime: Date.now(),
        posesAttempted: prev.posesAttempted + 1
      }))
      
      // Start with no accuracy - it will be calculated based on hold time
      setPoseAccuracy(0)
      setIsCorrectPose(false)
      setFeedback(`Hold the ${currentPose} pose. Your score will improve the longer you maintain proper form.`)
      
      // Start a timer for manual poses
      setStartingTime(Date.now())
      interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 100)
    }
  }

  const stopPose = async () => {
    console.log('stopPose called - starting')
    console.log('Current states:', { isStartPose, sessionEnding, showSummary })
    
    setSessionEnding(true) // Show loading immediately
    clearInterval(interval)
    flag = false
    
    console.log('Cleared interval, calculating session data...')
    
    // Calculate session data - Only use real scores, no artificial minimums
    const endTime = Date.now()
    const totalTime = sessionData.startTime ? (endTime - sessionData.startTime) / 1000 : poseTime
    
    // Only count actual valid scores from pose detection
    const validScores = sessionScores.filter(score => score > 0)
    const avgScore = validScores.length > 0 ? 
      Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 0
    
    const perfectPoses = validScores.filter(score => score >= 95).length
    const hasValidSession = totalTime >= 5 && (validScores.length > 0 || poseTime >= 10)
    
    console.log('Session ending - totalTime:', totalTime, 'avgScore:', avgScore, 'validScores:', validScores.length, 'poseTime:', poseTime)
    
    const finalSessionData = {
      ...sessionData,
      endTime,
      totalTime: Math.round(totalTime),
      avgScore: hasValidSession ? avgScore : 0, // Only show score if session was actually performed
      perfectPoses,
      avgHoldTime: Math.round(poseTime),
      posesAttempted: hasValidSession ? 1 : 0,
      poseResults: hasValidSession ? [{
        name: currentPose,
        score: avgScore,
        time: Math.round(poseTime),
        attempts: 1
      }] : []
    }
    
    console.log('Final session data:', finalSessionData)
    
    // Set session data for the loader to show preview
    setSessionData(finalSessionData)
    
    // Save session in background during loading
    console.log('Saving session in background...')
    await handleSaveSession(finalSessionData)
    
    console.log('Session saved, data prepared for summary')
    
    // Save to history
    const newHistoryEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...finalSessionData
    }
    setPoseHistory(prev => [newHistoryEntry, ...prev])
  }

  // Handle when loading is complete - transition to summary
  const handleLoadingComplete = () => {
    console.log('Loading complete, showing summary...')
    setSessionEnding(false) // Hide loader
    setShowSummary(true)    // Show summary
    console.log('setShowSummary(true) called from loading complete')
    
    console.log('stopPose completed')
  }

  const handleSaveSession = async (data) => {
    console.log('Saving session data:', data)
    
    // Save to localStorage
    const existingHistory = JSON.parse(localStorage.getItem('yogaHistory') || '[]')
    existingHistory.unshift(data)
    localStorage.setItem('yogaHistory', JSON.stringify(existingHistory))
    
    // Save to Firebase if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.uid) {
      try {
        // Convert duration from seconds to minutes for storage
        const durationInMinutes = Math.round(data.totalTime / 60 * 100) / 100
        
        // Save session to subcollection
        const sessionData = {
          date: new Date().toISOString(),
          duration: durationInMinutes,
          poses: data.poseResults.map(p => p.name),
          avgScore: data.avgScore,
          improvement: data.avgScore > 85 ? `+${Math.round((data.avgScore - 85) / 10)}%` : '0%',
          createdAt: new Date(),
          poseResults: data.poseResults,
          totalTimeSeconds: data.totalTime,
          perfectPoses: data.perfectPoses
        }
        
        console.log('Saving to Firebase:', sessionData)
        await addDoc(collection(db, 'users', user.uid, 'sessions'), sessionData)
        
        // Get current user stats to properly increment
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const currentStats = userDoc.exists() ? userDoc.data().stats || {} : {}
        
        // Update user stats with proper increments
        const newStats = {
          'stats.totalSessions': (currentStats.totalSessions || 0) + 1,
          'stats.totalPracticeTime': (currentStats.totalPracticeTime || 0) + durationInMinutes,
          'stats.lastPracticeDate': new Date().toISOString(),
          'stats.avgScore': data.avgScore,
          'stats.bestScore': Math.max(currentStats.bestScore || 0, data.avgScore)
        }
        
        console.log('Updating user stats:', newStats)
        await updateDoc(doc(db, 'users', user.uid), newStats)
        
        // Check for achievements
        const achievements = []
        
        // First session achievement
        if ((currentStats.totalSessions || 0) === 0) {
          achievements.push({
            id: 1,
            earnedDate: new Date().toISOString()
          })
        }
        
        // High score achievement
        if (data.avgScore >= 95) {
          achievements.push({
            id: 3,
            earnedDate: new Date().toISOString()
          })
        }
        
        // Tree pose achievement
        if (data.poseResults.some(p => p.name === 'Tree' && p.time >= 60)) {
          achievements.push({
            id: 4,
            earnedDate: new Date().toISOString()
          })
        }
        
        if (achievements.length > 0) {
          console.log('Adding achievements:', achievements)
          await updateDoc(doc(db, 'users', user.uid), {
            achievements: arrayUnion(...achievements)
          })
        }
        
        console.log('Session saved successfully!')
      } catch (error) {
        console.error('Error saving session to Firebase:', error)
      }
    }
  }

  const isAiSupported = AI_SUPPORTED_POSES.includes(currentPose)
  
  return (
    <>
      {/* Session Ending Loader - Shows during session processing */}
      <SessionEndingLoader
        isVisible={sessionEnding && !showSummary}
        onComplete={handleLoadingComplete}
        sessionData={sessionData}
      />
      
      {/* Session Summary - Always rendered at top level */}
      <SessionSummary
        sessionData={sessionData}
        isVisible={showSummary}
        onClose={() => {
          setShowSummary(false)
          setSessionEnding(false)
          setIsStartPose(false)
        }}
        onSaveSession={handleSaveSession}
      />
      
      {(isStartPose || sessionEnding) ? (
        <div>
        <UserHeader />
        <div className="enhanced-yoga-container">
          <div className="main-practice-area">
            <div className="webcam-container">
              {!isAiSupported ? (
                <div className="manual-practice-container">
                  <div className="manual-practice-icon">🧘‍♀️</div>
                  <div className="manual-practice-title">Manual Practice Mode</div>
                  <div className="manual-practice-description">
                    This pose uses manual timing. Follow the instructions and hold the pose for your desired duration.
                  </div>
                  <div className="pose-timer">
                    <div className="timer-display">{Math.round(poseTime)}s</div>
                    <div className="timer-label">Hold Time</div>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="camera-error">
                  <div className="error-icon">📹</div>
                  <div className="error-message">{cameraError}</div>
                  <button 
                    className="retry-btn"
                    onClick={() => {
                      setCameraError('')
                      runMovenet()
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : modelLoading ? (
                <div className="loading-indicator">
                  <div className="loading-spinner-lg"></div>
                  <div className="loading-text">Loading AI models...</div>
                </div>
              ) : (
                <>
                  <Webcam
                    id="webcam"
                    ref={webcamRef}
                    onUserMedia={() => {
                      console.log('Camera access granted')
                    }}
                    onUserMediaError={(error) => {
                      console.error('Camera error:', error)
                      setCameraError('Camera access denied. Please allow camera permissions and refresh.')
                    }}
                    videoConstraints={{
                      aspectRatio: 4/3,
                      facingMode: "user"
                    }}
                    style={{
                      borderRadius: '16px',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    id="my-canvas"
                    style={{
                      zIndex: 2,
                      borderRadius: '16px',
                      pointerEvents: 'none'
                    }}
                  >
                  </canvas>
                </>
              )}
              
              {/* Enhanced Performance Display */}
              {showPerformanceOverlay && (
                <div className="performance-overlay">
                  <div className="pose-info">
                    <h3 className="current-pose-title">{currentPose} Pose</h3>
                    <div className="pose-stats">
                      <div className="stat-item">
                        <span className="stat-value">{Math.round(poseTime)}s</span>
                        <span className="stat-label">Hold Time</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{Math.round(bestPerform)}s</span>
                        <span className="stat-label">Best Time</span>
                      </div>
                    </div>
                  </div>
                  {isMobileLayout && (
                    <button 
                      className="overlay-close-btn"
                      onClick={() => setShowPerformanceOverlay(false)}
                      aria-label="Hide performance stats"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div 
              className={`reference-image-container ${isMobileLayout ? (isReferenceExpanded ? 'expanded' : 'collapsed') : ''}`}
              onClick={() => isMobileLayout && setIsReferenceExpanded(!isReferenceExpanded)}
            >
              <img 
                src={poseImages[currentPose]}
                className="reference-pose-img"
                alt={`${currentPose} pose reference`}
              />
              <div className="reference-label">
                {isMobileLayout ? (isReferenceExpanded ? '✕' : '👁️') : 'Reference Pose'}
              </div>
            </div>
          </div>
          
          {/* Automatic Mobile Performance Stats - No manual controls needed */}
          
          {/* Mobile Performance Overlay - Static positioning */}
          {isMobileLayout && showPerformanceOverlay && (
            <div className="mobile-performance-card">
              <div className="pose-info">
                <div className="mobile-stats-header">
                  <h3 className="current-pose-title">{currentPose} Pose</h3>
                  {/* Auto-hide - no manual close needed */}
                </div>
                <div className="pose-stats">
                  <div className="stat-item">
                    <span className="stat-value">{Math.round(poseTime)}s</span>
                    <span className="stat-label">Hold Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{Math.round(bestPerform)}s</span>
                    <span className="stat-label">Best Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{Math.round(poseAccuracy || 0)}%</span>
                    <span className="stat-label">Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Panel */}
          <div className="control-panel">
            <button
              onClick={() => {
                console.log('End Session button clicked')
                stopPose()
              }}
              className="stop-btn"    
            >
              <span className="btn-icon">🛑</span>
              End Session
            </button>
          </div>
          
          {/* Enhanced Components */}
          <LiveFeedback
            currentPose={currentPose}
            poseAccuracy={poseAccuracy}
            isCorrect={isCorrectPose}
            feedback={feedback}
            improvements={improvements}
            poseTime={poseTime}
            targetTime={30}
          />
          
          <VoiceFeedback
            isEnabled={isVoiceEnabled}
            currentPose={currentPose}
            poseAccuracy={poseAccuracy}
            isCorrect={isCorrectPose}
            poseTime={poseTime}
            onToggleVoice={setIsVoiceEnabled}
          />

          
        </div>
      </div>
      ) : (
        <div>
      <UserHeader />
      <div className="enhanced-yoga-container">
        <div className="pre-session-container">
          <div className="main-content-grid">
            {/* Pose Selection */}
            <div className="pose-selection-card">
            {/* Pose Selection Section */}
            <div className="pose-section">
              <h2 className="section-title">Recommended for You</h2>
              <p style={{fontSize: '0.8rem', color: '#666', textAlign: 'center', marginBottom: '0.5rem'}}>
                {availablePoses.length} personalized poses for your practice
              </p>
              <p style={{fontSize: '0.75rem', color: AI_SUPPORTED_POSES.includes(currentPose) ? '#667eea' : '#f5576c', textAlign: 'center', marginBottom: '1rem', fontWeight: '600'}}>
                {AI_SUPPORTED_POSES.includes(currentPose) ? '🤖 AI Detection Mode' : '⏱️ Manual Practice Mode'}
              </p>
              <DropDown
                poseList={availablePoses}
                currentPose={currentPose}
                setCurrentPose={setCurrentPose}
              />
            </div>
            
            {/* Session Settings Section */}
            <div className="settings-section">
              <h3>Session Settings</h3>
              <div className="setting-item">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={isVoiceEnabled}
                    onChange={(e) => setIsVoiceEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  Voice Guidance
                </label>
              </div>
            </div>
            
            {/* Start Practice Section */}
            <div className="start-section-inline">
              <button
                onClick={startYoga}
                className="start-session-btn"    
              >
                <span className="btn-icon">🚀</span>
                Start Practice Session
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="instructions-card">
            <Instructions currentPose={currentPose} />
            {personalizedPlan && (
              <div className="personalized-info">
                <h4>Your Personalized Session</h4>
                <p className="session-intention">{personalizedPlan.intention}</p>
                <div className="pose-sequence">
                  {personalizedPlan.poses.map((pose, index) => (
                    <div 
                      key={index} 
                      className={`sequence-pose ${index === currentPoseIndex ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPose(pose.name)
                        setCurrentPoseIndex(index)
                      }}
                    >
                      <span className="pose-number">{index + 1}</span>
                      <span className="pose-name">{pose.name}</span>
                      <span className="pose-duration">{pose.duration}s</span>
                    </div>
                  ))}
                </div>
                <div className="session-tips">
                  <h5>Tips for today:</h5>
                  {personalizedPlan.tips.map((tip, index) => (
                    <p key={index}>• {tip}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
      
    </div>
      )}
    </>
  )
}

export default EnhancedYoga