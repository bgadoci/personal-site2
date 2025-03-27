#!/usr/bin/env python3
"""
Script to clean up local images after migration to Google Cloud Storage.
This script will:
1. Check the migration report to ensure all images were successfully migrated
2. Create a backup of your images (optional)
3. Remove the images from your public directory
"""

import os
import sys
import yaml
import shutil
import argparse
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'cleanup_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)
logger = logging.getLogger(__name__)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Clean up local images after migration to GCS.')
    parser.add_argument('--report', required=True, help='Path to the migration report YAML file')
    parser.add_argument('--backup', action='store_true', help='Create a backup of images before deletion')
    parser.add_argument('--backup-dir', default='./image_backup', help='Directory to store image backups')
    parser.add_argument('--dry-run', action='store_true', help='Simulate deletion without actually removing files')
    return parser.parse_args()

def load_migration_report(report_path):
    """Load the migration report from a YAML file."""
    try:
        with open(report_path, 'r') as f:
            report = yaml.safe_load(f)
        return report
    except Exception as e:
        logger.error(f"Failed to load migration report: {e}")
        sys.exit(1)

def verify_migration_success(report):
    """Verify that all images were successfully migrated."""
    if report.get('images_failed', 0) > 0:
        logger.error(f"Migration report shows {report['images_failed']} failed images. Aborting cleanup.")
        sys.exit(1)
    
    logger.info(f"Migration report shows all {report['images_uploaded']} images were successfully uploaded.")
    return True

def backup_images(image_paths, backup_dir, dry_run=False):
    """Create a backup of all migrated images."""
    if dry_run:
        logger.info(f"[DRY RUN] Would create backup directory: {backup_dir}")
        for image_path in image_paths:
            logger.info(f"[DRY RUN] Would backup: {image_path}")
        return
    
    os.makedirs(backup_dir, exist_ok=True)
    logger.info(f"Created backup directory: {backup_dir}")
    
    for image_path in image_paths:
        if os.path.exists(image_path):
            # Preserve directory structure in backup
            rel_path = os.path.relpath(image_path, '.')
            backup_path = os.path.join(backup_dir, rel_path)
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            
            shutil.copy2(image_path, backup_path)
            logger.info(f"Backed up: {image_path} to {backup_path}")

def delete_images(image_paths, dry_run=False):
    """Delete all migrated images from the local filesystem."""
    deleted_count = 0
    for image_path in image_paths:
        if os.path.exists(image_path):
            if dry_run:
                logger.info(f"[DRY RUN] Would delete: {image_path}")
            else:
                try:
                    os.remove(image_path)
                    logger.info(f"Deleted: {image_path}")
                    deleted_count += 1
                except Exception as e:
                    logger.error(f"Failed to delete {image_path}: {e}")
    
    logger.info(f"{'Would delete' if dry_run else 'Deleted'} {deleted_count} images")
    return deleted_count

def cleanup_empty_directories(base_dir, dry_run=False):
    """Remove empty directories after image deletion."""
    for root, dirs, files in os.walk(base_dir, topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            if not os.listdir(dir_path):  # Check if directory is empty
                if dry_run:
                    logger.info(f"[DRY RUN] Would remove empty directory: {dir_path}")
                else:
                    try:
                        os.rmdir(dir_path)
                        logger.info(f"Removed empty directory: {dir_path}")
                    except Exception as e:
                        logger.error(f"Failed to remove directory {dir_path}: {e}")

def main():
    """Main function to clean up local images."""
    args = parse_args()
    logger.info("Starting local image cleanup")
    logger.info(f"Dry run: {args.dry_run}")
    
    # Load and verify migration report
    report = load_migration_report(args.report)
    verify_migration_success(report)
    
    # Get list of image paths from the report
    image_paths = []
    for image_info in report.get('images', []):
        local_path = image_info.get('local_path')
        if local_path:
            image_paths.append(local_path)
    
    logger.info(f"Found {len(image_paths)} images to process")
    
    # Backup images if requested
    if args.backup:
        logger.info(f"Creating backup in {args.backup_dir}")
        backup_images(image_paths, args.backup_dir, args.dry_run)
    
    # Delete images
    deleted_count = delete_images(image_paths, args.dry_run)
    
    # Clean up empty directories
    if not args.dry_run:
        logger.info("Cleaning up empty directories")
        cleanup_empty_directories('./public/images', args.dry_run)
    
    logger.info("Cleanup complete!")
    logger.info(f"{'Would have deleted' if args.dry_run else 'Deleted'} {deleted_count} images")

if __name__ == "__main__":
    main()
