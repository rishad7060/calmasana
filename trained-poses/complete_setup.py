"""
COMPLETE AUTOMATED SETUP
This will do everything needed to make manual poses work with AI detection
"""

import os
import subprocess
import time
import shutil

def run_step(command, description, timeout=None):
    """Run a setup step with progress tracking"""
    print(f"\n{'='*60}")
    print(f"⏳ {description}")
    print(f"{'='*60}")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, timeout=timeout, 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - SUCCESS")
            return True
        else:
            print(f"❌ {description} - FAILED")
            print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - TIMEOUT")
        return False
    except Exception as e:
        print(f"❌ {description} - ERROR: {e}")
        return False

def check_requirements():
    """Check if all required packages are installed"""
    print("Checking Python packages...")
    
    required = ['cv2', 'tensorflow', 'pandas', 'numpy', 'sklearn']
    missing = []
    
    for package in required:
        try:
            if package == 'cv2':
                import cv2
            elif package == 'sklearn':
                import sklearn
            else:
                __import__(package)
            print(f"✅ {package}")
        except ImportError:
            missing.append(package)
            print(f"❌ {package}")
    
    if missing:
        print(f"\nInstalling missing packages: {missing}")
        packages_to_install = []
        for pkg in missing:
            if pkg == 'cv2':
                packages_to_install.append('opencv-python')
            elif pkg == 'sklearn':
                packages_to_install.append('scikit-learn')
            else:
                packages_to_install.append(pkg)
        
        for pkg in packages_to_install:
            subprocess.run(['pip', 'install', pkg])
    
    return len(missing) == 0

def main():
    print("🧘 COMPLETE MANUAL POSES SETUP")
    print("="*60)
    print("This will automatically:")
    print("1. Check requirements")
    print("2. Collect training data (interactive)")
    print("3. Process images")
    print("4. Train AI model")  
    print("5. Update frontend")
    print("6. Copy model files")
    print("\nTotal time: ~30-45 minutes")
    
    # Check if we're in the right directory
    if not os.path.exists('yoga_poses'):
        print("❌ Error: Not in correct directory")
        print("Please run this from: D:\\FD\\yoga\\CalmAsana\\classification model\\")
        return
    
    # Get user confirmation
    proceed = input("\nDo you want to proceed with complete setup? (y/n): ")
    if proceed.lower() != 'y':
        print("Setup cancelled")
        return
    
    print(f"\n🚀 Starting complete setup...")
    start_time = time.time()
    
    # Step 1: Check requirements
    print(f"\n📋 STEP 1: Checking requirements")
    if not check_requirements():
        print("❌ Requirements check failed")
        return
    
    # Step 2: Collect training data (interactive)
    print(f"\n📸 STEP 2: Collect training data")
    print("This step requires your participation to pose for the camera")
    print("You'll collect data for 5 poses: Mountain, Child, Bridge, Plank, Cat-Cow")
    
    collect_data = input("\nReady to collect training data? (y/n): ")
    if collect_data.lower() == 'y':
        success = run_step("python fast_data_collection.py", 
                          "Collecting training data", timeout=1800)  # 30 min timeout
        if not success:
            print("❌ Data collection failed. Cannot proceed.")
            return
    else:
        print("⚠️ Skipping data collection")
        print("Note: Without new training data, manual poses won't work")
    
    # Step 3: Process images
    print(f"\n🔍 STEP 3: Processing images")
    success = run_step("python proprocessing.py", 
                      "Processing images to extract keypoints", timeout=600)  # 10 min
    if not success:
        print("❌ Image processing failed")
        return
    
    # Step 4: Train model
    print(f"\n🤖 STEP 4: Training AI model")
    success = run_step("python training_all_poses.py", 
                      "Training pose classification model", timeout=1800)  # 30 min
    if not success:
        print("❌ Model training failed")
        return
    
    # Step 5: Update frontend
    print(f"\n📱 STEP 5: Updating frontend")
    success = run_step("python enable_manual_poses.py", 
                      "Enabling manual poses in frontend", timeout=60)
    if not success:
        print("❌ Frontend update failed")
        return
    
    # Step 6: Copy model files
    print(f"\n📁 STEP 6: Copying model files")
    try:
        frontend_public = "../frontend/public"
        if os.path.exists(frontend_public):
            shutil.copy("model/model.json", f"{frontend_public}/model.json")
            shutil.copy("model/group1-shard1of1.bin", f"{frontend_public}/group1-shard1of1.bin")
            print("✅ Model files copied to frontend")
        else:
            print(f"❌ Frontend directory not found: {frontend_public}")
            return
    except Exception as e:
        print(f"❌ Error copying files: {e}")
        return
    
    # Success!
    end_time = time.time()
    total_time = int((end_time - start_time) / 60)
    
    print(f"\n{'='*60}")
    print("🎉 SETUP COMPLETE!")
    print(f"{'='*60}")
    print(f"⏱️ Total time: {total_time} minutes")
    
    print(f"\n✅ What was accomplished:")
    print("• Collected training data for manual poses")
    print("• Processed images to extract pose keypoints")
    print("• Trained AI model with all poses")
    print("• Updated frontend to enable camera detection")
    print("• Copied new model files to frontend")
    
    print(f"\n🧘 All 5 manual poses now work with AI detection!")
    print("• Mountain Pose")
    print("• Child Pose")
    print("• Bridge Pose") 
    print("• Plank Pose")
    print("• Cat-Cow Pose")
    
    print(f"\n📱 To test:")
    print("1. Restart your frontend application")
    print("2. Go to Poses library")
    print("3. Click 'Practice This Pose' on any manual pose")
    print("4. You should see '🤖 AI Detection Mode'")
    print("5. Camera will open and detect your poses!")
    
    print(f"\n💡 Tips:")
    print("• Make sure you have good lighting")
    print("• Stand clearly in camera frame")
    print("• If detection seems off, you can collect more training data")

if __name__ == "__main__":
    main()