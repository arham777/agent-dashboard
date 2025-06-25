import os
import re

dir_path = os.path.join('src', 'common', 'components', 'ui', 'promptUi')
print(f"Checking directory: {dir_path}")

fixed_count = 0

for filename in os.listdir(dir_path):
    if not (filename.endswith('.tsx') or filename.endswith('.ts')):
        continue
    
    filepath = os.path.join(dir_path, filename)
    print(f"Processing {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '@/lib/utils' in content:
        new_content = content.replace('@/lib/utils', '../../../../libs/utils')
        
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        fixed_count += 1
        print(f"Fixed import in {filename}")

print(f"\nFixed imports in {fixed_count} files.") 