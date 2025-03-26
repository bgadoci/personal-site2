#!/usr/bin/env python3
import os
import re
import sys
import glob
import shutil
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.parse import urlparse, unquote
from html.parser import HTMLParser
import html

# Configuration
BLOG_DIR = '/Users/brandongadoci/Documents/markdown-mongo-platform/content/blog'
IMAGES_DIR = '/Users/brandongadoci/Documents/markdown-mongo-platform/public/images/blog-images/blog-post-images'
XML_FILE = '/Users/brandongadoci/Documents/markdown-mongo-platform/docs/Squarespace-Wordpress-Export-03-18-2025.xml'

# Create images directory if it doesn't exist
os.makedirs(IMAGES_DIR, exist_ok=True)

# HTML to Markdown converter
class HTMLToMarkdownParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.in_paragraph = False
        self.in_strong = False
        self.in_em = False
        self.in_a = False
        self.a_href = ""
        self.in_h1 = False
        self.in_h2 = False
        self.in_h3 = False
        self.in_h4 = False
        self.in_ul = False
        self.in_ol = False
        self.in_li = False
        self.in_code = False
        self.in_pre = False
        self.in_blockquote = False
        self.image_urls = []
        self.list_items = []
        self.first_image_url = None
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'p':
            self.in_paragraph = True
        elif tag == 'strong' or tag == 'b':
            self.in_strong = True
            self.result.append('**')
        elif tag == 'em' or tag == 'i':
            self.in_em = True
            self.result.append('*')
        elif tag == 'a':
            self.in_a = True
            self.a_href = attrs_dict.get('href', '')
            self.result.append('[')
        elif tag == 'h1':
            self.in_h1 = True
            self.result.append('# ')
        elif tag == 'h2':
            self.in_h2 = True
            self.result.append('## ')
        elif tag == 'h3':
            self.in_h3 = True
            self.result.append('### ')
        elif tag == 'h4':
            self.in_h4 = True
            self.result.append('#### ')
        elif tag == 'ul':
            self.in_ul = True
        elif tag == 'ol':
            self.in_ol = True
        elif tag == 'li':
            self.in_li = True
            if self.in_ul:
                self.result.append('- ')
            elif self.in_ol:
                self.result.append('1. ')  # Markdown will auto-number
        elif tag == 'code':
            self.in_code = True
            self.result.append('`')
        elif tag == 'pre':
            self.in_pre = True
            self.result.append('```\n')
        elif tag == 'blockquote':
            self.in_blockquote = True
            self.result.append('> ')
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt', '')
            if src:
                self.image_urls.append(src)
                # Store the first image URL for coverImage
                if self.first_image_url is None:
                    self.first_image_url = src
                
                # Extract filename from URL
                parsed_url = urlparse(src)
                filename = os.path.basename(unquote(parsed_url.path))
                # Clean up filename
                filename = re.sub(r'[^\w\-.]', '_', filename)
                # Add image markdown
                self.result.append(f'![{alt}](/images/blog-images/blog-post-images/{filename})')
        elif tag == 'br':
            self.result.append('\n')
            
    def handle_endtag(self, tag):
        if tag == 'p':
            self.in_paragraph = False
            self.result.append('\n\n')
        elif tag == 'strong' or tag == 'b':
            self.in_strong = False
            self.result.append('**')
        elif tag == 'em' or tag == 'i':
            self.in_em = False
            self.result.append('*')
        elif tag == 'a':
            self.in_a = False
            self.result.append(f']({self.a_href})')
        elif tag == 'h1':
            self.in_h1 = False
            self.result.append('\n\n')
        elif tag == 'h2':
            self.in_h2 = False
            self.result.append('\n\n')
        elif tag == 'h3':
            self.in_h3 = False
            self.result.append('\n\n')
        elif tag == 'h4':
            self.in_h4 = False
            self.result.append('\n\n')
        elif tag == 'ul':
            self.in_ul = False
            self.result.append('\n')
        elif tag == 'ol':
            self.in_ol = False
            self.result.append('\n')
        elif tag == 'li':
            self.in_li = False
            self.result.append('\n')
        elif tag == 'code':
            self.in_code = False
            self.result.append('`')
        elif tag == 'pre':
            self.in_pre = False
            self.result.append('\n```\n')
        elif tag == 'blockquote':
            self.in_blockquote = False
            self.result.append('\n\n')
            
    def handle_data(self, data):
        if any([self.in_paragraph, self.in_h1, self.in_h2, self.in_h3, self.in_h4, 
                self.in_strong, self.in_em, self.in_a, self.in_li, self.in_code, 
                self.in_pre, self.in_blockquote]):
            self.result.append(data)
            
    def get_markdown(self):
        return ''.join(self.result)
    
    def get_image_urls(self):
        return self.image_urls
    
    def get_first_image_url(self):
        return self.first_image_url

def html_to_markdown(html_content):
    parser = HTMLToMarkdownParser()
    parser.feed(html_content)
    return parser.get_markdown(), parser.get_image_urls(), parser.get_first_image_url()

def download_image(url, save_path):
    """Download an image from a URL and save it to the specified path"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"Downloaded: {os.path.basename(save_path)}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def clean_slug(text):
    """Convert text to a clean slug"""
    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[\s_]+', '-', slug)
    return slug

def clean_filename(filename):
    """Clean up a filename to be safe for filesystem"""
    # Remove URL encoding and special characters
    clean_name = unquote(filename)
    clean_name = re.sub(r'[^\w\-.]', '_', clean_name)
    return clean_name

def extract_tags(categories):
    """Extract tags from WordPress categories"""
    tags = []
    for category in categories:
        tag = category.text.strip()
        if tag and tag.lower() != 'uncategorized':
            # Convert to kebab-case
            tag_slug = clean_slug(tag)
            tags.append(tag_slug)
    return tags

def generate_tags_from_content(title, content, excerpt):
    """Generate tags from post content when no categories are available"""
    # Common keywords to look for in AI, tech, and business content
    common_keywords = [
        'ai', 'artificial-intelligence', 'machine-learning', 'data', 'analytics',
        'business', 'enterprise', 'technology', 'innovation', 'leadership',
        'productivity', 'strategy', 'operations', 'management', 'digital-transformation',
        'ai-operations', 'generative-ai', 'llm', 'large-language-models',
        'chatgpt', 'openai', 'automation', 'workflow', 'efficiency',
        'case-study', 'tutorial', 'guide', 'best-practices', 'tips',
        'career', 'personal-development', 'learning', 'education',
        'family', 'work-life-balance', 'remote-work', 'collaboration'
    ]
    
    # Combine all text for analysis
    all_text = f"{title} {content} {excerpt}".lower()
    
    # Find matching keywords
    found_tags = []
    for keyword in common_keywords:
        # Convert keyword to regular text for searching
        search_term = keyword.replace('-', ' ')
        if search_term in all_text:
            found_tags.append(keyword)
    
    # Limit to 5 most relevant tags
    return found_tags[:5] if found_tags else ['blog']

def process_post(item):
    """Process a WordPress post item and convert to markdown"""
    # Extract post data
    title_elem = item.find('.//title')
    title = title_elem.text if title_elem is not None else "Untitled Post"
    
    # Get slug
    slug_elem = item.find('.//{http://wordpress.org/export/1.2/}post_name')
    if slug_elem is not None and slug_elem.text:
        slug = slug_elem.text
    else:
        slug = clean_slug(title)
    
    # Get content
    content_elem = item.find('.//{http://purl.org/rss/1.0/modules/content/}encoded')
    content_html = content_elem.text if content_elem is not None else ""
    
    # Get excerpt
    excerpt_elem = item.find('.//{http://wordpress.org/export/1.2/excerpt/}encoded')
    excerpt_html = excerpt_elem.text if excerpt_elem is not None else ""
    
    # Convert HTML to markdown
    content_md, image_urls, first_image_url = html_to_markdown(content_html)
    excerpt_md, _, _ = html_to_markdown(excerpt_html)
    
    # Check if the first image is at the beginning of the content
    # Pattern to match image markdown at the beginning of content
    if first_image_url and content_md.startswith(f'!['):  
        # Find the first occurrence of the image markdown
        image_pattern = re.compile(r'^!\[.*?\]\(/images/blog-images/blog-post-images/[^)]+\)')
        match = image_pattern.search(content_md)
        if match:
            # Remove the first image from the content
            content_md = content_md[match.end():].lstrip()
    
    # Clean up excerpt (remove HTML tags and limit length)
    excerpt = re.sub(r'<[^>]*>', '', excerpt_html)
    excerpt = excerpt.strip()
    if len(excerpt) > 200:
        excerpt = excerpt[:197] + "..."
    
    # Get post date
    date_elem = item.find('.//{http://wordpress.org/export/1.2/}post_date')
    if date_elem is not None and date_elem.text:
        date_str = date_elem.text
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            date = date_obj.strftime('%Y-%m-%d')
        except ValueError:
            date = "2025-03-18"  # Default date
    else:
        date = "2025-03-18"  # Default date
    
    # Get categories/tags
    categories = item.findall('.//category')
    tags = extract_tags(categories)
    
    # Always generate additional tags from content and combine with existing tags
    content_tags = generate_tags_from_content(title, content_html, excerpt)
    
    # Combine tags, remove duplicates, and limit to 5
    combined_tags = list(set(tags + content_tags))
    tags = combined_tags[:5] if len(combined_tags) > 5 else combined_tags
    
    # Download images
    cover_image_path = None
    for img_url in image_urls:
        parsed_url = urlparse(img_url)
        filename = os.path.basename(parsed_url.path)
        clean_name = clean_filename(filename)
        save_path = os.path.join(IMAGES_DIR, clean_name)
        download_image(img_url, save_path)
        
        # If this is the first image, set it as the cover image
        if img_url == first_image_url:
            cover_image_path = f"/images/blog-images/blog-post-images/{clean_name}"
    
    # Create frontmatter
    frontmatter = f"""---
title: "{html.escape(title)}"
slug: "{slug}"
category: "blog"
tags: {tags}
date: "{date}"
status: "published"
"""
    
    # Add cover image if available
    if cover_image_path:
        frontmatter += f'coverImage: "{cover_image_path}"\n'
    
    # Add excerpt
    frontmatter += f'excerpt: "{html.escape(excerpt)}"\n---\n\n'
    
    # Create markdown file
    markdown_content = frontmatter + content_md
    
    # Save to file
    file_path = os.path.join(BLOG_DIR, f"{slug}.md")
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(markdown_content)
    
    print(f"Created: {slug}.md")
    return file_path

def main():
    # Delete existing blog posts
    print("Deleting existing blog posts...")
    existing_posts = glob.glob(os.path.join(BLOG_DIR, "*.md"))
    for post in existing_posts:
        os.remove(post)
    print(f"Deleted {len(existing_posts)} existing posts")
    
    # Parse XML file
    print(f"Parsing XML file: {XML_FILE}")
    try:
        tree = ET.parse(XML_FILE)
        root = tree.getroot()
        
        # Find all items that are posts
        channel = root.find('channel')
        if channel is None:
            print("Error: Could not find channel element in XML")
            return
        
        items = channel.findall('item')
        post_items = [item for item in items if item.find('.//{http://wordpress.org/export/1.2/}post_type').text == 'post']
        
        print(f"Found {len(post_items)} blog posts in XML")
        
        # Process each post
        processed_count = 0
        for item in post_items:
            try:
                process_post(item)
                processed_count += 1
            except Exception as e:
                print(f"Error processing post: {e}")
        
        print(f"Successfully processed {processed_count} out of {len(post_items)} posts")
        
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return

if __name__ == "__main__":
    main()
