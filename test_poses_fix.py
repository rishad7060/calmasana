"""
Test script to verify manual poses are now enabled
"""

import os

def check_frontend_files():
    """Check if the frontend files have been updated correctly"""
    
    print("TESTING MANUAL POSES FIX")
    print("="*50)
    
    # Check EnhancedYoga.js
    enhanced_yoga_path = "frontend/src/pages/EnhancedYoga/EnhancedYoga.js"
    if os.path.exists(enhanced_yoga_path):
        with open(enhanced_yoga_path, 'r') as f:
            content = f.read()
            
        print("✓ EnhancedYoga.js found")
        
        # Check if manual poses are in aiSupportedPoses
        if "'Mountain'" in content and "'Child'" in content and "'Bridge'" in content:
            print("✓ Manual poses added to aiSupportedPoses array")
        else:
            print("✗ Manual poses NOT found in aiSupportedPoses array")
            
        # Check if CLASS_NO mapping exists
        if "Mountain: 6" in content and "Child: 1" in content:
            print("✓ CLASS_NO mapping updated for manual poses")
        else:
            print("✗ CLASS_NO mapping NOT updated")
    else:
        print("✗ EnhancedYoga.js not found")
    
    # Check classic Yoga.js
    yoga_path = "frontend/src/pages/Yoga/Yoga.js"
    if os.path.exists(yoga_path):
        with open(yoga_path, 'r') as f:
            content = f.read()
            
        print("✓ Yoga.js found")
        
        # Check if manual poses are in poseList
        if "'Mountain'" in content and "'Child'" in content:
            print("✓ Manual poses added to poseList array")
        else:
            print("✗ Manual poses NOT found in poseList array")
    else:
        print("✗ Yoga.js not found")
    
    print("\n" + "="*50)
    print("EXPECTED BEHAVIOR AFTER RESTART:")
    print("="*50)
    print("1. Go to Poses library page")
    print("2. Click 'Practice This Pose' on Mountain, Child, Bridge, Plank, or Cat-Cow")
    print("3. You should see '🤖 AI Detection Mode' instead of '⏱️ Manual Practice Mode'")
    print("4. Camera should turn on automatically")
    print("5. Pose detection might not be perfect (needs model retraining)")
    
    print("\nNOTE: The poses are temporarily mapped to similar existing poses:")
    print("• Mountain → Tree detection")
    print("• Child → Cobra detection")  
    print("• Bridge → Shoulderstand detection")
    print("• Plank → Dog detection")
    print("• Cat-Cow → Dog detection")
    
    print("\nFor perfect detection, you still need to:")
    print("1. Collect training data: python fast_data_collection.py")
    print("2. Retrain model: python training_all_poses.py")

if __name__ == "__main__":
    check_frontend_files()