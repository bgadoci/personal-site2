# Image Migration to Google Cloud Storage

This script migrates images from your local `/public/images` directory to Google Cloud Storage (GCS) and updates all references in your markdown files.

## Why Use This Script

1. **Reduce Heroku Slug Size**: Moving images to GCS will significantly reduce your Heroku slug size, keeping it well under the 500MB limit
2. **Improve Performance**: Serving images from GCS is faster than serving them from your Heroku dyno
3. **Scalability**: GCS is designed for storing and serving static assets at scale

## Prerequisites

1. Google Cloud account with a project set up
2. Google Cloud Storage bucket created
3. Service account credentials with permissions to write to the bucket

## Installation

Install the required Python packages:

```bash
pip install google-cloud-storage python-frontmatter pyyaml
```

## Usage

### 1. Set Up Google Cloud Storage

1. Create a GCS bucket in your Google Cloud Console
2. Create a service account with Storage Object Admin permissions
3. Download the service account credentials JSON file

### 2. Run a Dry Run First

It's recommended to run the script in dry-run mode first to see what changes would be made without actually uploading files or modifying your markdown:

```bash
python migrate_images_to_gcs.py --credentials path/to/credentials.json --bucket your-bucket-name --dry-run
```

### 3. Run the Full Migration

Once you're satisfied with the dry run, run the full migration:

```bash
python migrate_images_to_gcs.py --credentials path/to/credentials.json --bucket your-bucket-name
```

### 4. Additional Options

- `--content-dir`: Specify a different content directory (default: 'content/blog')
- `--base-dir`: Specify the base directory of the project (default: '.')
- `--image-prefix`: Specify a prefix for image paths in GCS (default: 'blog-images')

## What the Script Does

1. Scans all markdown files in your content directory
2. Identifies image references in both frontmatter (`coverImage`) and content (markdown image syntax)
3. Uploads each image to Google Cloud Storage
4. Updates the markdown files with the new GCS URLs
5. Creates a log file and migration report

## After Migration

1. Verify that all images are correctly displayed in your application
2. You can safely remove the images from your `/public/images` directory to reduce your Heroku slug size
3. Commit and push the changes to your repository

## Troubleshooting

- Check the generated log file for any errors
- Review the migration report for a summary of the changes made
- If images are not displaying, ensure your GCS bucket has public access enabled
