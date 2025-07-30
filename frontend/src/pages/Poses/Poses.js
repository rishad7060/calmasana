import React from 'react'
import { Link } from 'react-router-dom'
import UserHeader from '../../components/UserHeader/UserHeader'
import { poseImages } from '../../utils/pose_images'
import './Poses.css'

const poseDescriptions = {
  Tree: {
    description: "A balancing pose that strengthens the legs and core while improving focus and stability.",
    benefits: ["Improves balance and stability", "Strengthens thighs, calves, ankles, and spine", "Stretches the groins and inner thighs, chest and shoulders"],
    instructions: ["Stand on your left foot", "Place your right foot on your inner left thigh", "Bring palms together at heart center", "Hold for 30-60 seconds", "Switch sides"]
  },
  Chair: {
    description: "A powerful standing pose that strengthens the entire body while improving posture.",
    benefits: ["Strengthens the thighs and ankles", "Tones the shoulders, butt, hips, and back", "Stretches the chest and shoulders"],
    instructions: ["Stand with feet together", "Inhale and raise your arms overhead", "Exhale and bend your knees", "Sit back as if sitting in a chair", "Hold for 30-60 seconds"]
  },
  Cobra: {
    description: "A gentle backbend that opens the chest and strengthens the spine.",
    benefits: ["Strengthens the spine", "Stretches chest, lungs, shoulders, and abdomen", "Stimulates abdominal organs"],
    instructions: ["Lie face down on the mat", "Place palms under shoulders", "Press into hands and lift chest", "Keep hips on the ground", "Hold for 15-30 seconds"]
  },
  Warrior: {
    description: "A strong standing pose that builds strength, stability, and confidence.",
    benefits: ["Strengthens the legs and core", "Opens the hips and chest", "Improves focus and balance"],
    instructions: ["Step left foot back 3-4 feet", "Turn left foot out 90 degrees", "Bend right knee over ankle", "Raise arms overhead", "Hold for 30-60 seconds"]
  },
  Dog: {
    description: "An energizing full-body stretch that strengthens and lengthens.",
    benefits: ["Strengthens arms and legs", "Stretches spine, hamstrings, and calves", "Energizes the body"],
    instructions: ["Start on hands and knees", "Tuck toes and lift hips up", "Straighten legs as much as possible", "Create inverted V shape", "Hold for 30-60 seconds"]
  },
  Shoulderstand: {
    description: "An inversion that calms the mind and stimulates circulation.",
    benefits: ["Improves circulation", "Calms the nervous system", "Strengthens shoulders and core"],
    instructions: ["Lie on your back", "Lift legs and hips up", "Support back with hands", "Keep legs straight up", "Hold for 30-60 seconds"]
  },
  Traingle: {
    description: "A standing pose that stretches and strengthens the entire body.",
    benefits: ["Stretches legs, groins, and spine", "Strengthens thighs, knees, and ankles", "Improves balance"],
    instructions: ["Stand with feet wide apart", "Turn right foot out 90 degrees", "Reach right hand toward floor", "Extend left arm up", "Hold for 30-60 seconds"]
  },
  Mountain: {
    description: "A foundational standing pose that promotes proper alignment and awareness.",
    benefits: ["Improves posture", "Strengthens thighs, knees, and ankles", "Increases awareness of breath"],
    instructions: ["Stand with feet together", "Distribute weight evenly", "Lengthen spine", "Relax arms at sides", "Hold for 30-60 seconds"]
  },
  Child: {
    description: "A restorative pose that calms the mind and stretches the back.",
    benefits: ["Calms the nervous system", "Stretches hips, thighs, and ankles", "Relieves stress and fatigue"],
    instructions: ["Kneel on floor", "Touch big toes together", "Sit back on heels", "Fold forward with arms extended", "Hold for 30 seconds to 3 minutes"]
  },
  Bridge: {
    description: "A backbend that strengthens the back and opens the chest.",
    benefits: ["Strengthens back, glutes, and legs", "Opens chest and hip flexors", "Calms the mind"],
    instructions: ["Lie on back with knees bent", "Place feet hip-width apart", "Lift hips toward ceiling", "Keep shoulders on ground", "Hold for 30-60 seconds"]
  },
  Plank: {
    description: "A strengthening pose that builds core stability and full-body strength.",
    benefits: ["Strengthens core, arms, and legs", "Improves posture", "Builds endurance"],
    instructions: ["Start on hands and knees", "Step feet back", "Create straight line from head to heels", "Engage core and hold", "Hold for 30-60 seconds"]
  },
  'Cat-Cow': {
    description: "A gentle flowing sequence that warms the spine and improves flexibility.",
    benefits: ["Increases spinal flexibility", "Massages abdominal organs", "Relieves back tension"],
    instructions: ["Start on hands and knees", "Arch back and look up (Cow)", "Round spine and tuck chin (Cat)", "Flow between poses", "Continue for 5-10 breaths"]
  },
  'Downward Dog': {
    description: "An inverted V-shaped pose that energizes and strengthens the whole body.",
    benefits: ["Strengthens arms and legs", "Stretches spine and hamstrings", "Energizes the body"],
    instructions: ["Start on hands and knees", "Tuck toes and lift hips", "Straighten legs", "Create inverted V shape", "Hold for 30-60 seconds"]
  }
}

export default function Poses() {
  const poseList = [
    'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
    'Shoulderstand', 'Traingle', 'Mountain', 'Child', 
    'Bridge', 'Plank', 'Cat-Cow', 'Downward Dog'
  ]

  return (
    <div className="poses-container">
      <UserHeader />
      
      <div className="poses-content">
        <div className="poses-header">
          <h1>Yoga Poses Library</h1>
          <p>Explore our collection of yoga poses with detailed instructions and benefits</p>
        </div>

        <div className="poses-grid">
          {poseList.map((pose) => (
            <div key={pose} className="pose-card">
              <div className="pose-image-container">
                <img 
                  src={poseImages[pose]} 
                  alt={`${pose} pose`}
                  className="pose-image"
                />
              </div>
              
              <div className="pose-info">
                <h3 className="pose-name">{pose} Pose</h3>
                <p className="pose-description">
                  {poseDescriptions[pose]?.description || "A beneficial yoga pose for overall wellness."}
                </p>
                
                <div className="pose-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {(poseDescriptions[pose]?.benefits || []).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="pose-instructions">
                  <h4>How to do it:</h4>
                  <ol>
                    {(poseDescriptions[pose]?.instructions || []).map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
                
                <Link to={`/start?pose=${pose}`} className="practice-pose-btn">
                  Practice This Pose
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}