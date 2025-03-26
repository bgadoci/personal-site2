import { getAllTags } from '@/lib/markdown';
import { TagIcon } from "@heroicons/react/24/outline";
import FilterableTags from '@/components/FilterableTags';

export const metadata = {
  title: 'Tags - Markdown + MongoDB Content Platform',
  description: 'Browse content by tags',
};

export default function TagsPage() {
  // Only show tags from published content
  const tags = getAllTags(false);

  return (
    <div className="space-y-8">
      <div className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <TagIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Tags</h1>
        </div>
      </div>

      <FilterableTags tags={tags} />
    </div>
  );
}
