import Link from 'next/link';
import { getPostsByCategory } from '@/lib/markdown';
import { BeakerIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Metadata } from 'next';

export const metadata = {
  title: 'Research - Markdown + MongoDB Content Platform',
  description: 'In-depth research papers and analysis on various topics.',
};

// Define the number of posts per page
const POSTS_PER_PAGE = 12;

type ResearchPageProps = {
  searchParams: { page?: string }
};

export default function ResearchPage({ searchParams }: ResearchPageProps) {
  // Only show published posts
  const allPosts = getPostsByCategory('research', false);
  
  // Get the current page from the URL query parameters
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  
  // Get the posts for the current page
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <BeakerIcon className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Research</h1>
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          In-depth exploration and analysis on various topics.
        </p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{allPosts.length} {allPosts.length === 1 ? 'exploration' : 'explorations'} in total</p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.slug} className="py-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex-1">
                  <Link 
                    href={`/research/${post.slug}`}
                    className="text-lg font-medium text-slate-900 dark:text-slate-50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                  >
                    {post.title}
                    {post.status === 'draft' && (
                      <span className="ml-2 inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-0.5 rounded">
                        Draft
                      </span>
                    )}
                  </Link>
                  
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {post.tags.map((tag) => (
                      <Link 
                        key={tag} 
                        href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                        className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <TagIcon className="h-3 w-3" />
                        <span>{tag}</span>
                      </Link>
                    ))}
                  </div>
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
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No research papers found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-8 text-sm">
          <div className="text-slate-500 dark:text-slate-400 mb-2">Page {currentPage} of {totalPages}</div>
          <div className="flex justify-center items-center">
            {/* Previous page link */}
            <Link
              href={`/research?page=${currentPage > 1 ? currentPage - 1 : 1}`}
              className={`flex items-center mx-2 ${currentPage === 1 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'}`}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : 0}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </Link>
            
            {/* Page numbers */}
            <div className="flex items-center">
              {/* Logic to show a limited number of page links with ellipses */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Always show first and last page
                  if (page === 1 || page === totalPages) return true;
                  // Always show current page and one page before and after
                  if (Math.abs(page - currentPage) <= 1) return true;
                  // Show ellipsis indicators (represented by actual page numbers)
                  if (page === 2 && currentPage > 3) return true;
                  if (page === totalPages - 1 && currentPage < totalPages - 2) return true;
                  return false;
                })
                .map((page, index, filteredPages) => {
                  // Determine if we need to show ellipsis
                  const showEllipsisBefore = index > 0 && filteredPages[index] - filteredPages[index - 1] > 1;
                  const showEllipsisAfter = index < filteredPages.length - 1 && filteredPages[index + 1] - filteredPages[index] > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {/* Show ellipsis before if needed */}
                      {showEllipsisBefore && (
                        <span className="mx-1 text-slate-500 dark:text-slate-400">...</span>
                      )}
                      
                      {/* Page number */}
                      <Link
                        href={`/research?page=${page}`}
                        className={`mx-1 px-2 ${currentPage === page 
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                          : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </Link>
                      
                      {/* Show ellipsis after if needed */}
                      {showEllipsisAfter && (
                        <span className="mx-1 text-slate-500 dark:text-slate-400">...</span>
                      )}
                    </div>
                  );
                })}
            </div>
            
            {/* Next page link */}
            <Link
              href={`/research?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}
              className={`flex items-center mx-2 ${currentPage === totalPages 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'}`}
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : 0}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
