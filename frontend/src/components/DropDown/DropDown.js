import React from 'react'

import { poseImages } from '../../utils/pose_images'
import { AI_SUPPORTED_POSES } from '../../services/geminiService'

import './DropDown.css'

export default function DropDown({ poseList, currentPose, setCurrentPose }) {
  console.log('DropDown rendering with poseList:', poseList, 'currentPose:', currentPose)
  
  return (
        <div className='dropdown dropdown-container'>
        <button 
            className="btn btn-secondary dropdown-toggle"
            type='button'
            data-bs-toggle="dropdown"
            id="pose-dropdown-btn"
            aria-expanded="false"
        >{currentPose}
        </button>
        <ul className="dropdown-menu dropdown-custom-menu" aria-labelledby="pose-dropdown-btn">
            {poseList.map((pose, index) => (
                <li key={index} onClick={() => setCurrentPose(pose)}>
                    <div className="dropdown-item-container">
                        <div className="pose-info-section">
                          <p className="dropdown-item-1">{pose}</p>
                          <span className={`pose-mode-badge ${AI_SUPPORTED_POSES.includes(pose) ? 'ai-mode' : 'manual-mode'}`}>
                            {AI_SUPPORTED_POSES.includes(pose) ? '🤖 AI' : '⏱️ Manual'}
                          </span>
                        </div>
                        <img 
                            src={poseImages[pose]}
                            className="dropdown-img"
                            alt={`${pose} pose`}
                        />
                        
                    </div>
                </li>
            ))}
            
        </ul>
      </div>
    )
}
 