#!/usr/bin/env python3
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime
import yaml

# Define paths
XML_FILE_PATH = '/Users/brandongadoci/Documents/markdown-mongo-platform/docs/Squarespace-Wordpress-Export-03-18-2025.xml'
BLOG_DIR_PATH = '/Users/brandongadoci/Documents/markdown-mongo-platform/content/blog'

# Function to parse the XML file and extract post data
def parse_xml_for_post_data():
    print("Parsing XML file for post data...")
    post_data = {}
    
    try:
        # Parse the XML file
        tree = ET.parse(XML_FILE_PATH)
        root = tree.getroot()
        
        # Find all items (blog posts)
        for item in root.findall('./channel/item'):
            title = item.find('title')
            link = item.find('link')
            post_date = item.find('.//{http://wordpress.org/export/1.2/}post_date')
            post_name = item.find('.//{http://wordpress.org/export/1.2/}post_name')
            post_type = item.find('.//{http://wordpress.org/export/1.2/}post_type')
            
            # Only process blog posts, not attachments or other types
            if post_type is not None and post_type.text == 'post' and title is not None and post_date is not None:
                title_text = title.text
                date_text = post_date.text
                slug = post_name.text if post_name is not None else None
                
                # Convert date to YYYY-MM-DD format
                try:
                    date_obj = datetime.strptime(date_text, '%Y-%m-%d %H:%M:%S')
                    formatted_date = date_obj.strftime('%Y-%m-%d')
                    
                    # Store by slug for easy lookup
                    if slug:
                        post_data[slug] = {
                            'title': title_text,
                            'date': formatted_date
                        }
                    
                    # Also store by title for fallback lookup
                    post_data[title_text] = {
                        'title': title_text,
                        'date': formatted_date,
                        'slug': slug
                    }
                except Exception as e:
                    print(f"Error parsing date for {title_text}: {e}")
        
        print(f"Found {len(post_data)} posts in XML file")
        return post_data
    
    except Exception as e:
        print(f"Error parsing XML file: {e}")
        return {}

# Function to fix tags in frontmatter
def fix_tags(tags_list):
    # Extract actual tags from the messy tags list
    fixed_tags = []
    
    for tag in tags_list:
        # Skip tags that are actually excerpt or coverImage
        if tag.startswith('excerpt:') or tag.startswith('coverImage:'):
            continue
        
        # Remove quotes and clean up the tag
        tag = tag.strip().strip('"').strip()
        
        # Skip empty tags
        if not tag or tag.startswith(' '):
            continue
            
        fixed_tags.append(tag)
    
    return fixed_tags

# Function to fix image paths
def fix_image_path(path):
    # Remove duplicate directories in the path
    if 'blog-images/blog-post-images/blog-images/blog-post-images' in path:
        path = path.replace('blog-images/blog-post-images/blog-images/blog-post-images', 'blog-images/blog-post-images')
    
    return path

# Function to update a single blog post
def update_blog_post(file_path, post_data):
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
        
        # Parse frontmatter
        try:
            frontmatter = yaml.safe_load("---\n" + frontmatter_text + "\n---")
        except Exception as e:
            print(f"Error parsing frontmatter in {file_path}: {e}")
            
            # Try a more manual approach
            frontmatter = {}
            for line in frontmatter_text.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    frontmatter[key.strip()] = value.strip()
        
        # Get the slug and title from frontmatter
        slug = frontmatter.get('slug', '').strip('"')
        title = frontmatter.get('title', '').strip('"')
        
        # Try to find the post in post_data
        post_info = None
        if slug and slug in post_data:
            post_info = post_data[slug]
        elif title and title in post_data:
            post_info = post_data[title]
        
        if not post_info:
            print(f"Could not find post data for {os.path.basename(file_path)}")
            
            # Still fix the frontmatter format issues even if we don't have date data
            new_frontmatter = {}
            new_frontmatter['title'] = title
            new_frontmatter['slug'] = slug
            new_frontmatter['category'] = frontmatter.get('category', 'blog')
            
            # Fix tags
            if 'tags' in frontmatter and isinstance(frontmatter['tags'], list):
                new_frontmatter['tags'] = fix_tags(frontmatter['tags'])
            else:
                new_frontmatter['tags'] = []
            
            # Keep existing date but fix format
            if 'date' in frontmatter:
                date_value = frontmatter['date']
                if isinstance(date_value, str):
                    date_value = date_value.strip('"')
                new_frontmatter['date'] = date_value
            
            new_frontmatter['status'] = frontmatter.get('status', 'published')
            
            # Fix coverImage if it exists
            if 'coverImage' in frontmatter:
                cover_image = frontmatter['coverImage']
                if isinstance(cover_image, str):
                    new_frontmatter['coverImage'] = fix_image_path(cover_image)
            
            # Keep excerpt if it exists
            if 'excerpt' in frontmatter:
                new_frontmatter['excerpt'] = frontmatter['excerpt']
        else:
            # Create new frontmatter with correct data
            new_frontmatter = {}
            new_frontmatter['title'] = title
            new_frontmatter['slug'] = slug
            new_frontmatter['category'] = frontmatter.get('category', 'blog')
            
            # Fix tags
            if 'tags' in frontmatter and isinstance(frontmatter['tags'], list):
                new_frontmatter['tags'] = fix_tags(frontmatter['tags'])
            else:
                new_frontmatter['tags'] = []
            
            # Update date from XML data
            new_frontmatter['date'] = post_info['date']
            new_frontmatter['status'] = frontmatter.get('status', 'published')
            
            # Fix coverImage if it exists
            if 'coverImage' in frontmatter:
                cover_image = frontmatter['coverImage']
                if isinstance(cover_image, str):
                    new_frontmatter['coverImage'] = fix_image_path(cover_image)
            
            # Keep excerpt if it exists
            if 'excerpt' in frontmatter:
                new_frontmatter['excerpt'] = frontmatter['excerpt']
        
        # Generate new frontmatter text
        new_frontmatter_text = yaml.dump(new_frontmatter, default_flow_style=False, allow_unicode=True)
        
        # Replace old frontmatter with new
        new_content = re.sub(r'^---\n(.*?)\n---', f'---\n{new_frontmatter_text}---', content, flags=re.DOTALL)
        
        # Write updated content back to file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"Updated {os.path.basename(file_path)}")
        return True
    
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

# Main function
def main():
    print("Starting blog frontmatter update process...")
    
    # Parse XML file for post data
    post_data = parse_xml_for_post_data()
    
    if not post_data:
        print("No post data found in XML file. Exiting.")
        return
    
    # Get all markdown files in the blog directory
    blog_files = []
    for file in os.listdir(BLOG_DIR_PATH):
        if file.endswith('.md'):
            blog_files.append(os.path.join(BLOG_DIR_PATH, file))
    
    print(f"Found {len(blog_files)} blog files to process")
    
    # Update each blog post
    success_count = 0
    for file_path in blog_files:
        if update_blog_post(file_path, post_data):
            success_count += 1
    
    print(f"Completed updating {success_count} out of {len(blog_files)} blog posts")

if __name__ == "__main__":
    main()
