import Link from 'next/link';
import { getAllTags } from '@/lib/markdown';
import { TagIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: 'Tags - Markdown + MongoDB Content Platform',
  description: 'Browse content by tags',
};

export default function TagsPage() {
  // Only show tags from published content
  const tags = getAllTags(false);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <TagIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Tags</h1>
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          Browse content by tags to discover related topics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Link 
              key={tag.name}
              href={`/tags/${tag.name.toLowerCase()}`}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <TagIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {tag.name}
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {tag.count} {tag.count === 1 ? 'post' : 'posts'}
              </p>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 col-span-full">
            <p className="text-slate-500 dark:text-slate-400">No tags found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
