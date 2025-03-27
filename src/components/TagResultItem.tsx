'use client';

import { TagIcon, DocumentTextIcon, BeakerIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import SafariSafeLink from './SafariSafeLink';
import TagLink from './TagLink';

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  tags: string[];
  date: string;
  status?: string;
};

interface TagResultItemProps {
  post: Post;
  currentTag: string;
}

export default function TagResultItem({ post, currentTag }: TagResultItemProps) {
  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
            {post.category === 'blog' && <DocumentTextIcon className="h-4 w-4" />}
            {post.category === 'research' && <BeakerIcon className="h-4 w-4" />}
            {post.category === 'book' && <BookOpenIcon className="h-4 w-4" />}
            <span>{post.category}</span>
          </div>
          <SafariSafeLink 
            href={`/${post.category}/${post.slug}`}
            className="text-lg font-medium text-slate-900 dark:text-slate-50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
          >
            {post.title}
          </SafariSafeLink>
          
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
                  isActive={tag.toLowerCase() === currentTag.toLowerCase()}
                  className={`text-xs ${
                    tag.toLowerCase() === currentTag.toLowerCase() 
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
  );
}
