import React from 'react'

import './About.css'

export default function About() {
    return (
        <div className="about-container">
            <h1 className="about-heading">About</h1>
            <div className="about-main">
                <p className="about-content">
                    This is a realtime AI based Yoga Trainer which detects your pose and evaluates how well you are doing.
                    This project has been developed as part of a university group project. It has been deployed
                    so people can use it and developers who are learning AI can learn 
                    from this project and make their own AI or they can also contribute improvements.
                    This is an open source project, and the code is available on GitHub.
                    
                    This AI first predicts keypoints or coordinates of different parts of the body (basically where
                    they are present in an image) and then it uses another classification model to classify the poses. If 
                    someone is doing a pose and the AI detects that pose with more than 95% probability, it will notify you are 
                    doing correctly (by making the virtual skeleton green). We have used Tensorflow pretrained Movenet Model to predict the 
                    keypoints and built a neural network on top of that which uses these coordinates to classify yoga poses.

                    The model was trained in Python, and thanks to TensorflowJS we can leverage the support of the browser, so we converted 
                    the keras/tensorflow model to TensorflowJS.
                </p>
                <div className="developer-info">
                    <h4>About Developers</h4>
                    <p className="about-content">
                        This project was developed by students from the UWU IIT 16th batch as a university group project.
                        We are computer science students passionate about AI and web development.
                    </p>
                    <h4>Contact</h4>
                    <p className="about-content">UWU IIT 16th Batch</p>
                </div>
            </div>
        </div>
    )
}
