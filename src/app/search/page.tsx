import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPostsFromDB } from '@/lib/db';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: 'Search - Markdown + MongoDB Content Platform',
  description: 'Search across all content',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage(props: SearchPageProps) {
  // In Next.js 15, dynamic parameters must be awaited before accessing their properties
  const resolvedParams = await props.searchParams;
  const searchQuery = resolvedParams?.q || '';
  
  // If there's a search query, show results, otherwise show centered search form
  if (searchQuery) {
    return (
      <div className="space-y-8">
        <div className="pb-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">Search Results</h1>
          <p className="text-lg text-emerald-600 dark:text-slate-300 mb-4">
            Results for "{searchQuery}"
          </p>
          
          <form action="/search" method="get" className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search for content..."
                  className="w-full h-10 pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                  aria-label="Search query"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 bg-emerald-500 dark:bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={searchQuery} />
        </Suspense>
      </div>
    );
  }
  
  // For the initial landing page, center the search form vertically and horizontally
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Search</h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
          Search across all content by title, tags, or category.
        </p>
        
        <form action="/search" method="get" className="w-full">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search for content..."
                className="w-full h-12 pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-lg"
                aria-label="Search query"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 bg-emerald-500 dark:bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 text-lg"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  // Only show published posts in search results
  console.log('Searching for:', query);
  const { posts, total } = await getPostsFromDB({ 
    search: query,
    includeUnpublished: false,
    limit: 50 // Increase limit to show more search results
  });
  
  console.log('Search results:', { total, postCount: posts.length });
  
  // Import the client component to render the search results
  // This allows us to use the SafariSafeLink in a client component
  const SearchResultsList = dynamic(() => import('@/components/SearchResultsList'), {
    ssr: true // We want server-side rendering for the initial load
  });
  
  // Serialize the MongoDB objects to plain JavaScript objects
  // This fixes the "Only plain objects can be passed to Client Components from Server Components" error
  const serializedPosts = JSON.parse(JSON.stringify(posts));
  
  return <SearchResultsList posts={serializedPosts} query={query} total={total} />;
}

function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
      
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
