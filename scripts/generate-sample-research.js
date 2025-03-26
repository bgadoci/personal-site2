const fs = require('fs');
const path = require('path');

// Configuration
const NUM_PAPERS = 8;
const RESEARCH_DIR = path.join(__dirname, '../content/research');

// Sample data for generating research papers
const titles = [
  'Quantum Computing: A New Frontier',
  'The Ethics of Artificial Intelligence',
  'Climate Change Mitigation Strategies',
  'Blockchain Technology and Its Applications',
  'Neuroplasticity and Learning',
  'The Future of Renewable Energy',
  'Genetic Engineering: Promises and Perils',
  'Machine Learning in Healthcare',
  'Cybersecurity in the Digital Age',
  'Space Exploration and Colonization',
  'The Psychology of Decision Making',
  'Nanotechnology Applications',
  'Sustainable Development Goals',
  'The Impact of Social Media on Society',
  'Emerging Infectious Diseases'
];

const tags = [
  'AI', 'Ethics', 'Technology', 'Climate', 'Computing', 
  'Blockchain', 'Neuroscience', 'Energy', 'Genetics', 
  'Healthcare', 'Security', 'Space', 'Psychology', 
  'Sustainability', 'Social Media', 'Medicine'
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

// Function to generate markdown content for research papers
function generateMarkdownContent() {
  return `
## Abstract

This research paper explores the implications and potential applications of the subject matter. It presents a comprehensive analysis of current trends, challenges, and future directions.

## Introduction

The field has seen significant advancements in recent years, prompting a reevaluation of traditional approaches and methodologies. This paper aims to contribute to the ongoing discourse by providing insights based on empirical evidence and theoretical frameworks.

### Research Questions

1. What are the primary factors influencing the development of this field?
2. How do current methodologies compare to established practices?
3. What are the ethical implications of recent advancements?

## Methodology

Our research employed a mixed-methods approach, combining quantitative data analysis with qualitative interviews and case studies. This triangulation of methods allowed for a more robust examination of the research questions.

> "The integration of multiple methodological approaches provides a more comprehensive understanding of complex phenomena." — Research Methodology Journal

### Data Collection

Data was collected through:

- Surveys of 500+ professionals in the field
- In-depth interviews with 25 leading experts
- Analysis of 100+ case studies from various contexts

## Findings

Our analysis revealed several key findings:

\`\`\`
Finding 1: There is a strong correlation between X and Y factors (r=0.78, p<0.001)
Finding 2: Implementation challenges vary significantly by organizational context
Finding 3: Ethical considerations remain inadequately addressed in 68% of cases
\`\`\`

## Conclusion

This research contributes to the field by identifying critical factors for successful implementation and highlighting areas requiring further investigation. Future research should focus on addressing the ethical dimensions and developing more context-sensitive approaches.
`;
}

// Generate sample research papers
console.log(`Generating ${NUM_PAPERS} sample research papers...`);

for (let i = 0; i < NUM_PAPERS; i++) {
  // Get a random title that hasn't been used yet
  const titleIndex = i % titles.length;
  const title = titles[titleIndex];
  
  // Generate other paper data
  const slug = `sample-${slugify(title)}-${i + 1}`;
  const date = randomDate();
  const randomTagCount = Math.floor(Math.random() * 4) + 1; // 1-4 tags
  const paperTags = getRandomItems(tags, randomTagCount);
  
  // Create the paper content
  const paperContent = `---
title: "${title}"
slug: "${slug}"
category: "research"
tags: [${paperTags.map(tag => `"${tag}"`).join(', ')}]
date: "${date}"
status: "published"
coverImage: "/sample-cover-${(i % 5) + 1}.jpg"
---
${generateMarkdownContent()}
`;

  // Write to file
  fs.writeFileSync(path.join(RESEARCH_DIR, `${slug}.md`), paperContent);
  console.log(`Created: ${slug}.md`);
}

console.log('Sample research papers generated successfully!');
