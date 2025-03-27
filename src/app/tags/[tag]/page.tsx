import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/markdown';
import { resolveParams, TagParams } from '@/lib/utils';
import TagLink from '@/components/TagLink';
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon } from "@heroicons/react/24/outline";

export async function generateMetadata({ params }: TagParams) {
  // Get the tag parameter directly
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);
  // Only include published posts for tags
  const allTags = getAllTags(false).map(tag => tag.name.toLowerCase());
  
  if (!allTags.includes(decodedTag.toLowerCase())) {
    return {
      title: 'Tag Not Found',
    };
  }
  
  return {
    title: `${decodedTag} - Tags`,
    description: `Content tagged with ${decodedTag}`,
  };
}

export default async function TagPage({ params }: TagParams) {
  // Get the tag parameter directly
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);
  // Only include published posts for tags
  const allTags = getAllTags(false).map(tag => tag.name.toLowerCase());
  
  if (!allTags.includes(decodedTag.toLowerCase())) {
    notFound();
  }
  
  // Find the actual tag with correct casing
  const tagInfo = getAllTags(false).find(
    tag => tag.name.toLowerCase() === decodedTag.toLowerCase()
  );
  
  // Only get published posts with this tag
  const posts = getPostsByTag(tagInfo?.name || decodedTag, false);
  
  // Group posts by category
  const postsByCategory = posts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);
  
  // Import the client component to render the tag results
  const TagResultsList = dynamic(() => import('@/components/TagResultsList'), {
    ssr: true // We want server-side rendering for the initial load
  });
  
  // Get other tags for the related tags section
  const otherTags = getAllTags()
    .filter(tag => tag.name.toLowerCase() !== decodedTag.toLowerCase())
    .slice(0, 10);
  
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link 
            href="/tags"
            className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Tags
          </Link>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{tagInfo?.name || decodedTag}</h1>
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged with "{tagInfo?.name || decodedTag}"
        </p>
      </div>

      <TagResultsList 
        posts={JSON.parse(JSON.stringify(posts))} 
        tagName={tagInfo?.name || decodedTag} 
        otherTags={JSON.parse(JSON.stringify(otherTags))} 
      />
    </div>
  );
}
