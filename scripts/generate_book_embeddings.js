/**
 * Book Embeddings Generator Script
 * 
 * This script processes book chapters from the content directory,
 * generates embeddings using OpenAI, and stores them in MongoDB.
 * 
 * Usage:
 *   node scripts/generate_book_embeddings.js [--chapter=<slug>]
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

// Import required modules using dynamic import for ESM compatibility
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
  node scripts/generate_book_embeddings.js [--chapter=<slug>]

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
    
    // Import required modules using Next.js eval approach
    const { execSync } = require('child_process');
    
    console.log('Initializing embedding generation process...');
    
    // Use Next.js eval to access TypeScript modules
    const result = execSync(`npx next eval "
      import { OpenAIEmbeddings } from './src/lib/openai';
      import { processChapterForEmbeddings, storeEmbeddings } from './src/lib/embeddings';
      import fs from 'fs';
      import path from 'path';

      async function generateEmbeddings() {
        try {
          const contentDirectory = path.join(process.cwd(), 'content');
          const bookDirectory = path.join(contentDirectory, 'book');
          const openAIEmbeddings = new OpenAIEmbeddings();
          
          // Get list of book chapters
          const files = fs.readdirSync(bookDirectory);
          const chapterFiles = files.filter(file => 
            file.endsWith('.md') && 
            file.includes('chapter') && 
            ${options.chapter ? `file.includes('${options.chapter}')` : 'true'}
          );
          
          console.log(\`Found \${chapterFiles.length} chapter files to process\`);
          
          let totalChunks = 0;
          let allChunksWithEmbeddings = [];
          
          // Process each chapter
          for (const file of chapterFiles) {
            const filePath = path.join(bookDirectory, file);
            console.log(\`Processing \${file}...\`);
            
            const chunksWithEmbeddings = await processChapterForEmbeddings(
              filePath,
              openAIEmbeddings
            );
            
            console.log(\`Generated \${chunksWithEmbeddings.length} chunks with embeddings for \${file}\`);
            totalChunks += chunksWithEmbeddings.length;
            allChunksWithEmbeddings = [...allChunksWithEmbeddings, ...chunksWithEmbeddings];
          }
          
          console.log(\`Completed embedding generation. Total chunks: \${totalChunks}\`);
          
          // Store embeddings in MongoDB (unless dry run)
          if (${options.dryRun ? 'false' : 'true'}) {
            console.log('Storing embeddings in MongoDB...');
            const result = await storeEmbeddings(allChunksWithEmbeddings);
            console.log('Storage result:', result);
          } else {
            console.log('Dry run - embeddings not stored in MongoDB');
          }
          
          return { success: true, totalChunks };
        } catch (error) {
          console.error('Error in embedding generation:', error);
          return { success: false, error: error.message };
        }
      }
      
      // Run the embedding generation
      generateEmbeddings().then(result => {
        console.log('Final result:', result);
        process.exit(result.success ? 0 : 1);
      });
    "`, { stdio: 'inherit' });
    
    console.log('Embedding generation process completed');
    
  } catch (error) {
    console.error('Error running embedding generation script:', error);
    process.exit(1);
  }
}

main();
