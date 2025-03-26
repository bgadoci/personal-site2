import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import { resolveParams } from '@/lib/utils';
import styles from './blog-post.module.css';

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps) {
  // Only show published posts
  const resolvedParams = await resolveParams(params);
  const { slug } = resolvedParams;
  const post = await getPostBySlug(slug, 'blog', false);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  // Use excerpt or generate a description
  const description = post.excerpt || post.description || `Blog post about ${post.title}`;
  
  // Determine the image URL
  const imageUrl = post.coverImage 
    ? (post.coverImage.startsWith('/') 
        ? `https://brandongadoci.com${post.coverImage}` 
        : `https://brandongadoci.com/images/blog-images/cover-images/${post.coverImage}`)
    : 'https://brandongadoci.com/images/website-images/avatar-circle.png';
  
  return {
    title: `${post.title} - Blog`,
    description: description,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `https://brandongadoci.com/blog/${post.slug}`,
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

export default async function BlogPostPage({ params }: PageProps) {
  // Only show published posts
  const resolvedParams = await resolveParams(params);
  const { slug } = resolvedParams;
  const post = await getPostBySlug(slug, 'blog', false);
  
  if (!post) {
    notFound();
  }
  
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/blog" className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
            Blog
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
          <div className="flex flex-wrap gap-2 pb-6">
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
        
        {post.coverImage && (
          <div className={`w-full h-64 md:h-80 lg:h-96 mb-6 ${styles.coverImage}`}>
            <img 
              src={post.coverImage.startsWith('/') ? post.coverImage : `/images/blog-images/cover-images/${post.coverImage}`} 
              alt={`Cover image for ${post.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="prose prose-lg prose-emerald dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-headings:text-slate-900 dark:prose-headings:text-slate-50 prose-headings:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:text-slate-800 dark:prose-pre:text-slate-200 prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:mb-1 prose-strong:text-slate-900 dark:prose-strong:text-white prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:border-emerald-500 dark:prose-blockquote:border-emerald-600 max-w-none content-post ${styles.imageOverride}">
        <div className={`blog-content ${styles.blogContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Continue Reading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getAllPosts()
            .filter(p => p.category === 'blog' && p.slug !== post.slug)
            .slice(0, 2)
            .map(relatedPost => (
              <div key={relatedPost.slug} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                {relatedPost.coverImage && (
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={relatedPost.coverImage.startsWith('/') ? relatedPost.coverImage : `/images/blog-images/cover-images/${relatedPost.coverImage}`} 
                      alt={`Cover image for ${relatedPost.title}`}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    <Link 
                      href={`/blog/${relatedPost.slug}`} 
                      className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    {new Date(relatedPost.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <Link 
                    href={`/blog/${relatedPost.slug}`}
                    className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                  >
                    Read article →
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}
