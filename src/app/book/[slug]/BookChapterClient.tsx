"use client";

import Link from 'next/link';
import { useState } from 'react';
import { PostMetadata } from '@/lib/markdown';
import SlideOutChatPanel from '../SlideOutChatPanel';
import ChatButton from '../components/ChatButton';

type BookChapterClientProps = {
  post: PostMetadata & { content: string };
  previousChapter: PostMetadata | null;
  nextChapter: PostMetadata | null;
  styles: any;
};

export default function BookChapterClient({ post, previousChapter, nextChapter, styles }: BookChapterClientProps) {
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  // Function to toggle chat panel
  const toggleChatPanel = () => {
    setChatPanelOpen(!chatPanelOpen);
  };

  // Function to close chat panel
  const closeChatPanel = () => {
    setChatPanelOpen(false);
  };

  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/book" className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
            Book
          </Link>{' '}
          / {post.title}
        </div>
        <div className="flex justify-between" style={{ alignItems: 'flex-start' }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">{post.title}</h1>
          <div style={{ marginTop: '4px' }}>
            <ChatButton onClick={toggleChatPanel} showText={true} />
          </div>
        </div>
        
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
              src={post.coverImage.startsWith('https://') ? post.coverImage : post.coverImage.startsWith('/') ? post.coverImage : `/images/book-images/cover-images/${post.coverImage}`} 
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
      
      <div className={`prose prose-emerald dark:prose-invert max-w-none content-post ${styles.imageOverride}`}>
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

      {/* Slide-out chat panel */}
      <SlideOutChatPanel isOpen={chatPanelOpen} onClose={closeChatPanel} />
    </article>
  );
}