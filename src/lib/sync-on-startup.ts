import { getAllPosts, getAllTags } from './markdown';
import { syncPostsToMongoDB, syncTagsToMongoDB } from './db';

// This function will be called on application startup
export async function syncContentOnStartup() {
  try {
    console.log('Starting content sync on application startup...');
    
    // Get all posts and tags from markdown files
    const allPosts = getAllPosts(true);
    const allTags = getAllTags(true);
    
    console.log(`Found ${allPosts.length} posts and ${allTags.length} unique tags`);
    
    // Sync posts to MongoDB
    const postsResult = await syncPostsToMongoDB(allPosts);
    if (postsResult.success) {
      console.log('Posts synced successfully on startup');
    } else {
      console.error('Error syncing posts on startup:', postsResult.error);
    }
    
    // Sync tags to MongoDB
    const tagsResult = await syncTagsToMongoDB(allTags);
    if (tagsResult.success) {
      console.log('Tags synced successfully on startup');
    } else {
      console.error('Error syncing tags on startup:', tagsResult.error);
    }
    
    console.log('Content sync on startup completed');
    return { success: true };
  } catch (error) {
    console.error('Sync on startup failed with error:', error);
    return { success: false, error };
  }
}
