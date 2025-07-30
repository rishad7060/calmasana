"""
Quick data collection script for manual poses
This will help you quickly collect training data for the 5 manual poses
so they can work with camera detection.
"""

import cv2
import os
import time

# Manual poses that need training data
POSES = {
    'mountain': {
        'name': 'Mountain Pose',
        'instruction': 'Stand straight, feet together, arms at your sides'
    },
    'child': {
        'name': 'Child Pose', 
        'instruction': 'Kneel and sit back on heels, fold forward with arms extended'
    },
    'bridge': {
        'name': 'Bridge Pose',
        'instruction': 'Lie on back, knees bent, lift hips up'
    },
    'plank': {
        'name': 'Plank Pose',
        'instruction': 'Hold straight line from head to heels, arms extended'
    },
    'cat_cow': {
        'name': 'Cat-Cow Pose',
        'instruction': 'On hands and knees, arch and round your back alternately'
    }
}

def collect_pose_images(pose_key, pose_info, samples_per_set=50):
    """Collect training images for a specific pose"""
    print(f"\n=== {pose_info['name']} ===")
    print(f"Instructions: {pose_info['instruction']}")
    print(f"We'll collect {samples_per_set} training and {samples_per_set//2} test images")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return False
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    time.sleep(2)  # Let camera initialize
    
    # Collect training data
    print(f"\n--- TRAINING DATA ---")
    print("Get into the pose, then press SPACE to start collecting")
    print("Hold the pose and move slightly for variation")
    print("Press 'q' to finish early")
    
    success = collect_images(cap, pose_key, 'train', samples_per_set)
    if not success:
        cap.release()
        return False
    
    print("\nTake a 10 second break...")
    time.sleep(10)
    
    # Collect test data
    print(f"\n--- TEST DATA ---")
    print("Now collecting test images (fewer samples)")
    collect_images(cap, pose_key, 'test', samples_per_set//2)
    
    cap.release()
    cv2.destroyAllWindows()
    return True

def collect_images(cap, pose_key, data_type, num_samples):
    """Collect images for training or test"""
    base_dir = f'yoga_poses/{data_type}/{pose_key}'
    
    # Get existing file count
    existing_files = []
    if os.path.exists(base_dir):
        existing_files = [f for f in os.listdir(base_dir) if f.endswith('.jpg')]
    start_idx = len(existing_files) // 2  # Divide by 2 for flipped versions
    
    collected = 0
    capturing = False
    
    while collected < num_samples:
        ret, frame = cap.read()
        if not ret:
            print("Error reading from camera")
            return False
        
        # Add text overlay
        display_frame = frame.copy()
        cv2.putText(display_frame, f"{POSES[pose_key]['name']} - {data_type.upper()}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(display_frame, f"Collected: {collected}/{num_samples}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        if capturing:
            cv2.putText(display_frame, "CAPTURING - Hold pose!", 
                       (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Save image
            filename = f"{pose_key}_{data_type}_{start_idx + collected:04d}.jpg"
            filepath = os.path.join(base_dir, filename)
            cv2.imwrite(filepath, frame)
            
            # Save flipped version
            flipped = cv2.flip(frame, 1)
            flipped_filename = f"{pose_key}_{data_type}_{start_idx + collected:04d}_flipped.jpg"
            flipped_filepath = os.path.join(base_dir, flipped_filename)
            cv2.imwrite(flipped_filepath, flipped)
            
            collected += 1
            time.sleep(0.2)  # Small delay between captures
            
        else:
            cv2.putText(display_frame, "Press SPACE to start, 'q' to quit", 
                       (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        cv2.imshow('Data Collection', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            capturing = not capturing
        elif key == ord('q'):
            break
    
    print(f"✓ Collected {collected} samples for {pose_key} {data_type}")
    return True

def main():
    print("=== QUICK POSE DATA COLLECTION ===")
    print("This will collect training data for manual poses so they work with camera detection.")
    print(f"\nPoses to collect: {len(POSES)}")
    
    for i, (pose_key, pose_info) in enumerate(POSES.items()):
        print(f"{i+1}. {pose_info['name']}")
    
    print(f"\nFor each pose, we'll collect ~50 training and 25 test images.")
    print("Total time: ~15-20 minutes")
    
    choice = input("\nDo you want to collect data for all poses? (y/n): ")
    if choice.lower() != 'y':
        # Individual pose selection
        print("\nWhich pose would you like to collect data for?")
        for i, (pose_key, pose_info) in enumerate(POSES.items()):
            print(f"{i+1}. {pose_info['name']}")
        
        try:
            selection = int(input("Enter number: ")) - 1
            pose_keys = list(POSES.keys())
            if 0 <= selection < len(pose_keys):
                selected_pose = pose_keys[selection]
                collect_pose_images(selected_pose, POSES[selected_pose])
            else:
                print("Invalid selection")
        except ValueError:
            print("Invalid input")
        return
    
    # Collect all poses
    total_poses = len(POSES)
    for i, (pose_key, pose_info) in enumerate(POSES.items()):
        print(f"\n[{i+1}/{total_poses}] Starting {pose_info['name']}")
        input("Press ENTER when ready...")
        
        success = collect_pose_images(pose_key, pose_info)
        if not success:
            print(f"Failed to collect data for {pose_key}")
            continue
            
        if i < total_poses - 1:
            print("\nTake a 30 second break before next pose...")
            time.sleep(30)
    
    print("\n=== DATA COLLECTION COMPLETE ===")
    print("\nNext steps:")
    print(f"1. Run: python proprocessing.py")
    print(f"2. Run: python training_all_poses.py")
    print(f"3. Copy model files to frontend/public/")
    print(f"4. Test the poses in the application!")

if __name__ == "__main__":
    main()