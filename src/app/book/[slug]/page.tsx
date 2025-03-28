import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import { resolveParams, SlugParams } from '@/lib/utils';
import styles from './book-chapter.module.css';
import BookChapterClient from './BookChapterClient';

export async function generateMetadata({ params }: SlugParams) {
  // Only show published posts
  const resolvedParams = await params;
  const { slug } = resolvedParams;
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
    ? (post.coverImage.startsWith('https://') 
        ? post.coverImage 
        : post.coverImage.startsWith('/') 
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

export default async function BookChapterPage({ params }: SlugParams) {
  // Only show published posts
  const resolvedParams = await params;
  const { slug } = resolvedParams;
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
    <BookChapterClient 
      post={post} 
      previousChapter={previousChapter} 
      nextChapter={nextChapter}
      styles={styles}
    />
  );
}
