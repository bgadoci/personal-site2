// Simple script to sync content to MongoDB
const { execSync } = require('child_process');

console.log('Starting content sync process...');

try {
  // Run a Next.js script to sync content
  execSync('npx next eval "import { getAllPosts, getAllTags } from \'./src/lib/markdown\'; import { syncPostsToMongoDB, syncTagsToMongoDB } from \'./src/lib/db\'; async function syncContent() { console.log(\'Starting content sync to MongoDB...\'); const allPosts = getAllPosts(true); const allTags = getAllTags(true); console.log(`Found ${allPosts.length} posts and ${allTags.length} unique tags`); const postsResult = await syncPostsToMongoDB(allPosts); if (postsResult.success) { console.log(\'Posts synced successfully\'); } else { console.error(\'Error syncing posts:\', postsResult.error); } const tagsResult = await syncTagsToMongoDB(allTags); if (tagsResult.success) { console.log(\'Tags synced successfully\'); } else { console.error(\'Error syncing tags:\', tagsResult.error); } console.log(\'Content sync completed\'); } syncContent();"', {
    stdio: 'inherit'
  });
  
  console.log('Content sync completed successfully');
} catch (error) {
  console.error('Error syncing content:', error);
  process.exit(1);
}
