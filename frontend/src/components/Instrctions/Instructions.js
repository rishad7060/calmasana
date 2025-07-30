import React, { useState } from 'react'

import { poseInstructions } from '../../utils/data'

import { poseImages } from '../../utils/pose_images'

import './Instructions.css'

export default function Instructions({ currentPose }) {

    const [instructions, setInsntructions] = useState(poseInstructions)

    // Check if instructions exist for the current pose
    const currentInstructions = instructions[currentPose] || [
        'Start in a comfortable standing position',
        'Focus on your breath and maintain proper alignment',
        'Hold the pose for the recommended duration',
        'Listen to your body and modify as needed'
    ]

    // Check if image exists for the current pose
    const poseImage = poseImages[currentPose] || poseImages['Tree'] // Default to Tree pose image

    return (
        <div className="instructions-container">
            <ul className="instructions-list">
                {currentInstructions.map((instruction, index) => {
                    return(
                        <li key={index} className="instruction">{instruction}</li>
                    )
                    
                })}
            </ul>
            <img 
                className="pose-demo-img"
                src={poseImage}
                alt={`${currentPose} pose demonstration`}
            />
        </div>
    )
}
