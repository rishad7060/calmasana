const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDXGlEK8XNLyRBj-9rcYW0Ww7t185UUfeM'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// Available yoga poses in our system
const AVAILABLE_POSES = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle',
  'Mountain', 'Child', 'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
]

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

IMPORTANT: You must ONLY recommend poses from this list:
${AVAILABLE_POSES.join(', ')}

Please provide:
1. A session plan with 5-8 yoga poses suitable for this user
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
        "modifications": "Any modifications needed"
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
    
    // Validate that recommended poses are in our available list
    const validatedPoses = parsed.sessionPlan.poses.filter(pose => 
      AVAILABLE_POSES.some(available => 
        pose.name.toLowerCase().includes(available.toLowerCase()) ||
        available.toLowerCase().includes(pose.name.toLowerCase())
      )
    )
    
    // If no valid poses found, use fallback
    if (validatedPoses.length === 0) {
      throw new Error('No valid poses in recommendation')
    }
    
    parsed.sessionPlan.poses = validatedPoses
    return parsed.sessionPlan
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
    throw error
  }
}

const generateFallbackRecommendations = (userProfile) => {
  const { experience, preferences, health } = userProfile
  
  // Create a basic recommendation based on experience level
  let poses = []
  
  if (experience.level === 'beginner') {
    poses = [
      { name: 'Mountain', duration: '60', benefits: 'Improves posture and balance', modifications: 'Stand with feet hip-width apart' },
      { name: 'Tree', duration: '45', benefits: 'Strengthens balance and focus', modifications: 'Keep hand on wall if needed' },
      { name: 'Cat-Cow', duration: '90', benefits: 'Warms up spine and relieves tension', modifications: 'Go slowly and gently' },
      { name: 'Child', duration: '120', benefits: 'Relaxes and stretches back', modifications: 'Use pillow under knees if needed' },
      { name: 'Bridge', duration: '45', benefits: 'Strengthens core and glutes', modifications: 'Keep feet flat on ground' }
    ]
  } else if (experience.level === 'intermediate') {
    poses = [
      { name: 'Mountain', duration: '45', benefits: 'Centers and grounds', modifications: 'Focus on breath' },
      { name: 'Warrior', duration: '60', benefits: 'Builds strength and stamina', modifications: 'Adjust stance width as needed' },
      { name: 'Triangle', duration: '60', benefits: 'Stretches and strengthens sides', modifications: 'Use block if needed' },
      { name: 'Tree', duration: '60', benefits: 'Improves balance and concentration', modifications: 'Try closing eyes for challenge' },
      { name: 'Downward Dog', duration: '90', benefits: 'Full body stretch and strength', modifications: 'Bend knees if hamstrings tight' },
      { name: 'Cobra', duration: '45', benefits: 'Opens chest and strengthens back', modifications: 'Keep elbows close to body' }
    ]
  } else {
    poses = [
      { name: 'Mountain', duration: '30', benefits: 'Centering and preparation', modifications: 'Set intention for practice' },
      { name: 'Warrior', duration: '90', benefits: 'Dynamic strength building', modifications: 'Deepen the lunge' },
      { name: 'Triangle', duration: '75', benefits: 'Deep side body stretch', modifications: 'Reach for advanced variation' },
      { name: 'Tree', duration: '90', benefits: 'Advanced balance work', modifications: 'Try with eyes closed' },
      { name: 'Plank', duration: '60', benefits: 'Core and arm strength', modifications: 'Try variations' },
      { name: 'Downward Dog', duration: '120', benefits: 'Active recovery and stretch', modifications: 'Walk the dog variation' },
      { name: 'Cobra', duration: '60', benefits: 'Backbend and chest opening', modifications: 'Progress to upward dog' },
      { name: 'Bridge', duration: '60', benefits: 'Hip opening and strength', modifications: 'Try one-legged variation' }
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
  
  return {
    title: `${experience.level.charAt(0).toUpperCase() + experience.level.slice(1)} Yoga Flow`,
    duration: preferences.sessionDuration,
    intention: `Focus on ${experience.goals[0] || 'overall wellness'} with attention to ${preferences.focusAreas[0] || 'full body'}`,
    poses: poses,
    tips: [
      'Listen to your body and modify as needed',
      'Focus on breath throughout the practice',
      'Take breaks whenever necessary',
      health.conditions.includes('None') ? 'Enjoy your practice!' : 'Be mindful of your conditions and don\'t push too hard'
    ]
  }
}

export const generateDailyChallenge = async (userProfile, previousSessions) => {
  // Generate a daily challenge based on user progress
  const prompt = `Based on this user's yoga profile and recent sessions, suggest a daily challenge pose that will help them progress. User level: ${userProfile.experience.level}. Choose from: ${AVAILABLE_POSES.join(', ')}. Provide the pose name, duration, and why it's beneficial for their progress.`
  
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
    // This is a simplified version - you might want more robust parsing
    const pose = AVAILABLE_POSES.find(p => text.toLowerCase().includes(p.toLowerCase())) || 'Tree'
    
    return {
      pose,
      duration: 60,
      description: 'Focus on balance and strength today'
    }
  } catch (error) {
    console.error('Error generating daily challenge:', error)
    return {
      pose: 'Tree',
      duration: 60,
      description: 'Work on your balance and focus today'
    }
  }
}