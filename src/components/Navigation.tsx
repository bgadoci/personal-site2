'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    // Handle escape key to close search
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Focus the input when search is opened
      searchInputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus will be set by useEffect when searchOpen becomes true
    } else {
      setSearchQuery('');
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-0 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/website-images/avatar.png" 
              alt="Brandon Gadoci" 
              className="h-10 w-10 rounded-full border-2 border-emerald-500 dark:border-emerald-400"
            />
            <span className="text-xl font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300 transition-colors">
              Brandon Gadoci
            </span>
          </Link>
          
          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-6" ref={searchContainerRef}>
            {/* Show navigation links only when search is not open */}
            {!searchOpen && (
              <>
                <Link 
                  href="/blog" 
                  className={`font-medium transition-colors py-1 border-b-2 ${pathname === '/blog' || pathname?.startsWith('/blog/') ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400'}`}
                >
                  Blog
                </Link>
                <Link 
                  href="/book" 
                  className={`font-medium transition-colors py-1 border-b-2 ${pathname === '/book' || pathname?.startsWith('/book/') ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400'}`}
                >
                  Book
                </Link>
                <Link 
                  href="/research" 
                  className={`font-medium transition-colors py-1 border-b-2 ${pathname === '/research' || pathname?.startsWith('/research/') ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400'}`}
                >
                  Research
                </Link>
                <Link 
                  href="/tags" 
                  className={`font-medium transition-colors py-1 border-b-2 ${pathname === '/tags' || pathname?.startsWith('/tags/') ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border-transparent hover:border-emerald-500 dark:hover:border-emerald-400'}`}
                >
                  Tags
                </Link>
              </>
            )}
            
            {/* Search toggle button or search input */}
            {!searchOpen ? (
              <button
                onClick={toggleSearch}
                className="flex items-center text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="Open search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="ml-1">Search</span>
              </button>
            ) : (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-72 h-10 pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                    aria-label="Search query"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Close search"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link 
              href="/search" 
              className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} 
        id="mobile-menu"
      >
        <div className="px-4 py-3 space-y-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/blog" 
            className={`block transition-colors py-2 ${pathname === '/blog' || pathname?.startsWith('/blog/') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link 
            href="/book" 
            className={`block transition-colors py-2 ${pathname === '/book' || pathname?.startsWith('/book/') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Book
          </Link>
          <Link 
            href="/research" 
            className={`block transition-colors py-2 ${pathname === '/research' || pathname?.startsWith('/research/') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Research
          </Link>
          <Link 
            href="/tags" 
            className={`block transition-colors py-2 ${pathname === '/tags' || pathname?.startsWith('/tags/') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Tags
          </Link>
          <Link 
            href="/search" 
            className={`block transition-colors py-2 ${pathname === '/search' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
