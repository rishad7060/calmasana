"""
Simple status check for manual poses
"""

import os

def main():
    print("MANUAL POSES STATUS CHECK")
    print("="*50)
    
    print("\n1. Checking training data...")
    
    if not os.path.exists('train_data.csv'):
        print("ERROR: train_data.csv not found")
        print("Need to run: python proprocessing.py")
        return
    
    # Check what poses are in training data
    with open('train_data.csv', 'r') as f:
        lines = f.readlines()
        if len(lines) > 1:
            # Get unique class names from the last column
            classes = set()
            for line in lines[1:]:  # Skip header
                parts = line.strip().split(',')
                if len(parts) > 53:  # class_name is at index 53
                    classes.add(parts[53])
            
            print("Poses in training data:", sorted(classes))
            
            manual_poses = ['mountain', 'child', 'bridge', 'plank', 'cat_cow']
            found_manual = [pose for pose in manual_poses if pose in classes]
            
            if found_manual:
                print("Manual poses with training data:", found_manual)
            else:
                print("NO manual poses found in training data")
                print("Current poses only:", sorted(classes))
        else:
            print("Training data file is empty")
    
    print("\n2. Checking model files...")
    model_files = ['model/model.json', 'model/group1-shard1of1.bin']
    for file in model_files:
        if os.path.exists(file):
            print(f"OK: {file} exists")
        else:
            print(f"MISSING: {file}")
    
    print("\n" + "="*50)
    print("DIAGNOSIS:")
    print("="*50)
    
    # Read the training data again to show exact status
    if os.path.exists('train_data.csv'):
        with open('train_data.csv', 'r') as f:
            content = f.read()
            
        if any(pose in content.lower() for pose in ['mountain', 'child', 'bridge', 'plank', 'cat']):
            print("GOOD: Some manual poses have training data")
            print("Next step: Run 'python enable_manual_poses.py'")
        else:
            print("ISSUE: No training data for manual poses found")
            print("The poses are showing as manual because:")
            print("1. They are in the Poses page (library)")
            print("2. But NOT in the AI detection system")
            print("3. No training data exists for them")
            print("\nTo fix this:")
            print("1. Collect training data: python quick_data_collection.py")
            print("2. Process images: python proprocessing.py") 
            print("3. Train model: python training_all_poses.py")
            print("4. Enable in frontend: python enable_manual_poses.py")

if __name__ == "__main__":
    main()