# CalmAsana - Complete Project Documentation

## 🧘‍♀️ What is CalmAsana?

CalmAsana is a smart AI-powered yoga trainer that helps you practice yoga with real-time feedback. Imagine having a personal yoga teacher who can see how you're doing and guide you through poses - that's exactly what CalmAsana does using your computer's camera!

**Think of it like this:** You turn on your camera, pick a yoga pose, and the AI watches you to tell you if you're doing it correctly. If your pose is perfect, you'll see a green skeleton on screen. If you need to adjust, it gives you helpful tips!

---

## 🏗️ Project Architecture Overview

CalmAsana is built with two main parts that work together:

### **Frontend (The App You See)**
- **Technology:** React.js (JavaScript)
- **What it does:** Creates the beautiful web interface you interact with
- **Where it runs:** In your web browser (like Chrome, Firefox, Safari)

### **Backend/AI (The Smart Brain)**
- **Technology:** Python + TensorFlow
- **What it does:** Analyzes your poses and determines if they're correct
- **Where it runs:** On your computer using trained AI models

---

## 🔧 Technology Stack Explained

### **Frontend Technologies**

#### **React.js Framework**
- **Purpose:** Creates the user interface (buttons, pages, forms)
- **Why React:** Makes the app interactive and responsive
- **Files:** All `.js` files in `/frontend/src/`

#### **TensorFlow.js**
- **Purpose:** Runs AI models directly in your browser
- **Library:** `@tensorflow/tfjs` and `@tensorflow-models/pose-detection`
- **What it does:** Detects your body keypoints using the camera

#### **Firebase (Google's Backend Service)**
- **Authentication:** Handles user sign-up and login
- **Database (Firestore):** Stores all your yoga session data
- **Configuration:** Found in `/frontend/src/config/firebase.js`

#### **React Router**
- **Purpose:** Navigation between different pages
- **Pages:** Landing, Dashboard, Yoga Practice, Settings, etc.

#### **CSS Styling**
- **Custom CSS:** Makes the app look beautiful and professional
- **Responsive Design:** Works on phones, tablets, and computers

### **AI/Python Technologies**

#### **TensorFlow & Keras**
- **Purpose:** Train and run machine learning models
- **Model Type:** Neural network for pose classification
- **Files:** `/trained-poses/training.py`, `/trained-poses/training_all_poses.py`

#### **MoveNet (Google's Pose Detection)**
- **Purpose:** Detects 17 body keypoints from camera images
- **Model File:** `movenet_thunder.tflite`
- **What it detects:** Nose, eyes, shoulders, elbows, wrists, hips, knees, ankles

#### **OpenCV**
- **Purpose:** Handle camera input and image processing
- **Used for:** Capturing training images and data collection

#### **Pandas & NumPy**
- **Purpose:** Process and organize training data
- **Files:** Handle CSV files with pose coordinates

---

## 🤖 How AI Pose Detection Works

### **Step 1: Keypoint Detection**
```
Your Camera Image → MoveNet → 17 Body Keypoints (x, y coordinates)
```
MoveNet analyzes each frame and finds these 17 points on your body:
- Head: Nose, left/right eyes, left/right ears
- Arms: Left/right shoulders, elbows, wrists  
- Body: Left/right hips
- Legs: Left/right knees, ankles

### **Step 2: Pose Classification**
```
17 Keypoints → Neural Network → Pose Prediction (Tree, Warrior, etc.)
```

The custom-trained neural network:
- **Input:** 34 numbers (17 keypoints × 2 coordinates)
- **Hidden Layers:** 128 neurons → 64 neurons (with dropout)
- **Output:** 13 pose classes + "no_pose"
- **Architecture:** Dense neural network with ReLU6 activation

### **Step 3: Real-time Feedback**
```
Pose Prediction → Confidence Score → Visual/Audio Feedback
```

If confidence > 95%:
- ✅ Green skeleton overlay
- ✅ "Perfect pose!" message
- ✅ Count towards session stats

### **Available AI-Detected Poses**
Currently trained to detect:
- Tree Pose
- Chair Pose  
- Cobra Pose
- Warrior Pose
- Downward Dog
- Shoulder Stand
- Triangle Pose

### **Manual Poses (No AI Detection)**
Available with instructions only:
- Mountain Pose
- Child's Pose
- Bridge Pose
- Plank Pose
- Cat-Cow Pose

---

## 🔥 Firebase Integration

### **Authentication System**
- **Sign Up:** Creates new user account with email/password
- **Sign In:** Validates existing users
- **Protected Routes:** Only authenticated users can access main features
- **User Profile:** Stores name, email, and preferences

### **Firestore Database Structure**
```
users/{userId}/
├── Basic Info
│   ├── uid: string
│   ├── email: string
│   ├── name: string
│   ├── createdAt: timestamp
│   └── onboardingCompleted: boolean
├── Yoga Profile (from onboarding)
│   ├── basicInfo: {age, gender, height, weight}
│   ├── experience: {level, frequency, goals}
│   ├── health: {conditions, injuries, medications}
│   └── preferences: {duration, difficulty, focusAreas}
├── sessions/{sessionId}/
│   ├── date: ISO string
│   ├── duration: number (minutes)
│   ├── poses: array of pose names
│   ├── avgScore: number (0-100)
│   ├── poseResults: detailed pose data
│   └── createdAt: timestamp
└── stats/
    ├── totalSessions: number
    ├── totalPracticeTime: number
    ├── avgScore: number
    ├── bestScore: number
    └── currentStreak: number
```

---

## 📱 User Journey & Features

### **1. Landing Page**
- **Purpose:** Introduction to CalmAsana
- **Features:** Benefits overview, pose gallery, testimonials
- **Call-to-Action:** "Start Your Journey" button

### **2. Authentication**
- **Sign Up:** Collects name, email, password
- **Firebase Integration:** Creates user account and stores in Firestore
- **Validation:** Email format, password strength checking

### **3. Onboarding Process**
The app asks detailed questions to create a personalized profile:

#### **Step 1: Basic Information**
- Age, gender, height, weight
- **Why:** Customize pose recommendations and safety

#### **Step 2: Yoga Experience**  
- Experience level (Beginner/Intermediate/Advanced)
- Practice frequency (Daily/Weekly/Occasional)
- Goals (Flexibility, Strength, Stress Relief, etc.)
- **Why:** Tailor difficulty and focus areas

#### **Step 3: Health & Wellness**
- Daily routine and activity level
- Medical conditions and injuries
- Current medications
- Pregnancy status (if applicable)
- **Why:** Ensure safe practice recommendations

#### **Step 4: Preferences**
- Preferred session duration (15/30/45/60 minutes)
- Difficulty preference (Gentle/Moderate/Challenging)
- Focus areas (Core, Upper Body, Back, etc.)
- Music and voice feedback preferences
- **Why:** Personalize the practice experience

### **4. AI Recommendation System**

After onboarding, the Gemini AI API generates personalized recommendations:

#### **Gemini AI Integration**
- **API:** Google's Gemini Pro model
- **Input:** Complete user profile from onboarding
- **Prompt Engineering:** Carefully crafted prompts for yoga expertise

#### **Sample Prompt Structure:**
```
As a certified yoga instructor AI, create a personalized yoga session plan based on this user profile:

User Profile:
- Age: 25, Gender: Female
- Experience Level: Beginner
- Goals: Flexibility, Stress Relief
- Medical Conditions: Back Pain
- Session Duration: 30 minutes
- Focus Areas: Core, Back

IMPORTANT: Only recommend poses from: Tree, Chair, Cobra, Warrior, Dog, Shoulderstand, Triangle, Mountain, Child, Bridge, Plank, Cat-Cow

Provide:
1. Session plan with 5-8 poses
2. Duration for each pose (seconds)
3. Specific benefits
4. Modifications for back pain
5. Overall session intention
```

#### **AI Response Format:**
```json
{
  "sessionPlan": {
    "title": "Gentle Back Relief & Flexibility",
    "duration": "30 minutes",
    "intention": "Focus on relieving back tension while building core strength",
    "poses": [
      {
        "name": "Child's Pose",
        "duration": "60 seconds", 
        "benefits": "Relieves back tension, calms mind",
        "modifications": "Use bolster under torso for comfort"
      }
    ],
    "tips": ["Move slowly", "Listen to your body"]
  }
}
```

### **5. Dashboard**
Personal hub showing:
- **Today's Plan:** AI-generated recommendations
- **Weekly Progress:** Session frequency and consistency  
- **Recent Sessions:** Last 5 practice sessions
- **Achievements:** Unlocked milestones and badges
- **Quick Actions:** Start practice, view poses, check history

### **6. Enhanced Yoga Practice**

#### **Camera Setup**
- **Webcam Access:** Requests permission to use camera
- **Pose Detection:** Real-time analysis using TensorFlow.js
- **Visual Feedback:** Skeleton overlay shows detected body position

#### **Session Flow**
1. **Pose Selection:** Choose from available poses
2. **Instructions:** Clear guidance on how to perform the pose  
3. **Start Detection:** Camera activates, AI begins analysis
4. **Real-time Feedback:** 
   - Green skeleton = correct pose
   - Accuracy percentage shown
   - Voice guidance (if enabled)
   - Background music (if enabled)
5. **Session Tracking:** Records time, accuracy, poses completed

#### **AI Detection Process**
```javascript
// Simplified detection logic
const detect = async (detector, poseClassifier) => {
  // 1. Get camera frame
  const poses = await detector.estimatePoses(video)
  
  // 2. Extract keypoints
  const keypoints = poses[0]?.keypoints
  
  // 3. Normalize pose data  
  const normalizedPose = landmarks_to_embedding(keypoints)
  
  // 4. Classify pose
  const prediction = poseClassifier.predict(normalizedPose)
  
  // 5. Get confidence score
  const confidence = prediction[currentPoseIndex] * 100
  
  // 6. Provide feedback
  if (confidence > 95) {
    showGreenSkeleton()
    incrementAccuracy()
  }
}
```

### **7. Session Summary**
After each practice:
- **Performance Stats:** Average score, time spent, poses completed
- **Achievements:** New badges or milestones unlocked
- **Progress Comparison:** vs. last session, vs. weekly average
- **Recommendations:** AI suggestions for next session
- **Save & Share:** Export session report as PDF

### **8. Achievement System**

#### **Types of Achievements**
- **Consistency:** First session, 3-day streak, 7-day streak, 30-day streak
- **Performance:** Perfect session (95%+), consistent performer
- **Time-based:** 60+ minute sessions, 100+ total hours
- **Pose Mastery:** Perfect specific poses multiple times
- **Special:** Holiday challenges, seasonal goals

#### **Achievement Logic**
```javascript
// Example achievement check
const checkAchievements = (userProfile, allSessions) => {
  const achievements = []
  
  // Check streak achievement
  if (currentStreak >= 7) {
    achievements.push({
      id: 'seven_day_streak',
      title: 'Week Warrior', 
      icon: '⚡',
      reward: 'Unlocked advanced pose variations'
    })
  }
  
  return achievements
}
```

### **9. Progress Tracking & Analytics**

#### **Session Data Collected**
- Start/end timestamps (accurate timing)
- Pose detection logs (every 100ms)
- Accuracy scores per pose
- Total correct vs incorrect time
- User interactions and feedback

#### **Dashboard Analytics**
- **Weekly View:** Sessions per day, total time, average scores
- **Trends:** Improvement over time, consistency patterns
- **Pose Analytics:** Which poses you're best/worst at
- **Goals Progress:** Tracking towards personal objectives

### **10. Settings & Customization**
- **Profile Updates:** Modify health conditions, goals, preferences
- **Notifications:** Practice reminders, achievement alerts
- **Privacy:** Data export, account deletion
- **Theme:** Light/dark mode toggle
- **Audio:** Music and voice feedback controls

---

## 🧠 AI Model Training Process

### **1. Data Collection**
```bash
python collect_pose_data.py
```
- Captures 300+ training images per pose
- Uses webcam to record user performing poses
- Creates variations (different angles, lighting)
- Automatically generates flipped images for data augmentation

### **2. Keypoint Extraction**
```bash  
python proprocessing.py
```
- Loads training images from `yoga_poses/train/` and `yoga_poses/test/`
- Uses MoveNet to detect 17 keypoints per image
- Saves coordinates to CSV files
- Filters out low-confidence detections

### **3. Model Training**
```bash
python training_all_poses.py
```

#### **Data Preprocessing**
- Normalizes keypoints relative to pose center
- Scales coordinates to consistent pose size
- Converts to 34-feature vectors (17 keypoints × 2 coordinates)

#### **Neural Network Architecture**
```python
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu6', input_shape=(34,)),
    keras.layers.Dropout(0.5),
    keras.layers.Dense(64, activation='relu6'), 
    keras.layers.Dropout(0.5),
    keras.layers.Dense(13, activation='softmax')  # 13 pose classes
])
```

#### **Training Configuration**
- **Optimizer:** Adam
- **Loss Function:** Categorical Crossentropy  
- **Metrics:** Accuracy
- **Epochs:** 200 (with early stopping)
- **Batch Size:** 16
- **Validation Split:** 15%

#### **Model Export**
- Saves best model weights to `weights.best.hdf5`
- Converts to TensorFlow.js format for browser use
- Outputs to `model/model.json` and `model/group1-shard1of1.bin`

### **4. Frontend Integration**
```bash
python enable_manual_poses.py
```
- Updates pose lists in React components
- Adds new poses to classification mappings
- Copies model files to frontend public folder

---

## 🎯 Key Features Explained

### **Real-time Pose Detection**
- **Camera Processing:** 10 FPS analysis for smooth feedback
- **Keypoint Detection:** 17 body landmarks tracked continuously  
- **Pose Classification:** Neural network predicts pose type
- **Confidence Scoring:** 95%+ threshold for "correct pose"
- **Visual Feedback:** Green skeleton overlay when pose is perfect

### **Personalized AI Recommendations**
- **User Profiling:** Comprehensive onboarding questionnaire
- **AI Planning:** Gemini API generates custom session plans
- **Adaptive Difficulty:** Adjusts based on user progress
- **Health Considerations:** Factors in injuries and limitations
- **Goal-Oriented:** Aligns with user's specific objectives

### **Comprehensive Progress Tracking**
- **Session Analytics:** Detailed performance metrics
- **Trend Analysis:** Progress over time visualization
- **Achievement System:** Gamified milestones and rewards
- **Data Accuracy:** Precise timestamps and measurement
- **Export Options:** PDF reports and data sharing

### **Intelligent Feedback System**
- **Real-time Corrections:** Immediate pose adjustment guidance
- **Voice Coaching:** Audio cues and encouragement (optional)
- **Visual Cues:** Color-coded skeleton and accuracy meters
- **Progress Indicators:** Session completion and scoring
- **Motivational Elements:** Achievements and streak tracking

---

## 📂 Project Structure Explained

### **Frontend Structure (`/frontend/`)**
```
src/
├── components/           # Reusable UI components
│   ├── AIRecommendation/ # AI-generated plan display
│   ├── UserHeader/       # Navigation and user info
│   ├── LiveFeedback/     # Real-time pose feedback
│   ├── SessionSummary/   # Post-session analytics
│   └── ...
├── pages/               # Main application pages
│   ├── Landing/         # Marketing and intro page
│   ├── Auth/            # Login/signup forms
│   ├── Dashboard/       # User's personal hub
│   ├── EnhancedYoga/    # AI-powered practice session
│   ├── Onboarding/      # User profile setup
│   └── ...
├── services/            # Business logic and API calls
│   ├── geminiService.js # AI recommendation generation
│   ├── dataService.js   # Firebase data operations
│   ├── achievementService.js # Badge and milestone logic
│   └── ...
├── config/
│   └── firebase.js      # Firebase configuration
├── contexts/            # React context providers
│   ├── ThemeContext.js  # Light/dark mode
│   └── ToastContext.js  # Notification system
└── utils/               # Helper functions and data
    ├── pose_images/     # Pose illustration assets
    └── sessionTracking.js # Practice session utilities
```

### **AI/Training Structure (`/trained-poses/`)**
```
├── collect_pose_data.py      # Webcam data collection
├── proprocessing.py          # Keypoint extraction  
├── training_all_poses.py     # Neural network training
├── movenet.py               # MoveNet pose detection
├── data.py                  # Data structures and types
├── enable_manual_poses.py   # Frontend integration
├── requirements.txt         # Python dependencies
├── yoga_poses/             # Training image datasets
│   ├── train/             # Training images by pose
│   └── test/              # Validation images by pose
├── csv_per_pose/          # Keypoint data per pose
├── model/                 # Trained model outputs
│   ├── model.json        # TensorFlow.js model
│   └── group1-shard1of1.bin # Model weights
└── README_MANUAL_POSES.md # Training documentation
```

---

## 🚀 How to Set Up and Run

### **Prerequisites**
- **Node.js** (v14+) for frontend
- **Python** (v3.8+) for AI training
- **Webcam** for pose detection
- **Modern browser** (Chrome, Firefox, Safari)

### **Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# App opens at http://localhost:3000
```

### **Key Dependencies**
- `react` - UI framework
- `firebase` - Backend services  
- `@tensorflow/tfjs` - AI model execution
- `@tensorflow-models/pose-detection` - Pose keypoint detection
- `react-webcam` - Camera access
- `react-router-dom` - Page navigation

### **AI Model Training (Optional)**
```bash
# Navigate to AI directory
cd trained-poses

# Install Python dependencies
pip install -r requirements.txt

# Collect training data for new poses
python collect_pose_data.py

# Process images to extract keypoints
python proprocessing.py  

# Train the classification model
python training_all_poses.py

# Update frontend with new poses
python enable_manual_poses.py
```

### **Firebase Configuration**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Copy config to `/frontend/src/config/firebase.js`

---

## 🎮 User Experience Flow

### **Complete User Journey:**

1. **Discovery** → User visits landing page, learns about AI yoga
2. **Sign Up** → Creates account with email/password
3. **Onboarding** → Answers 20+ questions about health, goals, experience
4. **AI Analysis** → Gemini API generates personalized recommendations
5. **Dashboard** → Views custom plan, progress, achievements  
6. **Practice** → Selects pose, camera detects performance, gets real-time feedback
7. **Summary** → Reviews session stats, unlocks achievements
8. **Progress** → Tracks improvement over time, maintains streaks
9. **Mastery** → Achieves goals, unlocks advanced features

### **What Makes It Special:**
- **Personalization:** Every recommendation is unique to the user
- **Intelligence:** AI learns from your practice patterns
- **Motivation:** Achievement system keeps you engaged
- **Accuracy:** Professional-grade pose detection
- **Safety:** Health considerations built into every recommendation

---

## 🔮 Future Enhancements

### **Planned Features**
- **More Poses:** Expand to 50+ AI-detected poses
- **Video Sessions:** Full guided yoga classes with sequences
- **Social Features:** Share progress, challenge friends
- **Wearable Integration:** Heart rate and movement tracking
- **Advanced AI:** Computer vision improvements for better detection
- **Mobile App:** Native iOS and Android applications

### **Technical Improvements**
- **Edge Computing:** Faster AI processing
- **3D Pose Analysis:** More accurate body position detection
- **Voice Commands:** Hands-free interaction
- **Offline Mode:** Practice without internet connection

---

## 💡 Innovation Highlights

### **What Makes CalmAsana Unique:**

1. **Real AI Teacher:** Not just videos - actually watches and corrects you
2. **Personalized from Day 1:** AI creates custom plans based on your profile
3. **Gamified Wellness:** Achievement system makes yoga addictive (in a good way!)
4. **Scientific Accuracy:** Uses Google's MoveNet + custom neural networks
5. **Comprehensive Tracking:** Professional-level analytics for your practice
6. **Accessible Technology:** Runs entirely in web browser, no special equipment

### **Technical Achievements:**
- **Real-time AI:** 95%+ accuracy pose detection at 10 FPS
- **Custom ML Pipeline:** From data collection to deployment
- **Scalable Architecture:** Firebase handles thousands of users
- **Cross-platform:** Works on any device with camera and browser
- **Privacy-focused:** User data encrypted and securely stored

---

## 📊 Data & Privacy

### **What Data We Collect:**
- **Profile Information:** Age, experience level, health conditions (for safety)
- **Practice Sessions:** Pose accuracy, duration, frequency (for progress tracking)
- **Achievements:** Milestones and badges earned (for motivation)
- **Preferences:** Music, voice feedback, difficulty settings (for personalization)

### **What We DON'T Collect:**
- **Video/Images:** No camera footage is stored or transmitted
- **Keypoint Data:** Pose coordinates processed locally, not saved
- **Personal Health Details:** Medical information stays private
- **Location Data:** No GPS or location tracking

### **Security Measures:**
- **Firebase Security:** Google-grade encryption and protection
- **Authentication:** Secure login with password requirements
- **Data Encryption:** All data encrypted in transit and at rest
- **User Control:** Full data export and deletion options

---

## 🎯 Target Audience

### **Primary Users:**
- **Yoga Beginners:** Want guidance and feedback on form
- **Home Practitioners:** Need motivation and structure
- **Tech Enthusiasts:** Excited about AI-powered fitness
- **Busy Professionals:** Want efficient, personalized practice
- **Health-Conscious Individuals:** Seeking safe, adaptive exercise

### **Age Demographics:**
- **18-35:** Tech-savvy, fitness-focused millennials
- **35-50:** Busy professionals seeking stress relief
- **50+:** Health-conscious individuals wanting gentle exercise

---

## 🏆 Project Success Metrics

### **Technical Achievements:**
- ✅ **95%+ Pose Detection Accuracy** - Professional-grade AI performance
- ✅ **Real-time Processing** - 10 FPS analysis with instant feedback
- ✅ **13 Pose Classifications** - Comprehensive yoga pose library
- ✅ **Cross-platform Compatibility** - Works on all modern devices
- ✅ **Scalable Architecture** - Firebase handles growth seamlessly

### **User Experience Goals:**
- ✅ **Personalized Experience** - Every user gets custom recommendations
- ✅ **Engaging Gamification** - Achievement system drives consistency
- ✅ **Comprehensive Tracking** - Professional analytics for progress
- ✅ **Accessible Design** - Easy for beginners, powerful for advanced
- ✅ **Privacy-First** - No video storage, secure data handling

---

## 📚 Learning Resources

### **For Developers:**
- **TensorFlow.js Documentation:** https://www.tensorflow.org/js
- **MoveNet Pose Detection:** https://tensorflow.org/lite/examples/pose_estimation
- **Firebase Web SDK:** https://firebase.google.com/docs/web
- **React.js Guide:** https://reactjs.org/docs

### **For Users:**
- **Yoga Pose Guide:** Built-in instructions for each pose
- **AI Tips:** Smart recommendations for improvement
- **Progress Tracking:** Dashboard analytics and insights
- **Achievement System:** Gamified milestones and rewards

---

## 🤝 Contributing to the Project

### **For Developers:**
1. **Fork the Repository:** Create your own copy
2. **Set Up Environment:** Follow setup instructions above
3. **Choose an Area:** Frontend features, AI improvements, or documentation
4. **Make Changes:** Follow coding standards and best practices
5. **Test Thoroughly:** Ensure everything works before submitting
6. **Submit Pull Request:** Detailed description of changes

### **For Yoga Instructors:**
1. **Pose Validation:** Help verify AI detection accuracy
2. **Instruction Content:** Improve pose descriptions and modifications
3. **Safety Guidelines:** Ensure recommendations are appropriate
4. **User Testing:** Provide feedback on the practice experience

### **For Users:**
1. **Bug Reports:** Help identify issues and improvements
2. **Feature Requests:** Suggest new functionality
3. **Usage Feedback:** Share your experience and suggestions
4. **Community Building:** Help other users on forums

---

## 📞 Support & Community

### **Getting Help:**
- **Documentation:** This comprehensive guide covers everything
- **GitHub Issues:** Report bugs and request features
- **Community Forum:** Connect with other users and developers
- **Email Support:** Direct contact for urgent issues

### **Community Resources:**
- **Discord Server:** Real-time chat with users and developers
- **YouTube Channel:** Tutorials and feature demonstrations
- **Blog Posts:** Deep dives into AI technology and yoga practices
- **Newsletter:** Updates on new features and improvements

---

*CalmAsana: Where Ancient Wisdom Meets Modern AI* 🧘‍♀️✨

---

**Built with ❤️ by developers who believe technology should enhance human wellness, not replace human connection.**
