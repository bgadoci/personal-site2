#!/usr/bin/env python3
import os
import re
import yaml

# Define path
BLOG_DIR_PATH = '/Users/brandongadoci/Documents/markdown-mongo-platform/content/blog'

def check_and_fix_frontmatter(file_path):
    """Check and fix YAML frontmatter in a blog post"""
    print(f"Checking {os.path.basename(file_path)}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        
        if not frontmatter_match:
            print(f"No frontmatter found in {file_path}")
            return False
        
        frontmatter_text = frontmatter_match.group(1)
        
        # Try to parse the frontmatter with PyYAML
        try:
            frontmatter = yaml.safe_load(frontmatter_text)
            print(f"✓ YAML is valid in {os.path.basename(file_path)}")
            return True
        except yaml.YAMLError as e:
            print(f"✗ YAML error in {os.path.basename(file_path)}: {e}")
            
            # Fix common YAML issues
            fixed_frontmatter = {}
            
            # Parse frontmatter line by line
            for line in frontmatter_text.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Handle special cases
                    if key == 'tags' and value == '[]':
                        fixed_frontmatter[key] = []
                    elif key in ['title', 'excerpt']:
                        # Ensure these are properly quoted
                        value_clean = value.strip('"\'')
                        fixed_frontmatter[key] = value_clean
                    else:
                        # Remove any extra quotes
                        value_clean = value.strip('"\'')
                        fixed_frontmatter[key] = value_clean
            
            # Generate new frontmatter text
            new_frontmatter_text = "---\n"
            for key, value in fixed_frontmatter.items():
                if key == 'tags' and value == []:
                    new_frontmatter_text += f"{key}: []\n"
                elif key in ['title', 'excerpt']:
                    # Ensure these are properly quoted
                    new_frontmatter_text += f'{key}: "{value}"\n'
                else:
                    # Don't quote simple values
                    new_frontmatter_text += f"{key}: {value}\n"
            new_frontmatter_text += "---"
            
            # Replace old frontmatter with new
            new_content = re.sub(r'^---\n(.*?)\n---', new_frontmatter_text, content, flags=re.DOTALL)
            
            # Write updated content back to file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            
            print(f"✓ Fixed YAML in {os.path.basename(file_path)}")
            return True
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("Starting YAML frontmatter check and fix process...")
    
    # Get all markdown files in the blog directory
    blog_files = []
    for file in os.listdir(BLOG_DIR_PATH):
        if file.endswith('.md'):
            blog_files.append(os.path.join(BLOG_DIR_PATH, file))
    
    print(f"Found {len(blog_files)} blog files to check")
    
    # Check and fix each blog post
    success_count = 0
    error_count = 0
    for file_path in blog_files:
        if check_and_fix_frontmatter(file_path):
            success_count += 1
        else:
            error_count += 1
    
    print(f"Completed checking {len(blog_files)} blog posts")
    print(f"Success: {success_count}, Errors: {error_count}")

if __name__ == "__main__":
    main()
