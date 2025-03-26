import { getAllPosts, getAllTags } from '../lib/markdown';
import { syncPostsToMongoDB, syncTagsToMongoDB } from '../lib/db';

async function syncContent() {
  console.log('Starting content sync to MongoDB...');
  
  // Get all posts and tags from markdown files
  const allPosts = getAllPosts();
  const allTags = getAllTags();
  
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
}

// Run the sync function
syncContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Sync failed with error:', error);
    process.exit(1);
  });
