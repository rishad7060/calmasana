"""
FAST Data Collection for Manual Poses
Optimized version that collects data much faster with better guidance
"""

import cv2
import os
import time
import numpy as np

# Poses with detailed instructions for quick setup
POSES_GUIDE = {
    'mountain': {
        'name': 'Mountain Pose',
        'setup': 'Stand straight, feet together, arms at sides',
        'key_points': 'Keep spine straight, shoulders relaxed',
        'samples': 30  # Reduced for speed
    },
    'child': {
        'name': 'Child Pose',
        'setup': 'Kneel, sit on heels, fold forward with arms extended',
        'key_points': 'Forehead can touch ground, arms stretched forward',
        'samples': 30
    },
    'bridge': {
        'name': 'Bridge Pose', 
        'setup': 'Lie on back, knees bent, lift hips up',
        'key_points': 'Keep feet flat, squeeze glutes, lift hips high',
        'samples': 30
    },
    'plank': {
        'name': 'Plank Pose',
        'setup': 'Hold push-up position, straight line head to heels',
        'key_points': 'Keep core tight, don\'t let hips sag',
        'samples': 30
    },
    'cat_cow': {
        'name': 'Cat-Cow Pose',
        'setup': 'On hands and knees, arch and round back',
        'key_points': 'Alternate between arched (cow) and rounded (cat) back',
        'samples': 40  # More samples since it's a moving pose
    }
}

class FastPoseCollector:
    def __init__(self):
        self.cap = None
        
    def initialize_camera(self):
        """Initialize camera with optimal settings"""
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("ERROR: Cannot open camera")
            return False
            
        # Set camera properties for better performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Let camera warm up
        print("Initializing camera...")
        time.sleep(2)
        return True
    
    def collect_pose_fast(self, pose_key, pose_info):
        """Fast collection with auto-capture"""
        print(f"\n{'='*60}")
        print(f"COLLECTING: {pose_info['name'].upper()}")
        print(f"{'='*60}")
        print(f"Setup: {pose_info['setup']}")
        print(f"Tips: {pose_info['key_points']}")
        print(f"Samples needed: {pose_info['samples']} training + {pose_info['samples']//2} test")
        
        input("\nPress ENTER when you're ready to start...")
        
        # Collect training data
        print(f"\n--- TRAINING DATA ({pose_info['samples']} samples) ---")
        success = self._fast_capture(pose_key, 'train', pose_info['samples'])
        if not success:
            return False
            
        print("\nShort break...")
        time.sleep(5)
        
        # Collect test data
        print(f"\n--- TEST DATA ({pose_info['samples']//2} samples) ---")
        success = self._fast_capture(pose_key, 'test', pose_info['samples']//2)
        
        print(f"\n✓ {pose_info['name']} complete!")
        return success
    
    def _fast_capture(self, pose_key, data_type, num_samples):
        """Fast auto-capture with countdown"""
        base_dir = f'yoga_poses/{data_type}/{pose_key}'
        os.makedirs(base_dir, exist_ok=True)
        
        # Get existing files count
        existing = [f for f in os.listdir(base_dir) if f.endswith('.jpg')]
        start_idx = len(existing) // 2
        
        print(f"\nGet into {POSES_GUIDE[pose_key]['name']}")
        print("Auto-capture will start in 5 seconds...")
        
        # Countdown
        for i in range(5, 0, -1):
            print(f"{i}...")
            time.sleep(1)
        
        print("CAPTURING - Hold the pose and move slightly for variation!")
        
        collected = 0
        while collected < num_samples:
            ret, frame = self.cap.read()
            if not ret:
                print("Camera error")
                return False
            
            # Show progress
            display_frame = frame.copy()
            cv2.putText(display_frame, f"{POSES_GUIDE[pose_key]['name']} - {data_type.upper()}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(display_frame, f"Captured: {collected}/{num_samples}", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(display_frame, "Auto-capturing... Hold pose!", 
                       (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            cv2.imshow('Fast Data Collection', display_frame)
            
            # Save every 3rd frame for variety
            if collected * 3 < num_samples * 3:
                filename = f"{pose_key}_{data_type}_{start_idx + collected:04d}.jpg"
                filepath = os.path.join(base_dir, filename)
                cv2.imwrite(filepath, frame)
                
                # Save flipped version
                flipped = cv2.flip(frame, 1)
                flipped_filename = f"{pose_key}_{data_type}_{start_idx + collected:04d}_flipped.jpg"
                flipped_filepath = os.path.join(base_dir, flipped_filename)
                cv2.imwrite(flipped_filepath, flipped)
                
                collected += 1
                print(f"  Captured {collected}/{num_samples}")
            
            # Small delay between captures for variety
            time.sleep(0.3)
            
            # Allow early exit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print(f"\nStopped early at {collected} samples")
                break
        
        return True
    
    def collect_all_poses(self):
        """Collect data for all manual poses quickly"""
        if not self.initialize_camera():
            return False
        
        print("FAST YOGA POSE DATA COLLECTION")
        print("="*60)
        print("This optimized version will collect data for all 5 manual poses")
        print("Total time: ~10-15 minutes (much faster!)")
        print("\nTips for best results:")
        print("- Good lighting is important")
        print("- Stay in frame during capture")
        print("- Move slightly for pose variations")
        print("- Each pose takes ~2-3 minutes")
        
        failed_poses = []
        completed_poses = []
        
        for i, (pose_key, pose_info) in enumerate(POSES_GUIDE.items()):
            print(f"\n[{i+1}/5] Next: {pose_info['name']}")
            
            ready = input("Ready? (y/n or 'skip'): ").lower()
            if ready == 'skip':
                print(f"Skipping {pose_info['name']}")
                failed_poses.append(pose_key)
                continue
            elif ready != 'y':
                print("Exiting...")
                break
            
            success = self.collect_pose_fast(pose_key, pose_info)
            if success:
                completed_poses.append(pose_key)
            else:
                failed_poses.append(pose_key)
            
            # Short break between poses
            if i < len(POSES_GUIDE) - 1:
                print(f"\nTake a 10 second break before next pose...")
                time.sleep(10)
        
        self.cap.release()
        cv2.destroyAllWindows()
        
        # Summary
        print(f"\n{'='*60}")
        print("COLLECTION COMPLETE!")
        print(f"{'='*60}")
        print(f"✓ Completed: {len(completed_poses)} poses")
        if completed_poses:
            print(f"  Success: {', '.join(completed_poses)}")
        
        if failed_poses:
            print(f"✗ Failed/Skipped: {len(failed_poses)} poses")
            print(f"  {', '.join(failed_poses)}")
        
        if completed_poses:
            print(f"\nNext steps:")
            print(f"1. Process images: python proprocessing.py")
            print(f"2. Train model: python training_all_poses.py") 
            print(f"3. Enable in frontend: python enable_manual_poses.py")
            print(f"4. Copy model files to frontend/public/")
        
        return len(completed_poses) > 0

def main():
    collector = FastPoseCollector()
    
    print("FAST POSE DATA COLLECTION")
    print("="*50)
    print("Options:")
    print("1. Collect ALL manual poses (recommended)")
    print("2. Collect specific pose")
    print("3. Check current status")
    
    choice = input("\nChoice (1/2/3): ")
    
    if choice == '1':
        collector.collect_all_poses()
    elif choice == '2':
        print("\nAvailable poses:")
        for i, (key, info) in enumerate(POSES_GUIDE.items(), 1):
            print(f"{i}. {info['name']}")
        
        try:
            selection = int(input("Select pose (1-5): ")) - 1
            poses = list(POSES_GUIDE.items())
            if 0 <= selection < len(poses):
                if collector.initialize_camera():
                    pose_key, pose_info = poses[selection]
                    collector.collect_pose_fast(pose_key, pose_info)
                    collector.cap.release()
                    cv2.destroyAllWindows()
        except ValueError:
            print("Invalid selection")
    
    elif choice == '3':
        # Quick status check
        import subprocess
        subprocess.run(['python', 'status_check.py'])

if __name__ == "__main__":
    main()