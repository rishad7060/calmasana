"""
Setup script to add manual poses to the AI detection system
This script guides you through the process of:
1. Collecting training data for manual poses
2. Processing the images to extract keypoints
3. Retraining the model
4. Updating the frontend
"""

import os
import sys
import subprocess

def run_command(cmd):
    """Run a command and handle errors"""
    print(f"\nRunning: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(result.stdout)
    return True

def check_requirements():
    """Check if all required packages are installed"""
    print("Checking requirements...")
    
    required_packages = [
        'tensorflow',
        'opencv-python',
        'pandas',
        'numpy',
        'scikit-learn',
        'tensorflowjs',
        'tqdm',
        'wget'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"\nMissing packages: {', '.join(missing)}")
        print("Installing missing packages...")
        for package in missing:
            run_command(f"pip install {package}")
    else:
        print("✓ All requirements satisfied")

def main():
    print("=== MANUAL POSES TO AI SETUP ===")
    print("\nThis script will help you add manual poses to the AI detection system.")
    print("\nManual poses to be added:")
    print("- Mountain")
    print("- Child")
    print("- Bridge")
    print("- Plank")
    print("- Cat-Cow")
    
    # Check requirements
    check_requirements()
    
    print("\n\nStep-by-step process:")
    print("1. Collect training images for each pose")
    print("2. Process images to extract pose keypoints")
    print("3. Retrain the classification model")
    print("4. Update the frontend to use the new model")
    
    input("\nPress ENTER to continue...")
    
    # Step 1: Collect training data
    print("\n\n=== STEP 1: COLLECT TRAINING DATA ===")
    print("We need to collect images of you performing each pose.")
    print("For each pose, you'll need to:")
    print("- Perform the pose in front of the camera")
    print("- Hold it while the system captures multiple angles")
    print("- We'll collect ~300 training and ~100 test images per pose")
    
    collect = input("\nDo you want to collect training data now? (y/n): ")
    if collect.lower() == 'y':
        run_command("python collect_pose_data.py")
    else:
        print("Skipping data collection. Make sure you have training data in yoga_poses/train and yoga_poses/test")
    
    # Step 2: Process images
    print("\n\n=== STEP 2: PROCESS IMAGES ===")
    print("Now we'll process the images to extract pose keypoints using MoveNet.")
    
    process = input("\nDo you want to process the images now? (y/n): ")
    if process.lower() == 'y':
        print("\nProcessing images... This may take several minutes.")
        if run_command("python proprocessing.py"):
            print("✓ Image processing complete")
        else:
            print("Error processing images. Please check the error messages above.")
            return
    
    # Step 3: Train model
    print("\n\n=== STEP 3: TRAIN MODEL ===")
    print("Now we'll retrain the pose classification model with all poses.")
    
    train = input("\nDo you want to train the model now? (y/n): ")
    if train.lower() == 'y':
        print("\nTraining model... This may take 10-30 minutes depending on your hardware.")
        if run_command("python training_all_poses.py"):
            print("✓ Model training complete")
        else:
            print("Error training model. Please check the error messages above.")
            return
    
    # Step 4: Update frontend
    print("\n\n=== STEP 4: UPDATE FRONTEND ===")
    print("\nThe frontend has been updated to include the new poses.")
    print("The model files need to be copied to the frontend:")
    print("1. Copy 'model/model.json' to 'frontend/public/model.json'")
    print("2. Copy 'model/group1-shard1of1.bin' to 'frontend/public/group1-shard1of1.bin'")
    
    copy = input("\nDo you want to copy the model files now? (y/n): ")
    if copy.lower() == 'y':
        import shutil
        try:
            shutil.copy('model/model.json', '../frontend/public/model.json')
            shutil.copy('model/group1-shard1of1.bin', '../frontend/public/group1-shard1of1.bin')
            print("✓ Model files copied to frontend")
        except Exception as e:
            print(f"Error copying files: {e}")
            print("Please copy the files manually")
    
    print("\n\n=== SETUP COMPLETE ===")
    print("\n✓ All steps completed!")
    print("\nThe manual poses are now integrated into the AI detection system.")
    print("\nTo test:")
    print("1. Start the frontend application")
    print("2. Navigate to the Yoga page")
    print("3. Select one of the new poses (Mountain, Child, Bridge, Plank, Cat-Cow)")
    print("4. Start the pose and the camera should detect it!")
    
    print("\n\nNote: The model accuracy depends on the quality and variety of training data.")
    print("If detection isn't working well for a pose, you may need to:")
    print("- Collect more training data with different angles/lighting")
    print("- Adjust the detection threshold in the frontend (currently 0.97)")

if __name__ == "__main__":
    main()