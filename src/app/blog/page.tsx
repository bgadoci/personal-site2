import Link from 'next/link';
import { getPostsByCategory } from '@/lib/markdown';
import { DocumentTextIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Metadata } from 'next';

export const metadata = {
  title: 'Blog - Brandon Gadoci',
  description: 'Thoughts, experiences, and insights about AI, technology, and my professional journey.',
};

// Define the number of posts per page
const POSTS_PER_PAGE = 12;

type BlogPageProps = {
  searchParams: { page?: string }
};

export default async function BlogPage(props: BlogPageProps) {
  // Only show published posts
  const allPosts = getPostsByCategory('blog', false) || [];
  
  // In Next.js App Router, dynamic parameters must be awaited before accessing their properties
  const resolvedParams = await props.searchParams;
  const page = resolvedParams?.page || '1';
  const currentPage = parseInt(page);
  
  // Calculate total number of pages
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  
  // Get the posts for the current page
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      <div className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Blog</h1>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="block bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all"
            >
              {post.coverImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={post.coverImage.startsWith('/') ? post.coverImage : `/images/blog-images/cover-images/${post.coverImage}`} 
                    alt={`Cover image for ${post.title}`}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {post.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {post.excerpt && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </div>
              
              {post.status === 'draft' && (
                <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded mt-2 mb-2">
                  Draft
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                  >
                    <TagIcon className="h-3 w-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500">No blog posts found.</p>
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
            href={`/blog?page=${currentPage > 1 ? currentPage - 1 : 1}`}
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
                      href={`/blog?page=${page}`}
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
            href={`/blog?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}
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
