'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TagIcon } from "@heroicons/react/24/outline";
import TagSearch from './TagSearch';

interface Tag {
  name: string;
  count: number;
}

interface FilterableTagsProps {
  tags: Tag[];
}

export default function FilterableTags({ tags }: FilterableTagsProps) {
  const [filteredTags, setFilteredTags] = useState<Tag[]>(tags);
  
  // Handle search
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredTags(tags);
      return;
    }
    
    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTags(filtered);
  };

  return (
    <div>
      <TagSearch onSearch={handleSearch} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag) => (
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
            <p className="text-slate-500 dark:text-slate-400">No tags found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
