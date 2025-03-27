'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import SearchResultItem from './SearchResultItem';
import { usePageVisibility } from '@/hooks/usePageVisibility';

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  tags: string[];
  date: string;
  status?: string;
};

interface SearchResultsListProps {
  posts: Post[];
  query: string;
  total: number;
}

export default function SearchResultsList({ posts, query, total }: SearchResultsListProps) {
  const [displayPosts, setDisplayPosts] = useState<Post[]>(posts);
  const { forceUpdate } = usePageVisibility();
  
  // Force re-render when page becomes visible again (helps with iOS Safari back navigation)
  useEffect(() => {
    if (forceUpdate > 0) {
      // Force a re-render by creating a new array reference
      setDisplayPosts([...posts]);
    }
  }, [forceUpdate, posts]);
  
  // Initialize displayPosts when posts change
  useEffect(() => {
    setDisplayPosts(posts);
  }, [posts]);
  
  // Group posts by category
  const postsByCategory = displayPosts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);
  
  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No results found for "{query}".</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <p className="text-slate-700 dark:text-slate-300">
        Found {total} {total === 1 ? 'result' : 'results'} for "{query}"
      </p>
      
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
              <SearchResultItem key={post.slug} post={post} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
