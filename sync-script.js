// Simple script to sync content to MongoDB
const { getAllPosts, getAllTags } = require('./src/lib/markdown');
const { syncPostsToMongoDB, syncTagsToMongoDB } = require('./src/lib/db');

async function syncContent() {
  try {
    console.log('Starting content sync...');
    
    // Get all posts and tags
    const allPosts = getAllPosts(true);
    const allTags = getAllTags(true);
    
    console.log(`Found ${allPosts.length} posts and ${allTags.length} unique tags`);
    
    // Sync posts to MongoDB
    const postsResult = await syncPostsToMongoDB(allPosts);
    if (postsResult.success) {
      console.log('Posts synced successfully');
    } else {
      console.error('Error syncing posts:', postsResult.error);
    }
    
    // Sync tags to MongoDB
    const tagsResult = await syncTagsToMongoDB(allTags);
    if (tagsResult.success) {
      console.log('Tags synced successfully');
    } else {
      console.error('Error syncing tags:', tagsResult.error);
    }
    
    console.log('Content sync completed');
  } catch (error) {
    console.error('Sync failed with error:', error);
  }
}

// Run the sync
syncContent();
