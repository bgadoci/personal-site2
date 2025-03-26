import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/markdown';
import TagLink from '@/components/TagLink';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon } from "@heroicons/react/24/outline";

type PageProps = {
  params: { tag: string }
}

export async function generateMetadata(props: PageProps) {
  // In Next.js 15, dynamic parameters must be awaited before accessing their properties
  const resolvedParams = await props.params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);
  // Only include published posts for tags
  const allTags = getAllTags(false).map(tag => tag.name.toLowerCase());
  
  if (!allTags.includes(decodedTag.toLowerCase())) {
    return {
      title: 'Tag Not Found',
    };
  }
  
  return {
    title: `${decodedTag} - Tags`,
    description: `Content tagged with ${decodedTag}`,
  };
}

export default async function TagPage(props: PageProps) {
  // In Next.js 15, dynamic parameters must be awaited before accessing their properties
  const resolvedParams = await props.params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);
  // Only include published posts for tags
  const allTags = getAllTags(false).map(tag => tag.name.toLowerCase());
  
  if (!allTags.includes(decodedTag.toLowerCase())) {
    notFound();
  }
  
  // Find the actual tag with correct casing
  const tagInfo = getAllTags(false).find(
    tag => tag.name.toLowerCase() === decodedTag.toLowerCase()
  );
  
  // Only get published posts with this tag
  const posts = getPostsByTag(tagInfo?.name || decodedTag, false);
  
  // Group posts by category
  const postsByCategory = posts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);
  
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link 
            href="/tags"
            className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Tags
          </Link>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{tagInfo?.name || decodedTag}</h1>
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged with "{tagInfo?.name || decodedTag}"
        </p>
      </div>

      {Object.entries(postsByCategory).map(([category, categoryPosts]) => (
        <div key={category} className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-2">
            <div className="flex items-center gap-2 mb-1">
              {category === 'blog' && <DocumentTextIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
              {category === 'research' && <BeakerIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
              {category === 'book' && <BookOpenIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 capitalize">{category}</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{categoryPosts.length} {categoryPosts.length === 1 ? 'result' : 'results'}</p>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {categoryPosts.map((post) => (
              <div key={post.slug} className="py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
                      {post.category === 'blog' && <DocumentTextIcon className="h-4 w-4" />}
                      {post.category === 'research' && <BeakerIcon className="h-4 w-4" />}
                      {post.category === 'book' && <BookOpenIcon className="h-4 w-4" />}
                      <span>{post.category}</span>
                    </div>
                    <Link 
                      href={`/${post.category}/${post.slug}`}
                      className="text-lg font-medium text-slate-900 dark:text-slate-50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                    >
                      {post.title}
                    </Link>
                    
                    {/* Display excerpt if available */}
                    {post.excerpt && (
                      <div className="mt-1">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {post.tags.map((tag) => (
                        <div key={tag} className="flex items-center gap-1">
                          <TagIcon className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                          <TagLink
                            tag={tag}
                            isActive={tag.toLowerCase() === decodedTag.toLowerCase()}
                            className={`text-xs ${
                              tag.toLowerCase() === decodedTag.toLowerCase() 
                                ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {post.status === 'draft' && (
                      <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded mt-2">
                        Draft
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {posts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No posts found with this tag.</p>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Other Tags</h2>
        <div className="flex flex-wrap gap-2">
          {getAllTags()
            .filter(tag => tag.name.toLowerCase() !== decodedTag.toLowerCase())
            .slice(0, 10)
            .map(tag => (
              <span key={tag.name} className="inline-block">
                <TagLink 
                  tag={tag.name}
                  isActive={false}
                  className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                />
                <span className="ml-1 text-slate-500 dark:text-slate-400">({tag.count})</span>
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
