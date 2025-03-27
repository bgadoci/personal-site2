/**
 * Book Embeddings Generator Script (Direct Version)
 * 
 * This script processes book chapters from the content directory,
 * generates embeddings using OpenAI, and stores them in MongoDB.
 * 
 * Usage:
 *   node scripts/generate_book_embeddings_direct.js [--chapter=<slug>]
 * 
 * Options:
 *   --chapter=<slug>  Process only the specified chapter
 *   --dry-run         Run without storing embeddings (for testing)
 *   --help            Show this help message
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const matter = require('gray-matter');
const { OpenAI } = require('openai');
const { MongoClient } = require('mongodb');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// MongoDB connection
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Helper functions
function extractChapterNumber(title) {
  // Try to extract from title format "Chapter X: Title"
  const chapterMatch = title.match(/Chapter\s+(\d+):/i);
  if (chapterMatch && chapterMatch[1]) {
    return parseInt(chapterMatch[1], 10);
  }
  
  // Try to extract from filename format "chapterXX_title.md"
  const filenameMatch = title.match(/chapter(\d+)_/i);
  if (filenameMatch && filenameMatch[1]) {
    return parseInt(filenameMatch[1], 10);
  }
  
  // Default to 0 if no number found
  return 0;
}

function createAnchor(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function calculateOffset(fullContent, chunkText) {
  return fullContent.indexOf(chunkText);
}

function parseContentSections(content) {
  // Split content by h2 headers (## Title)
  const sections = [];
  const h2Regex = /^##\s+(.+)$/gm;
  
  let lastIndex = 0;
  let match;
  let currentTitle = 'Introduction'; // Default title for content before first h2
  
  // Find all h2 headers
  while ((match = h2Regex.exec(content)) !== null) {
    // If we've moved past the start, add the previous section
    if (lastIndex > 0) {
      const sectionContent = content.substring(lastIndex, match.index).trim();
      sections.push({
        title: currentTitle,
        content: sectionContent
      });
    } else if (match.index > 0) {
      // Handle content before the first h2
      const introContent = content.substring(0, match.index).trim();
      if (introContent) {
        sections.push({
          title: currentTitle,
          content: introContent
        });
      }
    }
    
    // Update for next iteration
    currentTitle = match[1].trim();
    lastIndex = match.index + match[0].length;
  }
  
  // Add the last section (or the only section if no h2 headers)
  if (lastIndex < content.length) {
    const remainingContent = content.substring(lastIndex).trim();
    if (remainingContent) {
      sections.push({
        title: currentTitle,
        content: remainingContent
      });
    }
  } else if (sections.length === 0 && content.trim()) {
    // If no sections were found but content exists
    sections.push({
      title: currentTitle,
      content: content.trim()
    });
  }
  
  return sections;
}

function splitIntoChunks(text, maxTokens = 500) {
  // Simple estimation: 1 token ≈ 4 characters for English text
  const avgCharsPerToken = 4;
  const maxChars = maxTokens * avgCharsPerToken;
  
  // If text is already small enough, return as is
  if (text.length <= maxChars) {
    return [text];
  }
  
  const chunks = [];
  const paragraphs = text.split(/\n\s*\n/); // Split by paragraph breaks
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    // If a single paragraph is too long, split it further
    if (paragraph.length > maxChars) {
      // If we have content in the current chunk, save it first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split long paragraph by sentences (roughly)
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If a single sentence is too long (rare but possible)
        if (sentence.length > maxChars) {
          // If we have content in the current chunk, save it first
          if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
          }
          
          // Split the sentence into chunks of maxChars
          for (let i = 0; i < sentence.length; i += maxChars) {
            chunks.push(sentence.substring(i, i + maxChars).trim());
          }
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if there's anything left
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function estimateTokenCount(text) {
  // Simple estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Generate embedding for text
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Process a chapter for embeddings
async function processChapterForEmbeddings(filePath) {
  // Read the file
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Extract chapter metadata
  const title = data.title;
  const slug = data.slug;
  const chapterNumber = extractChapterNumber(title);
  
  // Parse the content to identify sections
  const sections = parseContentSections(content);
  
  let chunksWithEmbeddings = [];
  let position = 0;
  
  console.log(`Processing chapter: ${title} with ${sections.length} sections`);
  
  // Process each section
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    
    // Get section metadata
    const sectionTitle = section.title;
    const sectionNumber = `${chapterNumber}.${sectionIndex + 1}`;
    
    // Create anchor for direct linking
    const sectionAnchor = createAnchor(sectionTitle);
    
    // Split section content into chunks
    const sectionChunks = splitIntoChunks(section.content);
    
    console.log(`  Section: ${sectionTitle} - ${sectionChunks.length} chunks`);
    
    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < sectionChunks.length; chunkIndex++) {
      const chunkText = sectionChunks[chunkIndex];
      const tokenCount = estimateTokenCount(chunkText);
      
      // Create the content chunk
      const chunk = {
        chapter_slug: slug,
        chapter_number: chapterNumber,
        chapter_title: title,
        section_title: sectionTitle,
        section_number: sectionNumber,
        position_in_chapter: position++,
        content_start_offset: calculateOffset(content, chunkText),
        content: chunkText,
        token_count: tokenCount,
        citation: {
          display_text: `Chapter ${chapterNumber}: ${title.split(":")[1]?.trim() || title}, Section: ${sectionTitle}`,
          url_path: `/book/${slug}#${sectionAnchor}`
        }
      };
      
      // Generate embedding for this chunk
      try {
        const embedding = await generateEmbedding(chunkText);
        
        // Add embedding and timestamps
        const chunkWithEmbedding = {
          ...chunk,
          embedding: embedding,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        chunksWithEmbeddings.push(chunkWithEmbedding);
      } catch (error) {
        console.error(`Error generating embedding for chunk in ${title}, section ${sectionTitle}:`, error);
      }
    }
  }
  
  return chunksWithEmbeddings;
}

// Store embeddings in MongoDB
async function storeEmbeddings(chunks) {
  try {
    const client = await connectToMongoDB();
    const db = client.db('content-platform');
    const collection = db.collection('book_embeddings');
    
    // Create indexes if they don't exist
    await collection.createIndex({ chapter_slug: 1 });
    await collection.createIndex({ "citation.url_path": 1 });
    
    // Create vector search index if it doesn't exist
    // Note: This requires MongoDB Atlas with vector search capability
    try {
      // Check if index exists first to avoid errors
      const indexes = await db.command({ listIndexes: 'book_embeddings' });
      const hasVectorIndex = indexes.cursor.firstBatch.some(
        (idx) => idx.name === 'vector_index'
      );
      
      if (!hasVectorIndex) {
        await db.command({
          createIndexes: 'book_embeddings',
          indexes: [
            {
              name: 'vector_index',
              key: { embedding: 'vector' },
              vectorOptions: {
                dimensions: 1536, // OpenAI's text-embedding-3-small size
                similarity: 'cosine'
              }
            }
          ]
        });
        console.log('Created vector search index');
      }
    } catch (error) {
      console.warn('Could not create vector search index:', error);
      console.log('Vector search functionality may be limited');
    }
    
    // Prepare bulk operations
    const operations = chunks.map(chunk => ({
      updateOne: {
        filter: { 
          chapter_slug: chunk.chapter_slug,
          position_in_chapter: chunk.position_in_chapter
        },
        update: { $set: chunk },
        upsert: true
      }
    }));
    
    // Execute bulk write
    if (operations.length > 0) {
      const result = await collection.bulkWrite(operations);
      console.log(`Stored ${result.upsertedCount} new chunks, modified ${result.modifiedCount} existing chunks`);
      await client.close();
      return { 
        success: true, 
        message: `Stored ${result.upsertedCount} new chunks, modified ${result.modifiedCount} existing chunks` 
      };
    }
    
    await client.close();
    return { success: true, message: 'No chunks to store' };
  } catch (error) {
    console.error('Error storing embeddings:', error);
    return { 
      success: false, 
      message: `Error storing embeddings: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Main function
async function main() {
  try {
    // Parse command line arguments
    program
      .option('--chapter <slug>', 'Process only the specified chapter')
      .option('--dry-run', 'Run without storing embeddings (for testing)')
      .option('--help', 'Show help information')
      .parse(process.argv);
    
    const options = program.opts();
    
    if (options.help) {
      console.log(`
Book Embeddings Generator Script

This script processes book chapters from the content directory,
generates embeddings using OpenAI, and stores them in MongoDB.

Usage:
  node scripts/generate_book_embeddings_direct.js [--chapter=<slug>]

Options:
  --chapter=<slug>  Process only the specified chapter
  --dry-run         Run without storing embeddings (for testing)
  --help            Show this help message
      `);
      return;
    }
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please add your OpenAI API key to .env.local file:');
      console.log('OPENAI_API_KEY=your_api_key_here');
      return;
    }
    
    console.log('Initializing embedding generation process...');
    
    // Get content directory
    const contentDirectory = path.join(process.cwd(), 'content');
    const bookDirectory = path.join(contentDirectory, 'book');
    
    // Get list of book chapters
    const files = fs.readdirSync(bookDirectory);
    const chapterFiles = files.filter(file => 
      file.endsWith('.md') && 
      file.includes('chapter') && 
      (options.chapter ? file.includes(options.chapter) : true)
    );
    
    console.log(`Found ${chapterFiles.length} chapter files to process`);
    
    let totalChunks = 0;
    let allChunksWithEmbeddings = [];
    
    // Process each chapter
    for (const file of chapterFiles) {
      const filePath = path.join(bookDirectory, file);
      console.log(`Processing ${file}...`);
      
      const chunksWithEmbeddings = await processChapterForEmbeddings(filePath);
      
      console.log(`Generated ${chunksWithEmbeddings.length} chunks with embeddings for ${file}`);
      totalChunks += chunksWithEmbeddings.length;
      allChunksWithEmbeddings = [...allChunksWithEmbeddings, ...chunksWithEmbeddings];
    }
    
    console.log(`Completed embedding generation. Total chunks: ${totalChunks}`);
    
    // Store embeddings in MongoDB (unless dry run)
    if (!options.dryRun) {
      console.log('Storing embeddings in MongoDB...');
      const result = await storeEmbeddings(allChunksWithEmbeddings);
      console.log('Storage result:', result);
    } else {
      console.log('Dry run - embeddings not stored in MongoDB');
    }
    
    console.log('Embedding generation process completed');
    return { success: true, totalChunks };
  } catch (error) {
    console.error('Error in embedding generation:', error);
    return { success: false, error: error.message };
  }
}

// Run the script
main().then(result => {
  console.log('Final result:', result);
  process.exit(result.success ? 0 : 1);
});
