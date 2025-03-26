import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { DocumentTextIcon, BeakerIcon, BookOpenIcon, TagIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brandon Gadoci | VP of AI Operations",
  description: "Personal website of Brandon Gadoci, VP of AI Operations at data.world, writing about AI, AI Operations, and research",
  icons: {
    icon: "/images/website-images/avatar-circle.png",
    apple: "/images/website-images/avatar-circle.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:text-slate-50`}>
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
            <nav className="flex items-center space-x-6">
              <Link href="/blog" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                Blog
              </Link>
              <Link href="/book" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                Book
              </Link>
              <Link href="/research" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                Research
              </Link>
              <Link href="/tags" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                Tags
              </Link>
              <Link 
                href="/search" 
                className="flex items-center text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="ml-1 hidden sm:inline">Search</span>
              </Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © {new Date().getFullYear()} Brandon Gadoci | VP of AI Operations at data.world
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
