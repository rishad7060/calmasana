Here’s your **GitHub-style README** for CalmAsana, adapted from your full project documentation but formatted and condensed to fit GitHub best practices. It captures all key features, setup instructions, and technologies:

---

# 🧘‍♀️ CalmAsana - AI-Powered Yoga Training App

**CalmAsana** is a smart, AI-driven yoga trainer that offers **real-time feedback**, **personalized yoga plans**, and **comprehensive progress tracking** — all in your web browser. Think of it as your personal yoga coach that sees your poses through the webcam and guides you like a real instructor.

> ✨ *Built with TensorFlow\.js, React, and Firebase – powered by AI & MoveNet.*

---

## 🚀 Features

* 🎯 **AI Pose Detection** – Real-time feedback using your camera with green skeleton overlays
* 🧘‍♂️ **Personalized Practice Plans** – Gemini AI generates custom yoga sessions based on your health and goals
* 📊 **Progress Tracking** – Stats, trends, and streaks to monitor improvement
* 🏆 **Achievement System** – Gamified milestones and badges for motivation
* 🔐 **Secure Authentication** – User sign-in and data storage via Firebase
* 🌈 **Beautiful Interface** – Responsive UI for web and mobile screens
* 🎵 **Optional Voice & Music Feedback** – Immersive experience during sessions
* 📄 **PDF Reports** – Export your session summaries

---

## 🛠️ Tech Stack

### 🔷 Frontend

* **React.js**
* **TensorFlow\.js** (`@tensorflow/tfjs`, `@tensorflow-models/pose-detection`)
* **Firebase Auth & Firestore**
* **React Router, react-webcam**

### 🔶 Backend/AI (Local)

* **Python** (for training ML model)
* **TensorFlow & Keras**
* **MoveNet (pose detection model)**
* **OpenCV, NumPy, Pandas**

---

## 📦 Installation & Setup

### 🔧 Prerequisites

* Node.js v14+
* Python 3.8+
* Webcam & modern browser (Chrome/Firefox)

### 💻 Frontend Setup

```bash
# Clone the repository
git clone https://github.com/rishad7060/CalmAsana.git

# Navigate to frontend
cd CalmAsana/frontend

# Install dependencies
npm install

# Run development server
npm start
```

> App will run on `http://localhost:3000`

### 🧠 AI Model (Optional - Local Training)

```bash
# Navigate to AI directory
cd ../trained-poses

# Install Python dependencies
pip install -r requirements.txt

# Collect pose data
python collect_pose_data.py

# Extract keypoints
python proprocessing.py

# Train the model
python training_all_poses.py

# Integrate model with frontend
python enable_manual_poses.py
```

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project & enable **Email/Password Auth**
3. Create a **Firestore Database**
4. Add your Firebase config to:
   `/frontend/src/config/firebase.js`

---

## 📂 Project Structure

```
CalmAsana/
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # UI and feedback components
│       ├── pages/       # App screens: Dashboard, Yoga, Auth, etc.
│       ├── services/    # Firebase & AI integrations
│       └── config/      # Firebase config
├── trained-poses/       # Python AI model training
│   ├── yoga_poses/      # Training images
│   ├── model/           # Exported model files (for TensorFlow.js)
│   └── *.py             # Scripts for training and integration
```

---

## 📸 Real-Time Pose Detection

* Uses **MoveNet Thunder** to detect 17 keypoints
* Classifies into 13 yoga poses using a custom neural network
* Green skeleton = correct pose
* Confidence > 95% → counts toward session stats

---

## 🤖 Supported Poses

### ✅ AI-Detected:

* Tree, Chair, Cobra, Warrior, Downward Dog
* Triangle, Shoulder Stand

### 📝 Instructional Only:

* Child's Pose, Mountain, Cat-Cow, Bridge, Plank

---

## 📈 Achievements & Analytics

* **Session Stats:** Accuracy, duration, poses hit
* **Streaks:** Daily, weekly consistency
* **Milestones:** Time-based, pose mastery
* **Progress Charts:** Visualize improvement over time



Let me know if you'd like this as a downloadable `README.md` file, or want badges (e.g. build passing, license, Firebase, etc.) added to the top.
