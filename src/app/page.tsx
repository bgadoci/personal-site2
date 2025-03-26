import Link from 'next/link';
import { getAllPosts, getPostsByCategory, getAllTags } from '@/lib/markdown';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon, MagnifyingGlassIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import HomeSearchForm from '@/components/HomeSearchForm';

export default function Home() {
  // Get all posts
  const allPosts = getAllPosts();
  
  // Get only blog posts
  const blogPosts = allPosts.filter(post => post.category === 'blog');
  
  // Get the latest 3 blog posts
  const latestBlogPosts = blogPosts.slice(0, 3);
  
  // Get research articles
  const researchPosts = getPostsByCategory('research', false);
  const latestResearchPosts = researchPosts.slice(0, 5);
  
  // Get top 5 tags by post count
  const allTags = getAllTags(false);
  const topTags = allTags.sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/website-images/avatar.png" 
              alt="Brandon Gadoci" 
              className="h-32 w-32 rounded-full border-4 border-emerald-500 dark:border-emerald-400 shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-1">Brandon Gadoci</h1>
          <h2 className="text-2xl font-medium text-emerald-600 dark:text-emerald-400 mb-4">VP of AI Operations at data.world</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
            First employee at data.world 9 years ago. Writing about AI, AI Operations, and sharing my research and life experiences.
          </p>
          
          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-8">
            <HomeSearchForm />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/book" 
              className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Read My Book
            </Link>
            <Link 
              href="/blog" 
              className="bg-white dark:bg-slate-800 border border-emerald-500 dark:border-emerald-600 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Read My Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Latest blog posts section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Latest Blog Posts</h2>
          <Link 
            href="/blog"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm"
          >
            View all posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestBlogPosts.map((post) => (
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
          ))}
        </div>
      </section>

      {/* Book introduction section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">My Book: SHAIPE</h2>
          <Link 
            href="/book"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm"
          >
            View all chapters →
          </Link>
        </div>
        
        {/* Book hero section */}
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black opacity-50 dark:opacity-70 z-10"></div>
            <img 
              src="/images/website-images/book-hero-banner.png" 
              alt="AI Operations background" 
              className="w-full h-full object-cover object-[center_20%]"
            />
          </div>
          
          <div className="relative z-20 py-16 px-8 md:py-20 md:px-12 text-center">
            <h3 className="text-6xl md:text-5xl font-bold text-white mb-6">SHAIPE</h3>
            <p className="text-xl font-medium text-emerald-300 mb-6">A guide to creating superhuman AI-powered employees through AI Operations in the enterprise</p>
            <p className="text-slate-200 mb-8 max-w-3xl mx-auto">
              Given the rapid evolution of AI, I've chosen to publish this as a living digital document rather than a traditional print book. This format allows for regular updates to keep pace with the field's constant advancements.
            </p>
            <Link 
              href="/book" 
              className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-8 py-4 rounded-md font-medium transition-colors text-lg"
            >
              Start Reading
            </Link>
          </div>
        </div>
      </section>

      {/* Two-column section with Research and Tags */}
      <section className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Research Articles - Left Column (1/2 width) */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Recent Research</h2>
            </div>
            
            <div className="space-y-4">
              {latestResearchPosts.length > 0 ? (
                latestResearchPosts.map((post) => (
                  <div 
                    key={post.slug}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all p-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {post.coverImage && (
                        <div className="sm:w-1/4 h-32 sm:h-auto overflow-hidden rounded-md">
                          <img 
                            src={post.coverImage.startsWith('/') ? post.coverImage : `/images/research-images/cover-images/${post.coverImage}`} 
                            alt={`Cover image for ${post.title}`}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          <BeakerIcon className="h-4 w-4" />
                          <span>Research</span>
                        </div>
                        <Link 
                          href={`/research/${post.slug}`}
                          className="text-lg font-semibold text-slate-900 dark:text-slate-50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {post.description && (
                          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link 
                              key={tag}
                              href={`/tags/${tag.toLowerCase()}`}
                              className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              <TagIcon className="h-3 w-3" />
                              <span>{tag}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                    <BeakerIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No research articles yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                    Research articles will appear here once they are published. Check back soon for new insights and findings.  
                  </p>
                  <Link 
                    href="/research"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1"
                  >
                    View Research Page
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Link 
                href="/research"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1"
              >
                View all research
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Top Tags - Right Column (1/2 width) */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Popular Topics</h2>
            </div>
            
            <div className="space-y-4">
              {topTags.map((tag) => (
                <Link 
                  key={tag.name}
                  href={`/tags/${tag.name.toLowerCase()}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <TagIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tag.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
              
              {topTags.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                    <TagIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No topics yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                    Topics will appear here as content is published.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Link 
                href="/tags"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1"
              >
                View all topics
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
