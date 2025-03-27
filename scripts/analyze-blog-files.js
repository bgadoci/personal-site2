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

// Analyze all blog files
function analyzeBlogFiles() {
  console.log('Analyzing blog files...\n');
  
  const files = fs.readdirSync(blogDirectory);
  const issues = [];
  const stats = {
    total: files.length,
    randomFilenames: 0,
    slugMismatch: 0,
    slugIsRandom: 0,
    noIssues: 0
  };
  
  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    
    const filePath = path.join(blogDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    const filenameWithoutExt = filename.replace(/\.md$/, '');
    const hasRandomFilename = isLikelyRandomId(filenameWithoutExt);
    const hasRandomSlug = isLikelyRandomId(data.slug);
    const hasSlugMismatch = filenameWithoutExt !== data.slug;
    
    let issue = null;
    
    if (hasRandomFilename && hasRandomSlug) {
      issue = {
        filename,
        slug: data.slug,
        title: data.title,
        issue: 'Both filename and slug are random IDs',
        recommendation: 'Generate descriptive slug from title'
      };
      stats.randomFilenames++;
      stats.slugIsRandom++;
    } else if (hasRandomFilename && !hasRandomSlug) {
      issue = {
        filename,
        slug: data.slug,
        title: data.title,
        issue: 'Filename is random ID but slug is descriptive',
        recommendation: 'Rename file to match slug'
      };
      stats.randomFilenames++;
    } else if (!hasRandomFilename && hasRandomSlug) {
      issue = {
        filename,
        slug: data.slug,
        title: data.title,
        issue: 'Filename is descriptive but slug is random ID',
        recommendation: 'Update slug to match filename'
      };
      stats.slugIsRandom++;
    } else if (hasSlugMismatch) {
      issue = {
        filename,
        slug: data.slug,
        title: data.title,
        issue: 'Filename does not match slug',
        recommendation: 'Make filename match slug'
      };
      stats.slugMismatch++;
    } else {
      stats.noIssues++;
    }
    
    if (issue) {
      issues.push(issue);
    }
  });
  
  // Print summary
  console.log('Summary:');
  console.log(`Total blog files: ${stats.total}`);
  console.log(`Files with random filenames: ${stats.randomFilenames}`);
  console.log(`Files with random slugs: ${stats.slugIsRandom}`);
  console.log(`Files with slug/filename mismatch: ${stats.slugMismatch}`);
  console.log(`Files with no issues: ${stats.noIssues}`);
  console.log('\nDetailed issues:');
  
  // Print detailed issues
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.filename}`);
    console.log(`   Title: ${issue.title}`);
    console.log(`   Slug: ${issue.slug}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Recommendation: ${issue.recommendation}`);
  });
}

analyzeBlogFiles();
