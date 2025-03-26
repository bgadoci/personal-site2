import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';

const contentDirectory = path.join(process.cwd(), 'content');

export type PostMetadata = {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  date: string;
  path: string;
  status: 'draft' | 'published';
  coverImage?: string; // Optional path to cover image
  excerpt?: string; // Short excerpt for previews and search
  searchableContent?: string; // Plain text content for search indexing
  fullContent?: string; // Full raw content of the markdown file
};

export type Post = PostMetadata & {
  content: string;
};

export async function getPostBySlug(slug: string, category: string, includeUnpublished: boolean = false): Promise<Post | null> {
  try {
    const categoryPath = path.join(contentDirectory, category);
    const filenames = fs.readdirSync(categoryPath);
    
    for (const filename of filenames) {
      const filePath = path.join(categoryPath, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      if (data.slug === slug) {
        let post: Post;
        
        try {
          // Process markdown content to HTML with enhanced formatting
          // First, ensure proper line breaks and spacing
          const contentWithBreaks = content
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Replace multiple blank lines with just two
            .replace(/^(#+)\s*(.*?)\s*$/gm, '$1 $2'); // Ensure space after heading markers

          // Use the full remark/rehype pipeline for better markdown processing
          const processedContent = await remark()
            .use(remarkGfm) // GitHub Flavored Markdown: tables, strikethrough, tasklists, etc.
            .use(remarkRehype, { allowDangerousHtml: true }) // Convert markdown to rehype AST
            .use(rehypeHighlight) // Add syntax highlighting
            .use(rehypeStringify, { allowDangerousHtml: true }) // Convert rehype AST to HTML
            .process(contentWithBreaks);
            
          // Get the HTML string
          let contentHtml = processedContent.toString();
          
          // Apply custom styling to HTML elements
          contentHtml = contentHtml
            // Headings
            .replace(/<h1([^>]*)>/g, '<h1$1 class="text-3xl font-bold mt-8 mb-4">')
            .replace(/<h2([^>]*)>/g, '<h2$1 class="text-2xl font-semibold mt-6 mb-3">')
            .replace(/<h3([^>]*)>/g, '<h3$1 class="text-xl font-semibold mt-5 mb-2">')
            .replace(/<h4([^>]*)>/g, '<h4$1 class="text-lg font-semibold mt-4 mb-2">')
            .replace(/<h5([^>]*)>/g, '<h5$1 class="text-base font-semibold mt-4 mb-2">')
            .replace(/<h6([^>]*)>/g, '<h6$1 class="text-sm font-semibold mt-4 mb-2">')
            
            // Paragraphs
            .replace(/<p>/g, '<p class="mb-4">')
            
            // Lists
            .replace(/<ul>/g, '<ul class="list-disc pl-5 space-y-2 mb-4">')
            .replace(/<ol>/g, '<ol class="list-decimal pl-5 space-y-2 mb-4">')
            .replace(/<li>/g, '<li class="ml-2">')
            
            // Blockquotes
            .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 my-4 text-slate-700 dark:text-slate-300 italic">')
            
            // Code blocks
            .replace(/<pre>/g, '<pre class="rounded-md p-4 my-4 overflow-auto bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">')
            
            // Inline code
            .replace(/<code([^>]*)>/g, '<code$1 class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400 text-sm font-mono">')
            
            // Links
            .replace(/<a /g, '<a class="text-emerald-600 dark:text-emerald-400 hover:underline" ')
            
            // Tables
            .replace(/<table>/g, '<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 my-4">')
            .replace(/<thead>/g, '<thead class="bg-slate-50 dark:bg-slate-800">')
            .replace(/<th>/g, '<th class="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">')
            .replace(/<tbody>/g, '<tbody class="divide-y divide-slate-200 dark:divide-slate-700">')
            .replace(/<td>/g, '<td class="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">')
            
            // Horizontal rule
            .replace(/<hr>/g, '<hr class="my-8 border-t border-slate-200 dark:border-slate-700">');
          
          // Create the post object with the processed HTML content
          post = {
            title: data.title,
            slug: data.slug,
            category: data.category,
            tags: data.tags || [],
            date: data.date,
            path: filePath,
            status: data.status || 'published',
            coverImage: data.coverImage,
            content: contentHtml
          };
          
        } catch (error: any) { // Type assertion for error
          console.error('Error processing markdown:', error);
          
          // Create a post object with error message as content
          post = {
            title: data.title,
            slug: data.slug,
            category: data.category,
            tags: data.tags || [],
            date: data.date,
            path: filePath,
            status: data.status || 'published',
            coverImage: data.coverImage,
            content: `<p>Error processing markdown content: ${error.message}</p>`
          };
        }
        
        // Only return the post if it's published or if includeUnpublished is true
        if (includeUnpublished || post.status === 'published') {
          return post;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting post by slug:', error);
    return null;
  }
}

export function getAllPosts(includeUnpublished: boolean = false): PostMetadata[] {
  const categories = fs.readdirSync(contentDirectory);
  const allPosts: PostMetadata[] = [];
  
  for (const category of categories) {
    const categoryPath = path.join(contentDirectory, category);
    
    // Skip if not a directory
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    const filenames = fs.readdirSync(categoryPath);
    
    for (const filename of filenames) {
      const filePath = path.join(categoryPath, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Create a searchable version of the content (plain text)
      // Enhanced to handle more markdown elements
      const searchableContent = content
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        // Replace headings with their text
        .replace(/#{1,6}\s+(.*?)\n/g, '$1 ')
        // Replace bold and italic formatting
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~([^~]+)~/g, '$1')
        // Replace links with their text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Replace code blocks and inline code
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        // Replace HTML tags
        .replace(/<[^>]*>/g, ' ')
        // Replace blockquotes
        .replace(/^>\s*(.*?)$/gm, '$1')
        // Replace list markers
        .replace(/^\s*[\*\-+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        // Replace multiple spaces with a single space
        .replace(/\s+/g, ' ')
        .trim();
      
      // Create a combined searchable string from frontmatter data
      const frontmatterSearchable = [
        data.title || '',
        data.slug || '',
        data.category || '',
        (data.tags || []).join(' '),
        data.date || '',
        data.description || ''
      ].join(' ').toLowerCase();
      
      // Combine frontmatter and content for comprehensive search
      const fullSearchableContent = `${frontmatterSearchable} ${searchableContent}`;
      
      // Create a short excerpt (first 200 characters of content)
      const excerpt = searchableContent.length > 200 
        ? searchableContent.substring(0, 200) + '...' 
        : searchableContent;
      
      const post = {
        title: data.title,
        slug: data.slug,
        category: data.category,
        tags: data.tags || [],
        date: data.date,
        path: `/${category}/${filename}`,
        status: data.status || 'published', // Default to published if not specified
        coverImage: data.coverImage || '', // Include coverImage if available
        excerpt,
        searchableContent: fullSearchableContent // Use the enhanced searchable content that includes frontmatter
      };
      
      // Only include published posts unless includeUnpublished is true
      if (includeUnpublished || post.status === 'published') {
        allPosts.push(post);
      }
    }
  }
  
  // Sort posts by date in descending order
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByCategory(category: string, includeUnpublished: boolean = false): PostMetadata[] {
  try {
    const categoryPath = path.join(contentDirectory, category);
    const filenames = fs.readdirSync(categoryPath);
    const posts: PostMetadata[] = [];
    
    for (const filename of filenames) {
      const filePath = path.join(categoryPath, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      const post = {
        title: data.title,
        slug: data.slug,
        category: data.category,
        tags: data.tags || [],
        date: data.date,
        path: `/${category}/${filename}`,
        status: data.status || 'published', // Default to published if not specified
        coverImage: data.coverImage || '', // Include coverImage if available
      };
      
      // Only include published posts unless includeUnpublished is true
      if (includeUnpublished || post.status === 'published') {
        posts.push(post);
      }
    }
    
    // Sort posts by date in descending order
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Error getting posts for category ${category}:`, error);
    return [];
  }
}

export function getPostsByTag(tag: string, includeUnpublished: boolean = false): PostMetadata[] {
  const allPosts = getAllPosts(includeUnpublished);
  return allPosts.filter(post => post.tags.includes(tag));
}

export function getAllTags(includeUnpublished: boolean = false): { name: string; count: number }[] {
  const allPosts = getAllPosts(includeUnpublished);
  const tagCounts: Record<string, number> = {};
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });
  
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count,
  }));
}


