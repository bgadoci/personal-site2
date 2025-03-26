#!/usr/bin/env python3
import os
import re
import yaml

# Define path
BLOG_DIR_PATH = '/Users/brandongadoci/Documents/markdown-mongo-platform/content/blog'

def clean_frontmatter(file_path):
    """Completely rebuild the frontmatter for a blog post"""
    print(f"Processing {os.path.basename(file_path)}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract frontmatter and content
        match = re.match(r'^---\n(.*?)\n---\n\n(.*)', content, re.DOTALL)
        
        if not match:
            print(f"Could not parse frontmatter in {file_path}")
            return False
        
        frontmatter_text = match.group(1)
        post_content = match.group(2)
        
        # Parse frontmatter manually
        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                parts = line.split(':', 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    value = parts[1].strip()
                    
                    # Handle special cases
                    if key == 'tags':
                        # Fix tags formatting
                        if value.startswith('[') and value.endswith(']'):
                            # Try to parse as list
                            tag_text = value[1:-1]
                            if tag_text.strip():
                                tags = []
                                # Split by commas, handling quoted strings
                                in_quotes = False
                                current_tag = ""
                                for char in tag_text:
                                    if char == '"' or char == "'":
                                        in_quotes = not in_quotes
                                    elif char == ',' and not in_quotes:
                                        if current_tag.strip():
                                            tags.append(current_tag.strip().strip('"\''))
                                        current_tag = ""
                                    else:
                                        current_tag += char
                                
                                if current_tag.strip():
                                    tags.append(current_tag.strip().strip('"\''))
                                
                                frontmatter['tags'] = tags
                            else:
                                frontmatter['tags'] = []
                        else:
                            frontmatter['tags'] = []
                    elif key in ['title', 'excerpt']:
                        # Clean up title and excerpt
                        frontmatter[key] = value.strip('"\'')
                    elif key == 'on bgadoci.com](https':
                        # Fix malformed URLs in excerpt
                        if 'excerpt' in frontmatter:
                            frontmatter['excerpt'] = frontmatter['excerpt'] + " on bgadoci.com"
                    else:
                        frontmatter[key] = value.strip('"\'')
        
        # Ensure all required fields are present
        if 'title' not in frontmatter:
            # Try to extract title from content
            title_match = re.search(r'^# (.*?)$', post_content, re.MULTILINE)
            if title_match:
                frontmatter['title'] = title_match.group(1)
            else:
                frontmatter['title'] = os.path.basename(file_path).replace('.md', '').replace('-', ' ').title()
        
        if 'slug' not in frontmatter:
            frontmatter['slug'] = os.path.basename(file_path).replace('.md', '')
        
        if 'category' not in frontmatter:
            frontmatter['category'] = 'blog'
        
        if 'tags' not in frontmatter:
            frontmatter['tags'] = []
        
        if 'date' not in frontmatter:
            frontmatter['date'] = '2025-03-18'  # Default date
        
        if 'status' not in frontmatter:
            frontmatter['status'] = 'published'
        
        # Generate new frontmatter
        new_frontmatter = "---\n"
        
        # Ensure specific order for key fields
        priority_keys = ['title', 'slug', 'category', 'tags', 'date', 'status', 'coverImage', 'excerpt']
        
        # Add priority keys first
        for key in priority_keys:
            if key in frontmatter:
                if key == 'tags':
                    if isinstance(frontmatter[key], list):
                        tags_str = json.dumps(frontmatter[key])
                        new_frontmatter += f"{key}: {tags_str}\n"
                    else:
                        new_frontmatter += f"{key}: []\n"
                elif key in ['title', 'excerpt']:
                    # Properly quote title and excerpt
                    value = frontmatter[key].replace('"', '\\"')
                    new_frontmatter += f'{key}: "{value}"\n'
                else:
                    new_frontmatter += f"{key}: {frontmatter[key]}\n"
        
        # Add any remaining keys
        for key, value in frontmatter.items():
            if key not in priority_keys:
                new_frontmatter += f"{key}: {value}\n"
        
        new_frontmatter += "---\n\n"
        
        # Combine new frontmatter with post content
        new_content = new_frontmatter + post_content
        
        # Write updated content back to file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"✓ Updated {os.path.basename(file_path)}")
        return True
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("Starting blog frontmatter fix process...")
    
    # Get all markdown files in the blog directory
    blog_files = []
    for file in os.listdir(BLOG_DIR_PATH):
        if file.endswith('.md'):
            blog_files.append(os.path.join(BLOG_DIR_PATH, file))
    
    print(f"Found {len(blog_files)} blog files to process")
    
    # Process each blog post
    success_count = 0
    for file_path in blog_files:
        if clean_frontmatter(file_path):
            success_count += 1
    
    print(f"Completed updating {success_count} out of {len(blog_files)} blog posts")

if __name__ == "__main__":
    import json  # Import needed for JSON serialization
    main()
