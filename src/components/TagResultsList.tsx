'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon } from "@heroicons/react/24/outline";
import TagResultItem from './TagResultItem';
import SafariSafeLink from './SafariSafeLink';
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

type Tag = {
  name: string;
  count: number;
};

interface TagResultsListProps {
  posts: Post[];
  tagName: string;
  otherTags: Tag[];
}

export default function TagResultsList({ posts, tagName, otherTags }: TagResultsListProps) {
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
        <p className="text-slate-500 dark:text-slate-400">No posts found with this tag.</p>
      </div>
    );
  }
  
  return (
    <>
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
              <TagResultItem key={post.slug} post={post} currentTag={tagName} />
            ))}
          </div>
        </div>
      ))}
      
      {otherTags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Other Tags</h2>
          <div className="flex flex-wrap gap-2">
            {otherTags.map(tag => (
              <span key={tag.name} className="inline-block">
                <SafariSafeLink 
                  href={`/tags/${tag.name.toLowerCase()}`}
                  className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {tag.name}
                </SafariSafeLink>
                <span className="ml-1 text-slate-500 dark:text-slate-400">({tag.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
