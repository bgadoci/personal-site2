#!/usr/bin/env python3
"""
Image Migration Script for Markdown-Mongo Platform

This script migrates images from local storage to Google Cloud Storage.
It processes markdown files to:
1. Find image references in both frontmatter and content
2. Upload images to Google Cloud Storage
3. Update markdown files with new GCS URLs
4. Create a log of all migrations

Usage:
    python migrate_images_to_gcs.py --credentials PATH_TO_CREDENTIALS --bucket BUCKET_NAME [--dry-run]

Requirements:
    - google-cloud-storage
    - python-frontmatter
    - pyyaml
"""

import os
import re
import sys
import argparse
import logging
from pathlib import Path
import frontmatter
import yaml
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"image_migration_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def setup_gcs_client(credentials_path):
    """Initialize Google Cloud Storage client with credentials."""
    try:
        from google.cloud import storage
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
        return storage.Client()
    except ImportError:
        logger.error("Google Cloud Storage library not installed. Run: pip install google-cloud-storage")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to initialize GCS client: {str(e)}")
        sys.exit(1)

def upload_to_gcs(client, bucket_name, source_path, destination_blob_name, dry_run=False):
    """Upload a file to Google Cloud Storage and return the public URL."""
    if dry_run:
        logger.info(f"[DRY RUN] Would upload {source_path} to gs://{bucket_name}/{destination_blob_name}")
        # Construct a fake URL for dry run
        return f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"
    
    try:
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        
        # Upload the file
        blob.upload_from_filename(source_path)
        
        # Make the blob publicly accessible
        blob.make_public()
        
        # Return the public URL
        public_url = blob.public_url
        logger.info(f"Uploaded {source_path} to {public_url}")
        return public_url
    except Exception as e:
        logger.error(f"Failed to upload {source_path}: {str(e)}")
        return None

def get_image_path(image_ref, base_dir):
    """Convert a markdown image reference to an absolute file path."""
    # Remove leading slash if present
    if image_ref.startswith('/'):
        image_ref = image_ref[1:]
    
    # First try with public directory prefix (Next.js convention)
    public_path = os.path.join(base_dir, 'public', image_ref)
    if os.path.exists(public_path):
        return public_path
    
    # Then try direct path
    direct_path = os.path.join(base_dir, image_ref)
    if os.path.exists(direct_path):
        return direct_path
    
    logger.warning(f"Image file not found: {public_path}")
    return None

def process_markdown_files(content_dir, base_dir, gcs_client, bucket_name, image_prefix="blog-images", dry_run=False):
    """Process all markdown files to replace local image paths with GCS URLs."""
    content_path = Path(content_dir)
    base_path = Path(base_dir)
    
    # Track all images that have been processed to avoid duplicates
    processed_images = {}
    migration_stats = {
        "files_processed": 0,
        "images_found": 0,
        "images_uploaded": 0,
        "images_failed": 0,
        "files_updated": 0
    }
    
    # Regular expression to find markdown image links
    img_pattern = r'!\[(.*?)\]\((\/images\/.*?)\)'
    
    for md_file in content_path.glob('**/*.md'):
        logger.info(f"Processing {md_file}...")
        migration_stats["files_processed"] += 1
        
        # Parse the frontmatter and content
        post = frontmatter.load(md_file)
        content = post.content
        modified = False
        
        # Process coverImage in frontmatter
        if 'coverImage' in post.metadata and post.metadata['coverImage'] and not post.metadata['coverImage'].startswith('http'):
            cover_image = post.metadata['coverImage']
            migration_stats["images_found"] += 1
            
            # Check if this image has already been processed
            if cover_image in processed_images:
                logger.info(f"Using cached URL for {cover_image}: {processed_images[cover_image]}")
                post.metadata['coverImage'] = processed_images[cover_image]
                modified = True
            else:
                # Get the absolute path to the image
                image_path = get_image_path(cover_image, base_path)
                
                if image_path:
                    # Determine destination blob name (preserve directory structure)
                    # If the path contains 'public/', remove it from the destination
                    if 'public/' in image_path:
                        rel_path = os.path.relpath(image_path, os.path.join(base_path, 'public'))
                    else:
                        rel_path = os.path.relpath(image_path, base_path)
                    
                    dest_blob_name = f"{image_prefix}/{rel_path}"
                    
                    # Upload to GCS
                    gcs_url = upload_to_gcs(gcs_client, bucket_name, image_path, dest_blob_name, dry_run)
                    
                    if gcs_url:
                        # Update frontmatter
                        post.metadata['coverImage'] = gcs_url
                        processed_images[cover_image] = gcs_url
                        modified = True
                        migration_stats["images_uploaded"] += 1
                    else:
                        migration_stats["images_failed"] += 1
        
        # Process inline images in content
        inline_images = re.findall(img_pattern, content)
        for alt_text, img_path in inline_images:
            migration_stats["images_found"] += 1
            
            # Check if this image has already been processed
            if img_path in processed_images:
                logger.info(f"Using cached URL for {img_path}: {processed_images[img_path]}")
                content = content.replace(f"![{alt_text}]({img_path})", f"![{alt_text}]({processed_images[img_path]})")
                modified = True
            else:
                # Get the absolute path to the image
                image_path = get_image_path(img_path, base_path)
                
                if image_path:
                    # Determine destination blob name (preserve directory structure)
                    # If the path contains 'public/', remove it from the destination
                    if 'public/' in image_path:
                        rel_path = os.path.relpath(image_path, os.path.join(base_path, 'public'))
                    else:
                        rel_path = os.path.relpath(image_path, base_path)
                    
                    dest_blob_name = f"{image_prefix}/{rel_path}"
                    
                    # Upload to GCS
                    gcs_url = upload_to_gcs(gcs_client, bucket_name, image_path, dest_blob_name, dry_run)
                    
                    if gcs_url:
                        # Update content
                        content = content.replace(f"![{alt_text}]({img_path})", f"![{alt_text}]({gcs_url})")
                        processed_images[img_path] = gcs_url
                        modified = True
                        migration_stats["images_uploaded"] += 1
                    else:
                        migration_stats["images_failed"] += 1
        
        # Save changes if the file was modified
        if modified:
            if not dry_run:
                post.content = content
                with open(md_file, 'w') as f:
                    f.write(frontmatter.dumps(post))
                logger.info(f"Updated {md_file} with GCS image URLs")
            else:
                logger.info(f"[DRY RUN] Would update {md_file} with GCS image URLs")
            migration_stats["files_updated"] += 1
    
    return migration_stats, processed_images

def main():
    parser = argparse.ArgumentParser(description='Migrate images from local storage to Google Cloud Storage')
    parser.add_argument('--credentials', required=True, help='Path to Google Cloud credentials JSON file')
    parser.add_argument('--bucket', required=True, help='Google Cloud Storage bucket name')
    parser.add_argument('--content-dir', default='content/blog', help='Directory containing markdown files')
    parser.add_argument('--base-dir', default='.', help='Base directory of the project')
    parser.add_argument('--image-prefix', default='blog-images', help='Prefix for image paths in GCS')
    parser.add_argument('--dry-run', action='store_true', help='Run without making actual changes')
    
    args = parser.parse_args()
    
    logger.info("Starting image migration to Google Cloud Storage")
    logger.info(f"Dry run: {args.dry_run}")
    
    # Setup GCS client
    if not args.dry_run:
        gcs_client = setup_gcs_client(args.credentials)
    else:
        gcs_client = "DRY_RUN"
    
    # Process markdown files
    stats, processed_images = process_markdown_files(
        os.path.join(args.base_dir, args.content_dir),
        args.base_dir,
        gcs_client,
        args.bucket,
        args.image_prefix,
        args.dry_run
    )
    
    # Log summary
    logger.info("Migration complete!")
    logger.info(f"Files processed: {stats['files_processed']}")
    logger.info(f"Images found: {stats['images_found']}")
    logger.info(f"Images uploaded: {stats['images_uploaded']}")
    logger.info(f"Images failed: {stats['images_failed']}")
    logger.info(f"Files updated: {stats['files_updated']}")
    
    # Save migration report
    report_file = f"migration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.yaml"
    with open(report_file, 'w') as f:
        yaml.dump({
            "stats": stats,
            "image_mappings": processed_images
        }, f)
    logger.info(f"Migration report saved to {report_file}")

if __name__ == "__main__":
    main()
