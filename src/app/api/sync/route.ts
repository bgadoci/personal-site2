import { NextResponse } from 'next/server';
import { getAllPosts, getAllTags } from '@/lib/markdown';
import { syncPostsToMongoDB, syncTagsToMongoDB } from '@/lib/db';

export async function GET() {
  try {
    console.log('Starting content sync to MongoDB...');
    
    // Get all posts and tags from markdown files
    const allPosts = getAllPosts(true);
    const allTags = getAllTags(true);
    
    console.log(`Found ${allPosts.length} posts and ${allTags.length} unique tags`);
    
    // Sync posts to MongoDB
    const postsResult = await syncPostsToMongoDB(allPosts);
    if (postsResult.success) {
      console.log('Posts synced successfully');
    } else {
      console.error('Error syncing posts:', postsResult.error);
      return NextResponse.json({ error: 'Failed to sync posts' }, { status: 500 });
    }
    
    // Sync tags to MongoDB
    const tagsResult = await syncTagsToMongoDB(allTags);
    if (tagsResult.success) {
      console.log('Tags synced successfully');
    } else {
      console.error('Error syncing tags:', tagsResult.error);
      return NextResponse.json({ error: 'Failed to sync tags' }, { status: 500 });
    }
    
    console.log('Content sync completed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Content synced successfully',
      stats: {
        posts: allPosts.length,
        tags: allTags.length
      }
    });
  } catch (error) {
    console.error('Sync failed with error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
