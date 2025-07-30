"""
Check current system status for manual poses
"""

import os

def main():
    print("MANUAL POSES STATUS CHECK")
    print("="*50)
    
    print("\n1. Checking training data...")
    manual_poses = ['mountain', 'child', 'bridge', 'plank', 'cat_cow']
    
    if not os.path.exists('train_data.csv'):
        print("❌ train_data.csv not found")
        print("   Need to run: python proprocessing.py")
        return
    
    # Check what poses are in training data
    with open('train_data.csv', 'r') as f:
        content = f.read().lower()
    
    found_poses = []
    for pose in manual_poses:
        if pose in content:
            found_poses.append(pose)
    
    print(f"✅ Training data exists for: {found_poses}")
    
    if not found_poses:
        print("❌ No manual poses found in training data")
        print("   Need to:")
        print("   1. Run: python quick_data_collection.py")
        print("   2. Run: python proprocessing.py")
        print("   3. Run: python training_all_poses.py")
        return
    
    print("\n2. Checking model files...")
    model_files = ['model/model.json', 'model/group1-shard1of1.bin']
    for file in model_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
    
    print("\n3. Checking frontend files...")
    frontend_files = ['../frontend/src/pages/EnhancedYoga/EnhancedYoga.js']
    for file in frontend_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
            
            # Check if manual poses are in aiSupportedPoses
            with open(file, 'r') as f:
                content = f.read()
                if 'Mountain' in content and 'aiSupportedPoses' in content:
                    print("   ✅ Manual poses may be enabled in frontend")
                else:
                    print("   ❌ Manual poses NOT enabled in frontend")
        else:
            print(f"❌ {file} missing")
    
    print("\n" + "="*50)
    print("SUMMARY:")
    print("="*50)
    
    if found_poses:
        print(f"You have training data for: {found_poses}")
        print("\nTo enable AI detection for these poses:")
        print("1. Make sure model is trained: python training_all_poses.py")
        print("2. Enable in frontend: python enable_manual_poses.py")
        print("3. Copy model files to frontend/public/")
    else:
        print("No training data found for manual poses.")
        print("Run: python integrate_manual_poses.py for complete setup")

if __name__ == "__main__":
    main()