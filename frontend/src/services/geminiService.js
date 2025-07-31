const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDXGlEK8XNLyRBj-9rcYW0Ww7t185UUfeM'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// AI-supported poses with real-time pose detection (PRIORITIZED)
const AI_SUPPORTED_POSES = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle'
]

// Manual poses (timer-based, use sparingly)
const MANUAL_POSES = [
  'Mountain', 'Child', 'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
]

// All available poses in our system
const AVAILABLE_POSES = [...AI_SUPPORTED_POSES, ...MANUAL_POSES]

// Export for use in other components
export { AI_SUPPORTED_POSES, MANUAL_POSES, AVAILABLE_POSES }

export const generateYogaRecommendations = async (userProfile) => {
  const prompt = createPrompt(userProfile)
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get recommendations from Gemini')
    }

    const data = await response.json()
    const recommendations = parseGeminiResponse(data)
    
    return recommendations
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return generateFallbackRecommendations(userProfile)
  }
}

const createPrompt = (userProfile) => {
  const { basicInfo, experience, health, preferences } = userProfile
  
  return `As a certified yoga instructor AI, create a personalized yoga session plan based on this user profile:

User Profile:
- Age: ${basicInfo.age}, Gender: ${basicInfo.gender}
- Experience Level: ${experience.level}
- Practice Frequency: ${experience.frequency}
- Goals: ${experience.goals.join(', ')}
- Daily Routine: ${health.routine}
- Medical Conditions: ${health.conditions.join(', ')}
- Injuries/Limitations: ${health.injuries || 'None'}
- Session Duration: ${preferences.sessionDuration} minutes
- Difficulty Preference: ${preferences.difficulty}
- Focus Areas: ${preferences.focusAreas.join(', ')}

CRITICAL: PRIORITIZE AI-SUPPORTED POSES for the best user experience:

🤖 AI-SUPPORTED POSES (with real-time pose detection - PRIORITIZE THESE):
${AI_SUPPORTED_POSES.join(', ')}

⏱️ MANUAL POSES (timer-based only - use sparingly, maximum 1-2 per session):
${MANUAL_POSES.join(', ')}

RULES:
1. Use 80-90% AI-supported poses for optimal experience
2. Include maximum 1-2 manual poses per session (only if absolutely necessary)
3. AI-supported poses provide real-time feedback and better accuracy
4. Manual poses should only be used for specific therapeutic needs or as transitions

Please provide:
1. A session plan with 5-8 yoga poses (prioritizing AI-supported ones)
2. Duration for each pose (in seconds)
3. Specific benefits of each pose for this user
4. Any modifications needed based on their conditions
5. Overall session focus and intention

Format your response as JSON with this structure:
{
  "sessionPlan": {
    "title": "Session title",
    "duration": "total minutes",
    "intention": "Session intention",
    "poses": [
      {
        "name": "Pose name (must be from the available list)",
        "duration": "duration in seconds",
        "benefits": "Specific benefits for this user",
        "modifications": "Any modifications needed",
        "type": "AI" or "Manual"
      }
    ],
    "tips": ["General tips for the practice"]
  }
}`
}

const parseGeminiResponse = (response) => {
  try {
    const text = response.candidates[0].content.parts[0].text
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate and prioritize AI-supported poses
    const validatedPoses = parsed.sessionPlan.poses.filter(pose => 
      AVAILABLE_POSES.some(available => 
        pose.name.toLowerCase().includes(available.toLowerCase()) ||
        available.toLowerCase().includes(pose.name.toLowerCase())
      )
    ).map(pose => {
      // Add type classification if not present
      if (!pose.type) {
        pose.type = AI_SUPPORTED_POSES.some(aiPose => 
          pose.name.toLowerCase().includes(aiPose.toLowerCase()) ||
          aiPose.toLowerCase().includes(pose.name.toLowerCase())
        ) ? 'AI' : 'Manual'
      }
      return pose
    })
    
    // Prioritize AI poses - sort by type (AI first)
    validatedPoses.sort((a, b) => {
      if (a.type === 'AI' && b.type === 'Manual') return -1
      if (a.type === 'Manual' && b.type === 'AI') return 1
      return 0
    })
    
    // Limit manual poses to maximum 2
    const aiPoses = validatedPoses.filter(pose => pose.type === 'AI')
    const manualPoses = validatedPoses.filter(pose => pose.type === 'Manual').slice(0, 2)
    
    const finalPoses = [...aiPoses, ...manualPoses]
    
    // If no valid poses found, use fallback
    if (finalPoses.length === 0) {
      throw new Error('No valid poses in recommendation')
    }
    
    parsed.sessionPlan.poses = finalPoses
    return parsed.sessionPlan
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
    throw error
  }
}

const generateFallbackRecommendations = (userProfile) => {
  const { experience, preferences, health } = userProfile
  
  // Create AI-prioritized recommendations based on experience level
  let poses = []
  
  if (experience.level === 'beginner') {
    poses = [
      // Prioritize AI-supported poses
      { name: 'Tree', duration: '45', benefits: 'Strengthens balance and focus', modifications: 'Keep hand on wall if needed', type: 'AI' },
      { name: 'Chair', duration: '30', benefits: 'Builds leg strength and endurance', modifications: 'Use wall for support if needed', type: 'AI' },
      { name: 'Cobra', duration: '30', benefits: 'Opens chest and strengthens back', modifications: 'Keep elbows close to body', type: 'AI' },
      { name: 'Warrior', duration: '45', benefits: 'Builds strength and confidence', modifications: 'Shorten stance if needed', type: 'AI' },
      // Limited manual poses for beginners
      { name: 'Mountain', duration: '60', benefits: 'Improves posture and balance', modifications: 'Stand with feet hip-width apart', type: 'Manual' }
    ]
  } else if (experience.level === 'intermediate') {
    poses = [
      // Prioritize AI-supported poses
      { name: 'Tree', duration: '60', benefits: 'Improves balance and concentration', modifications: 'Try closing eyes for challenge', type: 'AI' },
      { name: 'Warrior', duration: '60', benefits: 'Builds strength and stamina', modifications: 'Adjust stance width as needed', type: 'AI' },
      { name: 'Traingle', duration: '60', benefits: 'Stretches and strengthens sides', modifications: 'Use block if needed', type: 'AI' },
      { name: 'Chair', duration: '45', benefits: 'Strengthens legs and core', modifications: 'Add arm variations', type: 'AI' },
      { name: 'Cobra', duration: '45', benefits: 'Opens chest and strengthens back', modifications: 'Keep elbows close to body', type: 'AI' },
      { name: 'Dog', duration: '60', benefits: 'Full body stretch and strength', modifications: 'Bend knees if hamstrings tight', type: 'AI' },
      // Minimal manual poses
      { name: 'Child', duration: '90', benefits: 'Relaxes and restores', modifications: 'Use bolster for comfort', type: 'Manual' }
    ]
  } else {
    poses = [
      // Advanced AI-supported sequence
      { name: 'Tree', duration: '90', benefits: 'Advanced balance work', modifications: 'Try with eyes closed', type: 'AI' },
      { name: 'Warrior', duration: '90', benefits: 'Dynamic strength building', modifications: 'Deepen the lunge', type: 'AI' },
      { name: 'Traingle', duration: '75', benefits: 'Deep side body stretch', modifications: 'Reach for advanced variation', type: 'AI' },
      { name: 'Chair', duration: '60', benefits: 'Advanced leg strengthening', modifications: 'Add twists or arm variations', type: 'AI' },
      { name: 'Cobra', duration: '60', benefits: 'Advanced backbend', modifications: 'Progress toward upward dog', type: 'AI' },
      { name: 'Dog', duration: '75', benefits: 'Dynamic strength and flexibility', modifications: 'Try one-legged variations', type: 'AI' },
      { name: 'Shoulderstand', duration: '90', benefits: 'Advanced inversion benefits', modifications: 'Use wall support if needed', type: 'AI' },
      // Single manual pose for variety
      { name: 'Bridge', duration: '60', benefits: 'Hip opening and strength', modifications: 'Try one-legged variation', type: 'Manual' }
    ]
  }
  
  // Filter based on medical conditions
  if (health.conditions.includes('Back Pain')) {
    poses = poses.filter(p => !['Cobra', 'Bridge'].includes(p.name))
  }
  
  if (health.conditions.includes('Knee Problems')) {
    poses = poses.map(p => {
      if (p.name === 'Warrior') {
        p.modifications += '. Be gentle on knees, don\'t lunge too deep'
      }
      return p
    })
  }
  
  // Count AI vs Manual poses for reporting
  const aiPoseCount = poses.filter(p => p.type === 'AI').length
  const manualPoseCount = poses.filter(p => p.type === 'Manual').length
  
  return {
    title: `AI-Enhanced ${experience.level.charAt(0).toUpperCase() + experience.level.slice(1)} Yoga Flow`,
    duration: preferences.sessionDuration,
    intention: `Focus on ${experience.goals[0] || 'overall wellness'} with attention to ${preferences.focusAreas[0] || 'full body'}, optimized with AI pose detection`,
    poses: poses,
    tips: [
      `This session uses ${aiPoseCount} AI-supported poses with real-time feedback and ${manualPoseCount} manual pose${manualPoseCount !== 1 ? 's' : ''}`,
      'AI poses provide instant feedback on your form and alignment',
      'Listen to your body and modify as needed',
      'Focus on breath throughout the practice',
      'Take breaks whenever necessary',
      health.conditions.includes('None') ? 'Enjoy your AI-enhanced practice!' : 'Be mindful of your conditions and don\'t push too hard'
    ]
  }
}

export const generateDailyChallenge = async (userProfile, previousSessions) => {
  // Generate a daily challenge based on user progress, prioritizing AI poses
  const prompt = `Based on this user's yoga profile and recent sessions, suggest a daily challenge pose that will help them progress. User level: ${userProfile.experience.level}. 
  
  PRIORITIZE AI-SUPPORTED POSES: ${AI_SUPPORTED_POSES.join(', ')}
  
  Only use manual poses if absolutely necessary: ${MANUAL_POSES.join(', ')}
  
  Provide the pose name, duration, and why it's beneficial for their progress. Focus on AI-supported poses for better user experience with real-time feedback.`
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 256,
        }
      })
    })
    
    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    
    // Parse the response to extract pose information
    // Prioritize AI-supported poses in the response
    let pose = AI_SUPPORTED_POSES.find(p => text.toLowerCase().includes(p.toLowerCase()))
    
    // If no AI pose found, check manual poses as fallback
    if (!pose) {
      pose = MANUAL_POSES.find(p => text.toLowerCase().includes(p.toLowerCase())) || 'Tree'
    }
    
    const poseType = AI_SUPPORTED_POSES.includes(pose) ? 'AI' : 'Manual'
    
    return {
      pose,
      duration: 60,
      description: `Focus on balance and strength today with ${poseType === 'AI' ? 'AI-guided real-time feedback' : 'mindful timing'}`,
      type: poseType
    }
  } catch (error) {
    console.error('Error generating daily challenge:', error)
    return {
      pose: 'Tree',
      duration: 60,
      description: 'Work on your balance and focus today with AI-guided feedback',
      type: 'AI'
    }
  }
}