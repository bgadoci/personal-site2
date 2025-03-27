import { OpenAIEmbeddings } from './openai';
import { PostMetadata } from './markdown';
import clientPromise from './mongodb';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Types for our embedding system
export type ContentChunk = {
  chapter_slug: string;
  chapter_number: number;
  chapter_title: string;
  section_title?: string;
  section_number?: string;
  position_in_chapter: number;
  content_start_offset?: number;
  content: string;
  token_count: number;
  citation: {
    display_text: string;
    url_path: string;
  };
};

export type ChunkWithEmbedding = ContentChunk & {
  embedding: number[];
  created_at: Date;
  updated_at: Date;
};

// Helper function to extract chapter number from title or filename
export function extractChapterNumber(title: string): number {
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

// Create an anchor ID from a section title
export function createAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Calculate the character offset of a chunk in the full content
export function calculateOffset(fullContent: string, chunkText: string): number {
  return fullContent.indexOf(chunkText);
}

// Parse content into sections based on markdown headers
export function parseContentSections(content: string): { title: string; content: string }[] {
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

// Split text into chunks of appropriate size
export function splitIntoChunks(text: string, maxTokens: number = 500): string[] {
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

// Estimate token count for a text string
export function estimateTokenCount(text: string): number {
  // Simple estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Store embeddings in MongoDB
export async function storeEmbeddings(chunks: ChunkWithEmbedding[]): Promise<{ success: boolean; message: string }> {
  try {
    const client = await clientPromise;
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
        (idx: any) => idx.name === 'vector_index'
      );
      
      if (!hasVectorIndex) {
        await db.command({
          createIndexes: 'book_embeddings',
          indexes: [
            {
              name: 'vector_index',
              key: { embedding: 'vector' },
              vectorOptions: {
                dimensions: 1536, // OpenAI's ada-002 embedding size
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
      return { 
        success: true, 
        message: `Stored ${result.upsertedCount} new chunks, modified ${result.modifiedCount} existing chunks` 
      };
    }
    
    return { success: true, message: 'No chunks to store' };
  } catch (error) {
    console.error('Error storing embeddings:', error);
    return { 
      success: false, 
      message: `Error storing embeddings: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Find similar chunks for a given question embedding
export async function findSimilarChunks(
  questionEmbedding: number[], 
  limit: number = 5
): Promise<ChunkWithEmbedding[]> {
  try {
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('book_embeddings');
    
    // Use vector search if available
    try {
      const results = await collection.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: questionEmbedding,
            numCandidates: 100,
            limit: limit
          }
        },
        {
          $project: {
            _id: 0,
            chapter_slug: 1,
            chapter_number: 1,
            chapter_title: 1,
            section_title: 1,
            section_number: 1,
            position_in_chapter: 1,
            content: 1,
            token_count: 1,
            citation: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]).toArray();
      
      return results as ChunkWithEmbedding[];
    } catch (error) {
      console.warn('Vector search failed, falling back to basic retrieval:', error);
      
      // Fallback to basic retrieval (without similarity search)
      const results = await collection
        .find({})
        .limit(limit)
        .project({
          _id: 0,
          chapter_slug: 1,
          chapter_number: 1,
          chapter_title: 1,
          section_title: 1,
          section_number: 1,
          position_in_chapter: 1,
          content: 1,
          token_count: 1,
          citation: 1
        })
        .toArray();
      
      return results as ChunkWithEmbedding[];
    }
  } catch (error) {
    console.error('Error finding similar chunks:', error);
    return [];
  }
}

// Process a book chapter for embeddings
export async function processChapterForEmbeddings(
  filePath: string,
  openAIEmbeddings: OpenAIEmbeddings
): Promise<ChunkWithEmbedding[]> {
  // Read the file
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Extract chapter metadata
  const title = data.title;
  const slug = data.slug;
  const chapterNumber = extractChapterNumber(title);
  
  // Parse the content to identify sections
  const sections = parseContentSections(content);
  
  let chunksWithEmbeddings: ChunkWithEmbedding[] = [];
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
      const chunk: ContentChunk = {
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
        const embedding = await openAIEmbeddings.embedText(chunkText);
        
        // Add embedding and timestamps
        const chunkWithEmbedding: ChunkWithEmbedding = {
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
