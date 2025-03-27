# Squarespace to Next.js Redirects Generator

This script generates redirects from your Squarespace URLs to your new blog URLs, helping preserve your SEO value when migrating domains.

## Why Use This Script

1. **Preserve SEO Value**: Proper 301 redirects tell search engines that your content has permanently moved, transferring most of the "link juice"
2. **Maintain User Experience**: Users following old links will be automatically redirected to your new content
3. **Minimal Impact on Slug Size**: The generated redirects configuration adds very little to your Heroku slug size

## Prerequisites

You need the following Node.js packages:
- xml2js
- gray-matter
- js-yaml

## Installation

Install the required packages:

```bash
npm install xml2js gray-matter js-yaml
```

## Usage

Run the script with:

```bash
node generate_redirects.js --xml-path=docs/Squarespace-Wordpress-Export-03-18-2025.xml --content-dir=content/blog
```

### Options

- `--xml-path`: Path to your Squarespace WordPress export XML file (default: 'docs/Squarespace-Wordpress-Export-03-18-2025.xml')
- `--content-dir`: Directory containing your markdown blog posts (default: 'content/blog')
- `--output`: Output file for the redirects configuration (default: 'redirects.js')

## What the Script Does

1. Parses your Squarespace WordPress export XML file to extract old URLs and post names
2. Reads all your markdown files to get their slugs
3. Creates a mapping between old and new URLs based on matching slugs
4. Generates a Next.js redirects configuration file

## Implementing the Redirects

After running the script, you'll have a `redirects.js` file. To use these redirects in your Next.js app:

### Option 1: Copy into next.config.js

Copy the redirects array from `redirects.js` into your existing `next.config.js`:

```javascript
// next.config.js
module.exports = {
  // ... other config
  async redirects() {
    return [
      // ... paste redirects here
    ]
  },
}
```

### Option 2: Import into next.config.js

Import the redirects from the generated file:

```javascript
// next.config.js
const { redirects } = require('./redirects');

module.exports = {
  // ... other config
  async redirects
}
```

## Testing the Redirects

After deploying, you can test the redirects by:

1. Visiting an old URL path from your Squarespace site
2. Verifying you're redirected to the corresponding new URL
3. Checking the network tab in your browser's developer tools to confirm it's a 301 (permanent) redirect

## Troubleshooting

- If some redirects are missing, check for slug mismatches between your Squarespace export and new markdown files
- For manual adjustments, edit the generated `redirects.js` file
- The script also generates a YAML version (`redirects.js.yaml`) for easier reading and reference
