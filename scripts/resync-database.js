const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Path to content directory
const contentDirectory = path.join(process.cwd(), 'content');

// Function to get all posts from the filesystem
function getAllPosts() {
  const categories = fs.readdirSync(contentDirectory);
  const allPosts = [];
  
  for (const category of categories) {
    const categoryPath = path.join(contentDirectory, category);
    
    // Skip if not a directory
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    const filenames = fs.readdirSync(categoryPath);
    
    for (const filename of filenames) {
      // Skip non-markdown files
      if (!filename.endsWith('.md')) continue;
      
      const filePath = path.join(categoryPath, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Create a searchable version of the content (plain text)
      const searchableContent = content
        .replace(/\r\n/g, '\n')
        .replace(/#{1,6}\s+(.*?)\n/g, '$1 ')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~([^~]+)~/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/<[^>]*>/g, ' ')
        .replace(/^>\s*(.*?)$/gm, '$1')
        .replace(/^\s*[\*\-+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      allPosts.push({
        title: data.title,
        slug: data.slug,
        category: data.category,
        tags: data.tags || [],
        date: data.date,
        path: `/${category}/${filename}`,
        status: data.status || 'published',
        coverImage: data.coverImage || '',
        description: data.description || '',
        summary: data.summary || '',
        excerpt: data.excerpt || '',
        searchableContent
      });
    }
  }
  
  return allPosts;
}

// Function to extract all unique tags from posts
function getAllTags(posts) {
  const tagCounts = {};
  
  posts.forEach(post => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count
  }));
}

// Function to sync posts to MongoDB
async function syncPostsToMongoDB(posts) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('content-platform');
    const collection = db.collection('posts');
    
    // First, clean the collection to remove any outdated entries
    console.log('Cleaning posts collection...');
    await collection.deleteMany({});
    
    // Create a unique index on slug to avoid duplicates
    await collection.createIndex({ slug: 1 }, { unique: true });
    
    // Insert all posts
    console.log(`Inserting ${posts.length} posts...`);
    const result = await collection.insertMany(posts);
    console.log(`Inserted ${result.insertedCount} posts`);
    
    // Count draft vs published posts
    const draftCount = posts.filter(post => post.status === 'draft').length;
    const publishedCount = posts.filter(post => post.status === 'published' || !post.status).length;
    console.log(`Synced ${publishedCount} published posts and ${draftCount} draft posts`);
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing posts to MongoDB:', error);
    return { success: false, error };
  } finally {
    await client.close();
  }
}

// Function to sync tags to MongoDB
async function syncTagsToMongoDB(tags) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    const db = client.db('content-platform');
    const collection = db.collection('tags');
    
    // First, clean the collection to remove any outdated entries
    console.log('Cleaning tags collection...');
    await collection.deleteMany({});
    
    // Create a unique index on name to avoid duplicates
    await collection.createIndex({ name: 1 }, { unique: true });
    
    // Insert all tags
    console.log(`Inserting ${tags.length} tags...`);
    const result = await collection.insertMany(tags);
    console.log(`Inserted ${result.insertedCount} tags`);
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing tags to MongoDB:', error);
    return { success: false, error };
  } finally {
    await client.close();
  }
}

// Main function to run the sync
async function main() {
  console.log('Starting database resync...');
  
  // Get all posts from the filesystem
  const posts = getAllPosts();
  console.log(`Found ${posts.length} posts in the filesystem`);
  
  // Extract all tags from posts
  const tags = getAllTags(posts);
  console.log(`Found ${tags.length} unique tags`);
  
  // Sync posts to MongoDB
  console.log('\nSyncing posts to MongoDB...');
  const postsResult = await syncPostsToMongoDB(posts);
  
  // Sync tags to MongoDB
  console.log('\nSyncing tags to MongoDB...');
  const tagsResult = await syncTagsToMongoDB(tags);
  
  console.log('\nDatabase resync complete!');
  console.log(`Posts sync: ${postsResult.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Tags sync: ${tagsResult.success ? 'SUCCESS' : 'FAILED'}`);
}

main().catch(console.error);
