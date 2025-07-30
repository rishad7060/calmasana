import cv2
import os
import time
import numpy as np
from datetime import datetime

# List of manual poses to collect data for
MANUAL_POSES = ['mountain', 'child', 'bridge', 'plank', 'cat_cow']

class PoseDataCollector:
    def __init__(self, output_dir='yoga_poses'):
        self.output_dir = output_dir
        self.train_dir = os.path.join(output_dir, 'train')
        self.test_dir = os.path.join(output_dir, 'test')
        
        # Create directories if they don't exist
        for pose in MANUAL_POSES:
            os.makedirs(os.path.join(self.train_dir, pose), exist_ok=True)
            os.makedirs(os.path.join(self.test_dir, pose), exist_ok=True)
    
    def collect_pose_data(self, pose_name, num_train_samples=300, num_test_samples=100):
        """Collect training and test data for a specific pose"""
        print(f"\n=== Collecting data for {pose_name.upper()} pose ===")
        print(f"We'll collect {num_train_samples} training samples and {num_test_samples} test samples")
        print("\nInstructions:")
        print("1. Get into the pose position")
        print("2. Press SPACE to start capturing")
        print("3. Hold the pose and move slightly for variation")
        print("4. Press 'q' to quit early")
        
        # Initialize webcam
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Wait for camera to initialize
        time.sleep(2)
        
        # Collect training data
        print(f"\n--- Collecting TRAINING data ---")
        self._collect_samples(cap, pose_name, self.train_dir, num_train_samples, "train")
        
        # Short break
        print("\nTake a 30 second break before collecting test data...")
        time.sleep(30)
        
        # Collect test data
        print(f"\n--- Collecting TEST data ---")
        self._collect_samples(cap, pose_name, self.test_dir, num_test_samples, "test")
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"\n✓ Data collection complete for {pose_name}")
    
    def _collect_samples(self, cap, pose_name, base_dir, num_samples, data_type):
        """Collect samples for either training or test"""
        pose_dir = os.path.join(base_dir, pose_name)
        
        # Get existing file count to continue numbering
        existing_files = [f for f in os.listdir(pose_dir) if f.endswith('.jpg')]
        start_idx = len(existing_files) // 2  # Divide by 2 because we save flipped versions too
        
        collected = 0
        capturing = False
        
        while collected < num_samples:
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Display info on frame
            display_frame = frame.copy()
            cv2.putText(display_frame, f"Pose: {pose_name.upper()} ({data_type})", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(display_frame, f"Collected: {collected}/{num_samples}", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            if capturing:
                cv2.putText(display_frame, "CAPTURING... Hold the pose!", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Save frame
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{pose_name}_{data_type}_{start_idx + collected:04d}.jpg"
                filepath = os.path.join(pose_dir, filename)
                
                # Save original
                cv2.imwrite(filepath, frame)
                
                # Save flipped version for data augmentation
                flipped_frame = cv2.flip(frame, 1)
                flipped_filename = f"{pose_name}_{data_type}_{start_idx + collected:04d}_flipped.jpg"
                flipped_filepath = os.path.join(pose_dir, flipped_filename)
                cv2.imwrite(flipped_filepath, flipped_frame)
                
                collected += 1
                
                # Small delay between captures
                time.sleep(0.1)
            else:
                cv2.putText(display_frame, "Press SPACE to start capturing", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            
            cv2.imshow('Pose Data Collection', display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord(' '):
                capturing = not capturing
            elif key == ord('q'):
                break
    
    def collect_all_poses(self):
        """Collect data for all manual poses"""
        print("=== YOGA POSE DATA COLLECTION ===")
        print("This tool will help you collect training data for manual poses")
        print(f"Poses to collect: {', '.join(MANUAL_POSES)}")
        
        for i, pose in enumerate(MANUAL_POSES):
            print(f"\n[{i+1}/{len(MANUAL_POSES)}] Next pose: {pose.upper()}")
            input("Press ENTER when ready to start collecting data for this pose...")
            self.collect_pose_data(pose)
            
            if i < len(MANUAL_POSES) - 1:
                print("\nTake a 1 minute break before the next pose...")
                time.sleep(60)
        
        print("\n✓ All pose data collection complete!")
        print("\nNext steps:")
        print("1. Run proprocessing.py to generate CSV files with keypoints")
        print("2. Run training.py to retrain the model with new poses")

if __name__ == "__main__":
    collector = PoseDataCollector()
    
    print("\nOptions:")
    print("1. Collect data for all manual poses")
    print("2. Collect data for a specific pose")
    
    choice = input("\nEnter your choice (1 or 2): ")
    
    if choice == '1':
        collector.collect_all_poses()
    elif choice == '2':
        print(f"\nAvailable poses: {', '.join(MANUAL_POSES)}")
        pose = input("Enter pose name: ").lower()
        if pose in MANUAL_POSES:
            collector.collect_pose_data(pose)
        else:
            print(f"Invalid pose name. Choose from: {', '.join(MANUAL_POSES)}")
    else:
        print("Invalid choice")