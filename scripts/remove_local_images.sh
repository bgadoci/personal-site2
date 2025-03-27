#!/bin/bash
# Script to remove local images after migration to Google Cloud Storage

# Create a backup (optional)
if [ "$1" == "--backup" ]; then
  echo "Creating backup of images..."
  mkdir -p image_backup
  cp -r public/images image_backup/
  echo "Backup created in image_backup directory"
fi

# Count the number of image files
image_count=$(find public/images -type f | grep -v ".DS_Store" | wc -l)
echo "Found $image_count image files to remove"

# Calculate the total size
total_size=$(du -sh public/images | cut -f1)
echo "Total size of images: $total_size"

# Confirm before proceeding
echo "Are you sure you want to remove all images from public/images? (y/n)"
read -r confirm

if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
  # Remove all image files but keep the directory structure
  find public/images -type f -not -path "*/\.*" -delete
  echo "All image files have been removed"
  
  # Report the new size
  new_size=$(du -sh public/images | cut -f1)
  echo "New size of public/images directory: $new_size"
else
  echo "Operation cancelled"
fi
