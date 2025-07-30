"""
Complete integration script for manual poses
This script will:
1. Collect training data for manual poses
2. Process the images to extract keypoints  
3. Retrain the model
4. Copy model files to frontend
"""

import os
import subprocess
import shutil
import sys

def run_command(cmd, description):
    """Run a command and show progress"""
    print(f"\n{'='*50}")
    print(f"⏳ {description}")
    print(f"{'='*50}")
    
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"❌ Error: {description} failed")
        return False
    else:
        print(f"✅ {description} completed successfully")
        return True

def check_training_data():
    """Check if we have training data for manual poses"""
    manual_poses = ['mountain', 'child', 'bridge', 'plank', 'cat_cow']
    train_dir = 'yoga_poses/train'
    
    missing_data = []
    for pose in manual_poses:
        pose_dir = os.path.join(train_dir, pose)
        if not os.path.exists(pose_dir) or len(os.listdir(pose_dir)) < 10:
            missing_data.append(pose)
    
    return missing_data

def main():
    print("🧘 MANUAL POSES TO AI INTEGRATION")
    print("This will convert manual poses to camera-detected poses")
    
    # Check current directory
    if not os.path.exists('yoga_poses'):
        print("❌ Error: yoga_poses directory not found")
        print("Please run this script from the 'classification model' directory")
        return
    
    # Step 1: Check training data
    print("\n📊 Checking training data...")
    missing_data = check_training_data()
    
    if missing_data:
        print(f"❌ Missing training data for: {', '.join(missing_data)}")
        print("\n🎥 You need to collect training data first")
        
        collect = input("Do you want to collect training data now? (y/n): ")
        if collect.lower() == 'y':
            if not run_command("python quick_data_collection.py", "Collecting training data"):
                return
        else:
            print("❌ Cannot proceed without training data")
            print("Run 'python quick_data_collection.py' to collect data")
            return
            
        # Check again after collection
        missing_data = check_training_data()
        if missing_data:
            print(f"❌ Still missing data for: {', '.join(missing_data)}")
            return
    else:
        print("✅ Training data found for all manual poses")
    
    # Step 2: Process images to extract keypoints
    print("\n🔍 Processing images to extract pose keypoints...")
    if not run_command("python proprocessing.py", "Processing images"):
        return
    
    # Step 3: Train the model with all poses
    print("\n🤖 Training AI model with all poses...")
    if not run_command("python training_all_poses.py", "Training model"):
        return
    
    # Step 4: Copy model files to frontend
    print("\n📁 Copying model files to frontend...")
    
    frontend_public = "../frontend/public"
    if not os.path.exists(frontend_public):
        print(f"❌ Frontend directory not found: {frontend_public}")
        print("Please check your project structure")
        return
    
    try:
        # Copy model files
        shutil.copy("model/model.json", f"{frontend_public}/model.json")
        shutil.copy("model/group1-shard1of1.bin", f"{frontend_public}/group1-shard1of1.bin")
        print("✅ Model files copied to frontend")
    except Exception as e:
        print(f"❌ Error copying model files: {e}")
        return
    
    # Step 5: Success message
    print("\n" + "="*50)
    print("🎉 INTEGRATION COMPLETE!")
    print("="*50)
    
    print("\n✅ Manual poses are now AI-enabled!")
    print("\nPoses that now work with camera detection:")
    print("• Mountain Pose")
    print("• Child Pose") 
    print("• Bridge Pose")
    print("• Plank Pose")
    print("• Cat-Cow Pose")
    
    print("\n📱 To test:")
    print("1. Start your frontend application")
    print("2. Go to the Yoga page")
    print("3. Select any of the new poses from dropdown")
    print("4. Click 'Start Pose' and perform the pose!")
    print("5. The skeleton should turn green when detected ✨")
    
    print("\n💡 Tips:")
    print("• Make sure you have good lighting")
    print("• Stand clearly in front of the camera")
    print("• If detection isn't working well, you may need more training data")

if __name__ == "__main__":
    main()