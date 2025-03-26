"use client";

import Link from 'next/link';
import { useState } from 'react';
import { BookOpenIcon, TagIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PostMetadata } from '@/lib/markdown';

// Table of contents data
const tableOfContents = [
  {
    title: "The Beginning",
    description: "Introduction to AI Operations and the SHAIPE framework",
    slug: "chapter-1-the-beginning",
    available: true
  },
  {
    title: "The Revelation",
    description: "How AI is transforming enterprise operations",
    slug: "chapter-2-the-revelation",
    available: true
  },
  {
    title: "Building Superhuman Capabilities",
    description: "Coming soon...",
    slug: "",
    available: false
  },
  {
    title: "Implementing SHAIPE in Your Organization",
    description: "Coming soon...",
    slug: "",
    available: false
  }
];

export default function BookContent({ posts }: { posts: PostMetadata[] }) {
  // State for mobile TOC dropdown
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div>
      {/* Hero section */}
      <section className="relative py-16 px-4 sm:px-6 rounded-lg mb-8 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-50 dark:opacity-70 z-10"></div>
          <img 
            src="/images/website-images/book-hero-banner.png" 
            alt="AI Operations background" 
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>
        
        {/* Content */}
        <div className="max-w-3xl mx-auto text-center relative z-20">
          <h1 className="text-6xl font-bold text-white mb-4">S.H.A.I.P.E</h1>
          <h2 className="text-2xl font-medium text-emerald-300 mb-4">A guide to creating superhuman AI-powered employees through AI Operations in the enterprise</h2>
          <p className="text-lg text-slate-200 mb-8">
            By Brandon Gadoci, VP of AI Operations at data.world
          </p>
        </div>
      </section>
      
      {/* Mobile TOC Toggle */}
      <div className="md:hidden mb-6">
        <button 
          onClick={() => setTocOpen(!tocOpen)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium">Table of Contents</span>
          </div>
          {tocOpen ? (
            <XMarkIcon className="h-5 w-5 text-slate-500" />
          ) : (
            <Bars3Icon className="h-5 w-5 text-slate-500" />
          )}
        </button>
        
        {/* Mobile TOC Dropdown */}
        {tocOpen && (
          <div className="mt-2 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <ol className="list-decimal list-inside space-y-4 ml-2">
              {tableOfContents.map((chapter, index) => (
                <li key={index} className={`text-base ${!chapter.available ? 'text-slate-500 dark:text-slate-500' : ''}`}>
                  {chapter.available ? (
                    <Link href={`/book/${chapter.slug}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      {chapter.title}
                    </Link>
                  ) : (
                    <span>{chapter.title}</span>
                  )}
                  <p className={`text-sm ml-6 mt-1 ${!chapter.available ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {chapter.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar TOC (desktop only) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50">
              <BookOpenIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <span>Table of Contents</span>
            </h2>
            <ol className="list-decimal list-inside space-y-4 ml-2">
              {tableOfContents.map((chapter, index) => (
                <li key={index} className={`text-sm ${!chapter.available ? 'text-slate-500 dark:text-slate-500' : ''}`}>
                  {chapter.available ? (
                    <Link href={`/book/${chapter.slug}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      {chapter.title}
                    </Link>
                  ) : (
                    <span>{chapter.title}</span>
                  )}
                  <p className={`text-xs ml-5 mt-1 ${!chapter.available ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {chapter.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Available Chapters</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-base">
            Given the rapid evolution of AI, I've chosen to publish this as a living digital document rather than a traditional print book. This format allows for regular updates to keep pace with the field's constant advancements.
          </p>
          <div className="grid gap-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link 
                  key={post.slug} 
                  href={`/book/${post.slug}`}
                  className="block bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 p-6 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-medium">
                      <span>Read chapter</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                  
                  {post.status === 'draft' && (
                    <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded mt-2 mb-2">
                      Draft
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags && post.tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                      >
                        <TagIcon className="h-3 w-3" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No book chapters found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
