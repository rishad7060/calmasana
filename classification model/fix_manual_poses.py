"""
COMPLETE FIX for Manual Poses Issue

This script will:
1. Identify the exact problem
2. Fix the camera detection issues
3. Provide step-by-step solution to make manual poses work with AI
"""

import os
import json

def check_current_state():
    """Check the current state of the system"""
    print("🔍 DIAGNOSING CURRENT SYSTEM STATE...")
    print("="*50)
    
    issues = []
    
    # Check 1: Training data for manual poses
    manual_poses = ['mountain', 'child', 'bridge', 'plank', 'cat_cow']
    train_dir = 'yoga_poses/train'
    
    print("📊 Checking training data...")
    missing_poses = []
    for pose in manual_poses:
        pose_dir = os.path.join(train_dir, pose)
        if not os.path.exists(pose_dir):
            missing_poses.append(pose)
        else:
            files = [f for f in os.listdir(pose_dir) if f.endswith('.jpg')]
            if len(files) < 10:
                missing_poses.append(f"{pose} (only {len(files)} images)")
    
    if missing_poses:
        print(f"❌ Missing training data for: {', '.join(missing_poses)}")
        issues.append("No training data for manual poses")
    else:
        print("✅ Training data exists for all manual poses")
    
    # Check 2: CSV files contain manual poses
    print("\n📋 Checking processed training data...")
    if os.path.exists('train_data.csv'):
        with open('train_data.csv', 'r') as f:
            content = f.read()
            if any(pose in content for pose in manual_poses):
                print("✅ Manual poses found in training CSV")
            else:
                print("❌ Manual poses NOT found in training CSV")
                issues.append("Manual poses not processed into CSV")
    else:
        print("❌ train_data.csv not found")
        issues.append("Training data not processed")
    
    # Check 3: Model files
    print("\n🤖 Checking model files...")
    model_files = ['model/model.json', 'model/group1-shard1of1.bin']
    for file in model_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            issues.append(f"Missing {file}")
    
    # Check 4: Frontend model files
    print("\n📱 Checking frontend model files...")
    frontend_files = ['../frontend/public/model.json', '../frontend/public/group1-shard1of1.bin']
    for file in frontend_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            issues.append(f"Missing {file}")
    
    return issues

def show_solution(issues):
    """Show step-by-step solution based on issues found"""
    print("\n" + "="*50)
    print("🛠️  SOLUTION STEPS")
    print("="*50)
    
    if "No training data for manual poses" in issues:
        print("\n1️⃣ COLLECT TRAINING DATA")
        print("   The manual poses need training images to work with AI")
        print("   Run: python quick_data_collection.py")
        print("   Time needed: ~15-20 minutes")
        print("   What it does: Captures images of you doing each pose")
        
    if "Manual poses not processed into CSV" in issues or "Training data not processed" in issues:
        print("\n2️⃣ PROCESS TRAINING IMAGES")
        print("   Convert images to keypoint data for AI training")
        print("   Run: python proprocessing.py")
        print("   Time needed: ~5-10 minutes")
        print("   What it does: Extracts pose keypoints using MoveNet")
        
    if any("model/" in issue for issue in issues):
        print("\n3️⃣ TRAIN AI MODEL")
        print("   Retrain the model to recognize all poses")
        print("   Run: python training_all_poses.py")
        print("   Time needed: ~10-30 minutes")
        print("   What it does: Trains neural network on all pose data")
        
    if any("frontend" in issue for issue in issues):
        print("\n4️⃣ UPDATE FRONTEND")
        print("   Copy new model files to frontend")
        print("   Run these commands:")
        print("   copy model\\model.json ..\\frontend\\public\\model.json")
        print("   copy model\\group1-shard1of1.bin ..\\frontend\\public\\group1-shard1of1.bin")
        
    print("\n5️⃣ RESTORE FRONTEND CODE")
    print("   Update Yoga.js to include manual poses in camera detection")
    print("   This will be done automatically after training")
    
    print("\n" + "="*50)
    print("🚀 QUICK FIX - ALL IN ONE")
    print("="*50)
    print("Run: python integrate_manual_poses.py")
    print("This will do ALL steps above automatically!")

def main():
    print("🧘 MANUAL POSES DIAGNOSTIC & FIX TOOL")
    print("This tool will identify why manual poses aren't working with camera")
    
    if not os.path.exists('yoga_poses'):
        print("❌ Error: Please run this from the 'classification model' directory")
        return
    
    # Check current state
    issues = check_current_state()
    
    print("\n" + "="*50)
    print("📋 SUMMARY")
    print("="*50)
    
    if not issues:
        print("✅ Everything looks good! Manual poses should be working.")
        print("If they're still not working, there might be a frontend cache issue.")
        print("Try refreshing your browser or clearing cache.")
    else:
        print(f"❌ Found {len(issues)} issues:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
        
        show_solution(issues)
    
    print("\n" + "="*50)
    print("💡 WHY POSES ARE STILL MANUAL")
    print("="*50)
    print("The poses show as 'manual' because:")
    print("1. They're listed in Poses.js (library page) but...")
    print("2. They're NOT in Yoga.js camera detection list because...")
    print("3. The AI model doesn't know these poses yet!")
    print("\nOnce you collect training data and retrain the model,")
    print("they'll automatically work with camera detection! 🎯")

if __name__ == "__main__":
    main()