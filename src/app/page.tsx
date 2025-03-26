import Link from 'next/link';
import { getAllPosts } from '@/lib/markdown';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon } from "@heroicons/react/24/outline";

export default function Home() {
  // Get the latest posts from each category
  const allPosts = getAllPosts();
  
  // Group posts by category
  const postsByCategory = allPosts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof allPosts>);
  
  // Get the latest post from each category
  const latestPosts = Object.entries(postsByCategory).map(([category, posts]) => {
    return posts[0]; // First post is the latest due to sorting in getAllPosts
  });

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="bg-emerald-50 dark:bg-slate-700 py-16 px-4 sm:px-6 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/website-images/avatar.png" 
              alt="Brandon Gadoci" 
              className="h-32 w-32 rounded-full border-4 border-emerald-500 dark:border-emerald-400 shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Brandon Gadoci</h1>
          <h2 className="text-2xl font-medium text-emerald-600 dark:text-emerald-400 mb-4">VP of AI Operations at data.world</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
            First employee at data.world 9 years ago. Writing about AI, AI Operations, and sharing my research and life experiences.
          </p>
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

      {/* Featured content section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">Latest Writings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/${post.category}/${post.slug}`}
              className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:border-emerald-500 dark:hover:border-emerald-600"
            >
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  {post.category === 'blog' && <DocumentTextIcon className="h-4 w-4" />}
                  {post.category === 'research' && <BeakerIcon className="h-4 w-4" />}
                  {post.category === 'book' && <BookOpenIcon className="h-4 w-4" />}
                  <span>{post.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
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

      {/* Categories section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">What I Write About</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/blog"
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-0">Blog</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Thoughts, experiences, and insights about AI, technology, and my professional journey.</p>
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">Browse articles →</span>
          </Link>
          
          <Link 
            href="/research"
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <BeakerIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-0">Research</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">In-depth analysis and research on AI Operations, data management, and emerging technologies.</p>
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">Explore research →</span>
          </Link>
          
          <Link 
            href="/book"
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-0">Book</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Long-form content and book chapters I'm working on about AI and data operations.</p>
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">Read chapters →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
