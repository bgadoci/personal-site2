const fs = require('fs');
const path = require('path');

// Configuration
const NUM_POSTS = 10;
const BLOG_DIR = path.join(__dirname, '../content/blog');

// Sample data for generating posts
const titles = [
  'Getting Started with Next.js',
  'Understanding TypeScript Generics',
  'Building Responsive UIs with Tailwind CSS',
  'MongoDB Atlas: A Comprehensive Guide',
  'Implementing Authentication in Next.js',
  'Creating a Blog with Markdown',
  'State Management in React Applications',
  'Optimizing Performance in Next.js',
  'Deploying to Vercel',
  'Working with the App Router',
  'Server Components vs. Client Components',
  'API Routes in Next.js',
  'CSS-in-JS Solutions for React',
  'Testing React Applications',
  'Accessibility in Web Development'
];

const tags = [
  'Next.js', 'React', 'TypeScript', 'JavaScript', 'MongoDB', 
  'Tailwind CSS', 'Web Development', 'Frontend', 'Backend',
  'Authentication', 'Performance', 'Deployment', 'Testing',
  'Accessibility', 'CSS', 'API', 'State Management'
];

// Function to generate a random date in the past year
function randomDate() {
  const now = new Date();
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomTime = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
  const date = new Date(randomTime);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Function to generate a random slug from a title
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to get random items from an array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to generate markdown content
function generateMarkdownContent() {
  return `
## Introduction

This is a sample blog post generated for testing pagination. It contains various markdown elements to demonstrate the formatting capabilities.

### Key Features

- Feature one with some details
- Feature two with even more details
- Feature three with the most details

## Main Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.

> This is a blockquote that demonstrates the styling of blockquotes in our markdown processor.

### Code Example

\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

## Conclusion

This is the conclusion of our sample blog post. We hope you found it informative and engaging.
`;
}

// Generate sample blog posts
console.log(`Generating ${NUM_POSTS} sample blog posts...`);

for (let i = 0; i < NUM_POSTS; i++) {
  // Get a random title that hasn't been used yet
  const titleIndex = i % titles.length;
  const title = titles[titleIndex];
  
  // Generate other post data
  const slug = `sample-${slugify(title)}-${i + 1}`;
  const date = randomDate();
  const randomTagCount = Math.floor(Math.random() * 4) + 1; // 1-4 tags
  const postTags = getRandomItems(tags, randomTagCount);
  
  // Create the post content
  const postContent = `---
title: "${title}"
slug: "${slug}"
category: "blog"
tags: [${postTags.map(tag => `"${tag}"`).join(', ')}]
date: "${date}"
status: "published"
coverImage: "/sample-cover-${(i % 5) + 1}.jpg"
---
${generateMarkdownContent()}
`;

  // Write to file
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), postContent);
  console.log(`Created: ${slug}.md`);
}

console.log('Sample blog posts generated successfully!');
