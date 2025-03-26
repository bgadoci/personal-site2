import clientPromise from './mongodb';
import { PostMetadata } from './markdown';

export async function syncPostsToMongoDB(posts: PostMetadata[]) {
  try {
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('posts');
    
    // Create a unique index on slug to avoid duplicates
    await collection.createIndex({ slug: 1 }, { unique: true });
    
    // For each post, upsert it to the database
    const operations = posts.map(post => ({
      updateOne: {
        filter: { slug: post.slug },
        update: { 
          $set: {
            ...post,
            // Ensure status is explicitly set
            status: post.status || 'published'
          }
        },
        upsert: true
      }
    }));
    
    if (operations.length > 0) {
      const result = await collection.bulkWrite(operations);
      console.log(`Synced ${result.upsertedCount} new posts, modified ${result.modifiedCount} existing posts`);
      
      // Log draft vs published counts
      const draftCount = posts.filter(post => post.status === 'draft').length;
      const publishedCount = posts.filter(post => post.status === 'published' || !post.status).length;
      console.log(`Synced ${publishedCount} published posts and ${draftCount} draft posts`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing posts to MongoDB:', error);
    return { success: false, error };
  }
}

export async function getPostsFromDB(
  options: {
    category?: string;
    tag?: string;
    search?: string;
    limit?: number;
    skip?: number;
    includeUnpublished?: boolean;
  } = {}
) {
  try {
    const { category, tag, search, limit = 10, skip = 0, includeUnpublished = false } = options;
    
    console.log('DB Query Options:', { category, tag, search, limit, skip, includeUnpublished });
    
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('posts');
    
    // Debug: Check if we can connect to the database and if the collection exists
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Debug: Count total documents in the posts collection
    const totalDocs = await collection.countDocuments({});
    console.log('Total documents in posts collection:', totalDocs);
    
    // Build the query based on provided options
    const query: any = {};
    
    // Only include published posts unless includeUnpublished is true
    if (!includeUnpublished) {
      query.status = 'published';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$or = [
        // Search in frontmatter fields
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { date: { $regex: search, $options: 'i' } },
        // Search in content
        { searchableContent: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    
    // Execute the query
    const posts = await collection
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(query);
    
    return { posts, total };
  } catch (error) {
    console.error('Error getting posts from MongoDB:', error);
    return { posts: [], total: 0 };
  }
}

export async function getPostBySlugFromDB(slug: string, includeUnpublished: boolean = false) {
  try {
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('posts');
    
    // Build query to find the post by slug and respect published status
    const query: any = { slug };
    if (!includeUnpublished) {
      query.status = 'published';
    }
    
    const post = await collection.findOne(query);
    return post;
  } catch (error) {
    console.error('Error getting post by slug from MongoDB:', error);
    return null;
  }
}

export async function syncTagsToMongoDB(tags: { name: string; count: number }[]) {
  try {
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('tags');
    
    // Create a unique index on name to avoid duplicates
    await collection.createIndex({ name: 1 }, { unique: true });
    
    // For each tag, upsert it to the database
    const operations = tags.map(tag => ({
      updateOne: {
        filter: { name: tag.name },
        update: { 
          $set: { 
            name: tag.name,
            slug: tag.name.toLowerCase().replace(/\s+/g, '-'),
            count: tag.count
          }
        },
        upsert: true
      }
    }));
    
    if (operations.length > 0) {
      const result = await collection.bulkWrite(operations);
      console.log(`Synced ${result.upsertedCount} new tags, modified ${result.modifiedCount} existing tags`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing tags to MongoDB:', error);
    return { success: false, error };
  }
}

export async function getTagsFromDB(includeUnpublished: boolean = false) {
  try {
    const client = await clientPromise;
    const db = client.db('content-platform');
    const collection = db.collection('tags');
    
    // If we're not including unpublished content, we need to get tags only from published posts
    if (!includeUnpublished) {
      // This is a simplified approach - in a real app, you might want to maintain separate tag counts
      // for published vs. draft content, or calculate them dynamically
      const postsCollection = db.collection('posts');
      const publishedPosts = await postsCollection.find({ status: 'published' }).toArray();
      
      // Extract tags from published posts
      const tagCounts: Record<string, number> = {};
      publishedPosts.forEach(post => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array format
      return Object.entries(tagCounts).map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        count,
      }));
    }
    
    // If including unpublished, return all tags
    const tags = await collection
      .find({})
      .sort({ count: -1 })
      .toArray();
    
    return tags;
  } catch (error) {
    console.error('Error getting tags from MongoDB:', error);
    return [];
  }
}
