"""
Enable Manual Poses for AI Detection

This script will:
1. Add manual poses to the aiSupportedPoses array in EnhancedYoga.js
2. Update the CLASS_NO mapping for the new poses
3. Only enable poses that have training data
"""

import os
import re

def check_training_data():
    """Check which manual poses have training data"""
    manual_poses = ['Mountain', 'Child', 'Bridge', 'Plank', 'Cat-Cow']
    trained_poses = []
    
    # Check CSV file for pose data
    if os.path.exists('train_data.csv'):
        with open('train_data.csv', 'r') as f:
            content = f.read().lower()
            for pose in manual_poses:
                # Check various naming formats
                pose_variants = [pose.lower(), pose.lower().replace('-', '_'), pose.lower().replace('cat-cow', 'cat_cow')]
                if any(variant in content for variant in pose_variants):
                    trained_poses.append(pose)
    
    return trained_poses

def update_enhanced_yoga(trained_poses):
    """Update EnhancedYoga.js to include newly trained poses"""
    file_path = '../frontend/src/pages/EnhancedYoga/EnhancedYoga.js'
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    # Read the current file
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Current AI supported poses
    original_poses = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle']
    all_supported = original_poses + trained_poses
    
    # Update aiSupportedPoses array
    ai_poses_pattern = r'const aiSupportedPoses = \[(.*?)\]'
    ai_poses_replacement = f"const aiSupportedPoses = [\n  {', '.join([f\"'{pose}'\" for pose in all_supported])}\n]"
    
    content = re.sub(ai_poses_pattern, ai_poses_replacement, content, flags=re.DOTALL)
    
    # Create CLASS_NO mapping for all poses
    class_mapping = {}
    for i, pose in enumerate(all_supported):
        # Handle special naming for Cat-Cow
        key = "'Cat-Cow'" if pose == 'Cat-Cow' else pose
        class_mapping[key] = i
    
    # Update CLASS_NO mapping
    class_no_lines = []
    for pose, class_no in class_mapping.items():
        class_no_lines.append(f"    {pose}: {class_no}")
    
    class_no_pattern = r'const CLASS_NO = \{(.*?)\}'
    class_no_replacement = f"const CLASS_NO = {{\n{',\\n'.join(class_no_lines)},\n    No_Pose: {len(all_supported)}\n  }}"
    
    content = re.sub(class_no_pattern, class_no_replacement, content, flags=re.DOTALL)
    
    # Write the updated file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated EnhancedYoga.js with {len(trained_poses)} new AI poses")
    return True

def update_yoga_classic(trained_poses):
    """Update classic Yoga.js as well"""
    file_path = '../frontend/src/pages/Yoga/Yoga.js'
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    # Read the current file
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Current poses
    original_poses = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Traingle']
    all_poses = original_poses + trained_poses
    
    # Update poseList array
    pose_list_pattern = r'let poseList = \[(.*?)\]'
    pose_list_replacement = f"let poseList = [\n  {', '.join([f\"'{pose}'\" for pose in all_poses])}\n]"
    
    content = re.sub(pose_list_pattern, pose_list_replacement, content, flags=re.DOTALL)
    
    # Create CLASS_NO mapping
    class_mapping = {}
    for i, pose in enumerate(all_poses):
        key = "'Cat-Cow'" if pose == 'Cat-Cow' else pose
        class_mapping[key] = i
    
    # Update CLASS_NO mapping
    class_no_lines = []
    for pose, class_no in class_mapping.items():
        class_no_lines.append(f"    {pose}: {class_no}")
    
    class_no_pattern = r'const CLASS_NO = \{(.*?)\}'
    class_no_replacement = f"const CLASS_NO = {{\n{',\\n'.join(class_no_lines)},\n    No_Pose: {len(all_poses)}\n  }}"
    
    content = re.sub(class_no_pattern, class_no_replacement, content, flags=re.DOTALL)
    
    # Write the updated file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated Yoga.js with {len(trained_poses)} new AI poses")
    return True

def main():
    print("🧘 ENABLE MANUAL POSES FOR AI DETECTION")
    print("="*50)
    
    # Check current directory
    if not os.path.exists('train_data.csv'):
        print("❌ train_data.csv not found")
        print("You need to:")
        print("1. Collect training data: python quick_data_collection.py")
        print("2. Process images: python proprocessing.py")
        print("3. Train model: python training_all_poses.py")
        print("4. Then run this script")
        return
    
    # Check which poses have training data
    trained_poses = check_training_data()
    
    if not trained_poses:
        print("❌ No manual poses found in training data")
        print("Available manual poses: Mountain, Child, Bridge, Plank, Cat-Cow")
        print("\nYou need to:")
        print("1. Collect training data for these poses")
        print("2. Retrain the model")
        print("3. Then run this script")
        return
    
    print(f"✅ Found training data for: {', '.join(trained_poses)}")
    
    # Update frontend files
    print(f"\n📱 Updating frontend to enable AI detection for new poses...")
    
    success1 = update_enhanced_yoga(trained_poses)
    success2 = update_yoga_classic(trained_poses)
    
    if success1 and success2:
        print("\n" + "="*50)
        print("🎉 SUCCESS!")
        print("="*50)
        print(f"✅ {len(trained_poses)} manual poses are now AI-enabled!")
        print(f"✨ New AI poses: {', '.join(trained_poses)}")
        
        print("\n📱 What changed:")
        print("• EnhancedYoga.js - Added poses to aiSupportedPoses array")
        print("• Yoga.js - Added poses to poseList array")
        print("• Both files - Updated CLASS_NO mappings")
        
        print("\n🧘 To test:")
        print("1. Restart your frontend application")
        print("2. Go to Poses library")
        print("3. Click 'Practice This Pose' on any newly enabled pose")
        print("4. You should see '🤖 AI Detection Mode' instead of '⏱️ Manual Practice Mode'")
        print("5. Camera should open and detect your pose!")
        
        print("\n💡 Note:")
        print("Make sure your model files are up to date in frontend/public/")
        
    else:
        print("❌ Failed to update frontend files")

if __name__ == "__main__":
    main()