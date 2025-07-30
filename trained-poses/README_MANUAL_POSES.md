# Adding Manual Poses to AI Detection

This guide explains how to convert manual yoga poses to AI-enabled poses with camera detection.

## Overview

The CalmAsana application currently has two types of poses:
1. **AI-enabled poses** - Detected by camera using pose estimation
2. **Manual poses** - Only have instructions, no camera detection

### Current AI-enabled poses:
- Tree
- Chair
- Cobra
- Warrior
- Dog (Downward Dog)
- Shoulderstand
- Triangle

### Manual poses to be converted:
- Mountain
- Child
- Bridge
- Plank
- Cat-Cow

## Process to Add Manual Poses

### 1. Collect Training Data

Run the data collection script:
```bash
python collect_pose_data.py
```

For each pose, you'll need to:
- Perform the pose in front of your webcam
- Hold the pose while moving slightly for variation
- Collect ~300 training images and ~100 test images
- The script automatically creates flipped versions for data augmentation

### 2. Process Images to Extract Keypoints

Run the preprocessing script to extract pose keypoints using MoveNet:
```bash
python proprocessing.py
```

This will:
- Load images from `yoga_poses/train` and `yoga_poses/test`
- Use MoveNet to detect 17 keypoints for each pose
- Generate CSV files with keypoint coordinates
- Create `train_data.csv` and `test_data.csv`

### 3. Train the Classification Model

Run the updated training script:
```bash
python training_all_poses.py
```

This will:
- Load the CSV files with all poses (existing + new)
- Normalize the keypoint data
- Train a neural network classifier
- Save the model in TensorFlow.js format

### 4. Update the Frontend

The frontend files have been updated to include the new poses:
- `Yoga.js` - Added new poses to poseList and CLASS_NO mapping
- Copy the new model files to the frontend:
  ```bash
  cp model/model.json ../frontend/public/model.json
  cp model/group1-shard1of1.bin ../frontend/public/group1-shard1of1.bin
  ```

## Quick Setup

Run the setup script for a guided process:
```bash
python setup_manual_poses.py
```

## Testing

1. Start the frontend application
2. Navigate to the Yoga page
3. Select one of the new poses from the dropdown
4. Click "Start Pose" and perform the pose
5. The skeleton should turn green when the pose is detected correctly

## Troubleshooting

### Pose not detected properly
- Collect more training data with varied angles and lighting
- Ensure good lighting when collecting data
- Try adjusting the detection threshold (currently 0.97 in Yoga.js)

### Model accuracy issues
- Increase training epochs in training_all_poses.py
- Collect more diverse training samples
- Check that keypoints are being detected properly in your images

### Frontend not loading new poses
- Clear browser cache
- Ensure model files are copied to frontend/public/
- Check browser console for errors

## Technical Details

### Pose Detection Pipeline
1. **MoveNet** - Detects 17 keypoints (nose, eyes, shoulders, elbows, wrists, hips, knees, ankles)
2. **Normalization** - Keypoints are normalized relative to pose center and size
3. **Classification** - Neural network classifies normalized keypoints into pose categories
4. **Frontend** - Real-time detection with visual feedback (green skeleton)

### Model Architecture
- Input: 34 features (17 keypoints × 2 coordinates)
- Hidden layers: 128 neurons → 64 neurons (with dropout)
- Output: 13 classes (including no_pose)
- Activation: ReLU6 for hidden layers, Softmax for output

## Adding More Poses in the Future

To add additional poses:
1. Add the pose name to `MANUAL_POSES` in collect_pose_data.py
2. Collect training data for the new pose
3. Update `CLASS_NO` mapping in training_all_poses.py and Yoga.js
4. Add pose to `poseList` in Yoga.js
5. Add pose instructions to `poseInstructions` in data/index.js
6. Retrain the model and update frontend