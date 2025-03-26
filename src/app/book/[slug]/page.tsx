import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps) {
  // Only show published posts
  const post = await getPostBySlug(params.slug, 'book', false);
  
  if (!post) {
    return {
      title: 'Chapter Not Found',
    };
  }
  
  return {
    title: `${post.title} - Book`,
    description: `Book chapter: ${post.title}`,
  };
}

export default async function BookChapterPage({ params }: PageProps) {
  // Only show published posts
  const post = await getPostBySlug(params.slug, 'book', false);
  
  if (!post) {
    notFound();
  }
  
  // Get all published book chapters to determine next/previous
  const allChapters = getAllPosts(false)
    .filter(p => p.category === 'book')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const currentIndex = allChapters.findIndex(chapter => chapter.slug === post.slug);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/book" className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
            Book
          </Link>{' '}
          / {post.title}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">{post.title}</h1>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {post.status === 'draft' && (
              <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded mt-2">
                Draft
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/tags/${tag.toLowerCase()}`}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="prose prose-emerald dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between">
          {previousChapter && (
            <Link 
              href={`/book/${previousChapter.slug}`}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 sm:mb-0 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Previous Chapter</div>
              <div className="text-emerald-500 dark:text-emerald-400 font-medium">← {previousChapter.title}</div>
            </Link>
          )}
          
          {nextChapter && (
            <Link 
              href={`/book/${nextChapter.slug}`}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-sm transition-all text-right"
            >
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next Chapter</div>
              <div className="text-emerald-500 dark:text-emerald-400 font-medium">{nextChapter.title} →</div>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
