import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import styles from './research-paper.module.css';

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps) {
  // Only show published posts
  const { slug } = params;
  const post = await getPostBySlug(slug, 'research', false);
  
  if (!post) {
    return {
      title: 'Research Paper Not Found',
    };
  }
  
  // Use description or generate a default description
  const description = post.description || post.summary || `Research paper about ${post.title}`;
  
  // Determine the image URL
  const imageUrl = post.coverImage 
    ? (post.coverImage.startsWith('/') 
        ? `https://brandongadoci.com${post.coverImage}` 
        : `https://brandongadoci.com/images/research-images/cover-images/${post.coverImage}`)
    : 'https://brandongadoci.com/images/website-images/avatar-circle.png';
  
  return {
    title: `${post.title} - Research`,
    description: description,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `https://brandongadoci.com/research/${post.slug}`,
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

export default async function ResearchPostPage({ params }: PageProps) {
  // Only show published posts
  const { slug } = params;
  const post = await getPostBySlug(slug, 'research', false);
  
  if (!post) {
    notFound();
  }
  
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/research" className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
            Research
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
              src={post.coverImage.startsWith('/') ? post.coverImage : `/images/research-images/cover-images/${post.coverImage}`} 
              alt={`Cover image for ${post.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="prose prose-emerald dark:prose-invert max-w-none content-post ${styles.imageOverride}">
        <div className={`research-content ${styles.researchContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Related Research</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getAllPosts()
            .filter(p => p.category === 'research' && p.slug !== post.slug)
            .slice(0, 2)
            .map(relatedPost => (
              <div key={relatedPost.slug} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  <Link 
                    href={`/research/${relatedPost.slug}`} 
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
                  href={`/research/${relatedPost.slug}`}
                  className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                >
                  Read paper →
                </Link>
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}
