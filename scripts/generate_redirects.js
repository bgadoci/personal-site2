#!/usr/bin/env node

/**
 * Redirect Generator for Markdown-Mongo Platform
 * 
 * This script generates redirects from Squarespace URLs to new blog URLs by:
 * 1. Parsing the Squarespace WordPress export XML file
 * 2. Reading all markdown files to get their slugs
 * 3. Creating a mapping between old and new URLs
 * 4. Generating a Next.js redirects configuration
 * 
 * Usage:
 *   node generate_redirects.js --xml-path=docs/Squarespace-Wordpress-Export-03-18-2025.xml --content-dir=content/blog
 */

const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');
const matter = require('gray-matter');
const yaml = require('js-yaml');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace(/^--/, '')] = value;
  return acc;
}, {});

const XML_PATH = args['xml-path'] || 'docs/Squarespace-Wordpress-Export-03-18-2025.xml';
const CONTENT_DIR = args['content-dir'] || 'content/blog';
const OUTPUT_FILE = args['output'] || 'redirects.js';

async function main() {
  try {
    console.log('Starting redirect generation...');
    
    // Step 1: Parse the Squarespace XML file
    console.log(`Reading Squarespace XML from ${XML_PATH}...`);
    const xmlData = fs.readFileSync(XML_PATH, 'utf8');
    const result = await parseStringPromise(xmlData);
    
    // Extract posts from the XML
    const items = result.rss.channel[0].item || [];
    console.log(`Found ${items.length} posts in Squarespace XML`);
    
    // Create a map of old URLs to post names
    const oldUrlMap = {};
    items.forEach(item => {
      if (item.link && item.link[0] && item['wp:post_name'] && item['wp:post_name'][0]) {
        const oldUrl = item.link[0];
        const postName = item['wp:post_name'][0];
        oldUrlMap[postName] = oldUrl;
      }
    });
    
    // Step 2: Read all markdown files to get their slugs
    console.log(`Reading markdown files from ${CONTENT_DIR}...`);
    const markdownFiles = fs.readdirSync(CONTENT_DIR)
      .filter(file => file.endsWith('.md'));
    
    console.log(`Found ${markdownFiles.length} markdown files`);
    
    // Create a map of slugs to file names
    const slugMap = {};
    markdownFiles.forEach(file => {
      const filePath = path.join(CONTENT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(content);
      
      if (data.slug) {
        slugMap[data.slug] = file;
      }
    });
    
    // Step 3: Create a mapping between old and new URLs
    const redirects = [];
    
    Object.entries(oldUrlMap).forEach(([postName, oldUrl]) => {
      // Try to find a matching slug
      const matchingSlug = Object.keys(slugMap).find(slug => 
        slug === postName || 
        slug.includes(postName) || 
        postName.includes(slug)
      );
      
      if (matchingSlug) {
        // Parse the old URL to get the path
        let oldPath = '';
        try {
          // Handle both full URLs and relative paths
          if (oldUrl.startsWith('http')) {
            oldPath = new URL(oldUrl).pathname;
          } else {
            oldPath = oldUrl;
          }
        } catch (e) {
          oldPath = oldUrl; // Fallback to using the raw value
        }
        
        // Create the new URL path
        const newPath = `/blog/${matchingSlug}`;
        
        // Add to redirects
        redirects.push({
          source: oldPath,
          destination: newPath,
          permanent: true
        });
      }
    });
    
    console.log(`Generated ${redirects.length} redirects`);
    
    // Step 4: Generate Next.js redirects configuration
    const nextConfig = `
/**
 * Generated redirects from Squarespace to new blog URLs
 * Generated on: ${new Date().toISOString()}
 * Total redirects: ${redirects.length}
 */

module.exports = {
  async redirects() {
    return ${JSON.stringify(redirects, null, 2)}
  }
}
`;
    
    fs.writeFileSync(OUTPUT_FILE, nextConfig);
    console.log(`Redirects configuration written to ${OUTPUT_FILE}`);
    
    // Also output as YAML for reference
    const yamlOutput = yaml.dump({ redirects });
    fs.writeFileSync(`${OUTPUT_FILE}.yaml`, yamlOutput);
    console.log(`Redirects also saved as YAML to ${OUTPUT_FILE}.yaml`);
    
  } catch (error) {
    console.error('Error generating redirects:', error);
    process.exit(1);
  }
}

main();
