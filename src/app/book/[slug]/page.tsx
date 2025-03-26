import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import styles from './book-chapter.module.css';

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps) {
  // Only show published posts
  const { slug } = await Promise.resolve(params);
  const post = await getPostBySlug(slug, 'book', false);
  
  if (!post) {
    return {
      title: 'Chapter Not Found',
    };
  }
  
  // Use summary, description or generate a default description
  const description = post.summary || post.description || `Book chapter: ${post.title}`;
  
  // Determine the image URL
  const imageUrl = post.coverImage 
    ? (post.coverImage.startsWith('/') 
        ? `https://brandongadoci.com${post.coverImage}` 
        : `https://brandongadoci.com/images/book-images/cover-images/${post.coverImage}`)
    : 'https://brandongadoci.com/images/website-images/avatar-circle.png';
  
  return {
    title: `${post.title} - Book`,
    description: description,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `https://brandongadoci.com/book/${post.slug}`,
      title: post.title,
      description: description,
      siteName: 'Brandon Gadoci',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      creator: '@bgadoci',
      images: [imageUrl],
    },
  };
}

export default async function BookChapterPage({ params }: PageProps) {
  // Only show published posts
  const { slug } = await Promise.resolve(params);
  const post = await getPostBySlug(slug, 'book', false);
  
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
        
        {/* Date and status */}
        <div className="mb-3">
          <p className="text-slate-500 dark:text-slate-400">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {post.status === 'draft' && (
              <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded ml-2">
                Draft
              </span>
            )}
          </p>
        </div>
        
        {/* Tags on their own line, left-justified */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2 pb-4">
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
        
        {/* Cover image if available */}
        {post.coverImage && (
          <div className={`w-full h-64 md:h-80 lg:h-96 mb-6 ${styles.coverImage}`}>
            <img 
              src={post.coverImage.startsWith('/') ? post.coverImage : `/images/book-images/cover-images/${post.coverImage}`} 
              alt={`Cover image for ${post.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Summary Section */}
        {post.summary && (
          <div className="mt-2 mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border-l-4 border-emerald-500">
            <p className="text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Summary:</span> {post.summary}
            </p>
          </div>
        )}
      </div>
      
      <div className="prose prose-emerald dark:prose-invert max-w-none content-post ${styles.imageOverride}">
        <div className={`book-content ${styles.bookContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {previousChapter ? (
            <Link 
              href={`/book/${previousChapter.slug}`}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium"
            >
              ← {previousChapter.title}
            </Link>
          ) : (
            <div>{/* Empty div to maintain spacing when no previous chapter */}</div>
          )}
          
          {nextChapter ? (
            <Link 
              href={`/book/${nextChapter.slug}`}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium text-right"
            >
              {nextChapter.title} →
            </Link>
          ) : (
            <div>{/* Empty div to maintain spacing when no next chapter */}</div>
          )}
        </div>
      </div>
    </article>
  );
}
