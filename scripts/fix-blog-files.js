const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Path to blog content
const blogDirectory = path.join(process.cwd(), 'content/blog');

// Function to check if a string is likely a random ID
function isLikelyRandomId(str) {
  // Check if the string is mostly alphanumeric with no meaningful words
  const alphanumericRatio = (str.match(/[a-z0-9]/g) || []).length / str.length;
  return alphanumericRatio > 0.9 && str.length > 10 && !/^[a-z]+-[a-z]+-[a-z]+/.test(str);
}

// Function to generate a slug from a title
function generateSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

// Function to fix a single blog file
function fixBlogFile(filename) {
  const filePath = path.join(blogDirectory, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  const filenameWithoutExt = filename.replace(/\.md$/, '');
  const hasRandomFilename = isLikelyRandomId(filenameWithoutExt);
  const hasRandomSlug = isLikelyRandomId(data.slug);
  
  // Generate a new slug if needed
  let newSlug = data.slug;
  if (hasRandomSlug) {
    newSlug = generateSlugFromTitle(data.title);
    console.log(`Updating slug for "${filename}" from "${data.slug}" to "${newSlug}"`);
    
    // Update the frontmatter
    data.slug = newSlug;
    
    // Write the updated content back to the file
    const updatedContent = matter.stringify(content, data);
    fs.writeFileSync(filePath, updatedContent);
  }
  
  // Rename the file if needed
  if (hasRandomFilename || filenameWithoutExt !== newSlug) {
    const newFilename = `${newSlug}.md`;
    const newFilePath = path.join(blogDirectory, newFilename);
    
    // Check if the destination file already exists
    if (fs.existsSync(newFilePath) && filePath !== newFilePath) {
      console.log(`Warning: Cannot rename "${filename}" to "${newFilename}" because the destination file already exists.`);
      return {
        originalFilename: filename,
        newFilename: filename, // No change
        originalSlug: data.slug,
        newSlug: data.slug
      };
    }
    
    console.log(`Renaming "${filename}" to "${newFilename}"`);
    fs.renameSync(filePath, newFilePath);
    
    return {
      originalFilename: filename,
      newFilename,
      originalSlug: hasRandomSlug ? data.slug : newSlug,
      newSlug
    };
  }
  
  return {
    originalFilename: filename,
    newFilename: filename, // No change
    originalSlug: data.slug,
    newSlug: data.slug
  };
}

// Fix all blog files
function fixAllBlogFiles() {
  console.log('Fixing blog files...\n');
  
  const files = fs.readdirSync(blogDirectory);
  const results = [];
  
  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    
    try {
      const result = fixBlogFile(filename);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  });
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Total files processed: ${results.length}`);
  console.log(`Files renamed: ${results.filter(r => r.originalFilename !== r.newFilename).length}`);
  console.log(`Slugs updated: ${results.filter(r => r.originalSlug !== r.newSlug).length}`);
  
  // Create a log of changes for reference
  const changes = results.filter(r => r.originalFilename !== r.newFilename || r.originalSlug !== r.newSlug);
  if (changes.length > 0) {
    const logContent = changes.map(change => 
      `${change.originalFilename} -> ${change.newFilename} (slug: ${change.originalSlug} -> ${change.newSlug})`
    ).join('\n');
    
    fs.writeFileSync(path.join(process.cwd(), 'scripts/blog-file-changes.log'), logContent);
    console.log('\nA log of changes has been saved to scripts/blog-file-changes.log');
  }
}

fixAllBlogFiles();
