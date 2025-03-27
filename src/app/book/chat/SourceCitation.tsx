"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// Define the Source type
type Source = {
  text: string;
  citation: string;
  link: string;
};

type SourceCitationProps = {
  source: Source;
};

export default function SourceCitation({ source }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="text-xs border border-slate-200 dark:border-slate-600 rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-2 py-1.5">
        <Link 
          href={source.link} 
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          {source.citation}
        </Link>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-0.5 rounded"
          aria-label={expanded ? "Collapse source" : "Expand source"}
        >
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-600">
          {source.text}
        </div>
      )}
    </div>
  );
}
