#!/usr/bin/env python3
import os
import re
import yaml

# Define path
BLOG_DIR_PATH = '/Users/brandongadoci/Documents/markdown-mongo-platform/content/blog'

def clean_yaml_value(value):
    """Remove unnecessary quotes from YAML values"""
    if isinstance(value, str):
        # Remove extra quotes
        return value.strip('"\'')
    return value

def fix_blog_post(file_path):
    """Fix formatting issues in a blog post's frontmatter"""
    print(f"Processing {os.path.basename(file_path)}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        
        if not frontmatter_match:
            print(f"No frontmatter found in {file_path}")
            return False
        
        frontmatter_text = frontmatter_match.group(1)
        
        # Parse frontmatter manually to avoid YAML parsing issues
        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                frontmatter[key] = value
        
        # Create new frontmatter with clean values
        new_frontmatter = {}
        for key, value in frontmatter.items():
            new_frontmatter[key] = clean_yaml_value(value)
        
        # Generate new frontmatter text
        new_frontmatter_text = "---\n"
        for key, value in new_frontmatter.items():
            if key == 'tags' and value == '[]':
                new_frontmatter_text += f"{key}: []\n"
            elif key == 'excerpt' or key == 'title':
                # Ensure these are properly quoted
                value_clean = value.strip('"\'')
                new_frontmatter_text += f'{key}: "{value_clean}"\n'
            else:
                # Remove any extra quotes
                value_clean = value.strip('"\'')
                new_frontmatter_text += f"{key}: {value_clean}\n"
        new_frontmatter_text += "---"
        
        # Replace old frontmatter with new
        new_content = re.sub(r'^---\n(.*?)\n---', new_frontmatter_text, content, flags=re.DOTALL)
        
        # Write updated content back to file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"Updated {os.path.basename(file_path)}")
        return True
    
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    print("Starting blog frontmatter format fix process...")
    
    # Get all markdown files in the blog directory
    blog_files = []
    for file in os.listdir(BLOG_DIR_PATH):
        if file.endswith('.md'):
            blog_files.append(os.path.join(BLOG_DIR_PATH, file))
    
    print(f"Found {len(blog_files)} blog files to process")
    
    # Fix each blog post
    success_count = 0
    for file_path in blog_files:
        if fix_blog_post(file_path):
            success_count += 1
    
    print(f"Completed fixing {success_count} out of {len(blog_files)} blog posts")

if __name__ == "__main__":
    main()
