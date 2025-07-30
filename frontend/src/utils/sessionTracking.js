/**
 * Enhanced Session Tracking Utility
 * Provides accurate time tracking, data collection, and Firebase storage
 */

export class SessionTracker {
  constructor() {
    this.sessionStart = null
    this.poseStart = null
    this.poseData = {}
    this.sessionScores = []
    this.detectionLog = []
    this.currentPose = null
    this.totalCorrectTime = 0
    this.totalPoseTime = 0
  }

  // Start a new session
  startSession(pose) {
    this.sessionStart = Date.now()
    this.currentPose = pose
    this.poseData = {}
    this.sessionScores = []
    this.detectionLog = []
    this.totalCorrectTime = 0
    this.totalPoseTime = 0
    
    console.log(`Session started for ${pose} at`, new Date(this.sessionStart))
    return this.sessionStart
  }

  // Start tracking a specific pose
  startPose(pose) {
    // End previous pose if exists
    if (this.poseStart && this.currentPose) {
      this.endPose()
    }

    this.poseStart = Date.now()
    this.currentPose = pose
    
    if (!this.poseData[pose]) {
      this.poseData[pose] = {
        name: pose,
        attempts: 0,
        totalTime: 0,
        correctTime: 0,
        detections: [],
        averageAccuracy: 0,
        bestAccuracy: 0,
        startTime: this.poseStart
      }
    }
    
    this.poseData[pose].attempts += 1
    console.log(`Started tracking pose: ${pose}`)
  }

  // Log pose detection data
  logDetection(pose, accuracy, isCorrect, timestamp = Date.now()) {
    if (!this.poseData[pose]) {
      this.startPose(pose)
    }

    const detection = {
      timestamp,
      accuracy: Math.round(accuracy * 100),
      isCorrect,
      pose
    }

    this.poseData[pose].detections.push(detection)
    this.detectionLog.push(detection)

    // Update accuracy metrics
    const detections = this.poseData[pose].detections
    const accuracies = detections.map(d => d.accuracy)
    this.poseData[pose].averageAccuracy = Math.round(
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    )
    this.poseData[pose].bestAccuracy = Math.max(...accuracies)

    if (isCorrect) {
      this.sessionScores.push(accuracy * 100)
    }
  }

  // End current pose tracking
  endPose() {
    if (!this.poseStart || !this.currentPose) return null

    const endTime = Date.now()
    const poseTime = (endTime - this.poseStart) / 1000
    
    const poseData = this.poseData[this.currentPose]
    poseData.totalTime += poseTime
    poseData.endTime = endTime

    // Calculate correct time from detections
    const correctDetections = poseData.detections.filter(d => d.isCorrect)
    poseData.correctTime = correctDetections.length * 0.1 // 100ms per detection

    this.totalPoseTime += poseTime
    this.totalCorrectTime += poseData.correctTime

    console.log(`Ended pose ${this.currentPose}: ${poseTime.toFixed(1)}s total, ${poseData.correctTime.toFixed(1)}s correct`)

    this.poseStart = null
    return poseData
  }

  // End entire session and generate comprehensive data
  endSession() {
    if (!this.sessionStart) {
      console.warn('No session to end')
      return null
    }

    // End current pose if active
    if (this.poseStart) {
      this.endPose()
    }

    const sessionEnd = Date.now()
    const totalSessionTime = (sessionEnd - this.sessionStart) / 1000

    // Calculate session statistics
    const allAccuracies = this.detectionLog.map(d => d.accuracy)
    const correctDetections = this.detectionLog.filter(d => d.isCorrect)
    
    const sessionData = {
      // Timing data
      startTime: this.sessionStart,
      endTime: sessionEnd,
      totalTime: Math.round(totalSessionTime),
      totalPoseTime: Math.round(this.totalPoseTime),
      totalCorrectTime: Math.round(this.totalCorrectTime),
      
      // Performance metrics
      avgScore: allAccuracies.length > 0 ? 
        Math.round(allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length) : 0,
      bestScore: allAccuracies.length > 0 ? Math.max(...allAccuracies) : 0,
      accuracyRate: this.detectionLog.length > 0 ? 
        Math.round((correctDetections.length / this.detectionLog.length) * 100) : 0,
      
      // Pose data
      poses: Object.keys(this.poseData),
      posesAttempted: Object.keys(this.poseData).length,
      poseResults: Object.values(this.poseData).map(pose => ({
        name: pose.name,
        attempts: pose.attempts,
        totalTime: Math.round(pose.totalTime),
        correctTime: Math.round(pose.correctTime),
        accuracy: pose.averageAccuracy,
        bestAccuracy: pose.bestAccuracy,
        score: pose.averageAccuracy
      })),
      
      // Session metadata
      date: new Date().toISOString(),
      createdAt: new Date(),
      totalDetections: this.detectionLog.length,
      correctDetections: correctDetections.length,
      
      // Achievement data
      perfectPoses: Object.values(this.poseData).filter(p => p.averageAccuracy >= 95).length,
      improvement: this.calculateImprovement(),
      
      // Raw data for analysis
      detectionLog: this.detectionLog.slice(-1000), // Keep last 1000 detections
      sessionScores: this.sessionScores
    }

    console.log('Session completed:', sessionData)
    return sessionData
  }

  // Calculate improvement based on performance
  calculateImprovement() {
    const avgScore = this.sessionScores.length > 0 ? 
      this.sessionScores.reduce((sum, score) => sum + score, 0) / this.sessionScores.length : 0
    
    if (avgScore >= 95) return 'Excellent'
    if (avgScore >= 85) return 'Great'
    if (avgScore >= 75) return 'Good'
    if (avgScore >= 65) return 'Fair'
    return 'Needs Practice'
  }

  // Get current session stats (for real-time display)
  getCurrentStats() {
    if (!this.sessionStart) return null

    const currentTime = Date.now()
    const sessionTime = (currentTime - this.sessionStart) / 1000
    const poseTime = this.poseStart ? (currentTime - this.poseStart) / 1000 : 0

    const allAccuracies = this.detectionLog.map(d => d.accuracy)
    const correctDetections = this.detectionLog.filter(d => d.isCorrect)

    return {
      sessionTime: Math.round(sessionTime),
      poseTime: Math.round(poseTime),
      currentPose: this.currentPose,
      totalDetections: this.detectionLog.length,
      correctDetections: correctDetections.length,
      accuracyRate: this.detectionLog.length > 0 ? 
        Math.round((correctDetections.length / this.detectionLog.length) * 100) : 0,
      avgScore: allAccuracies.length > 0 ? 
        Math.round(allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length) : 0,
      bestScore: allAccuracies.length > 0 ? Math.max(...allAccuracies) : 0
    }
  }

  // Reset tracker
  reset() {
    this.sessionStart = null
    this.poseStart = null
    this.poseData = {}
    this.sessionScores = []
    this.detectionLog = []
    this.currentPose = null
    this.totalCorrectTime = 0
    this.totalPoseTime = 0
  }
}

// Utility functions for data formatting
export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}