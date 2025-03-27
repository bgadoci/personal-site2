import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Helper function to safely create URL with fallbacks
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // During development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // In production, use the actual domain
  return 'https://brandongadoci.com';
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Brandon Gadoci | VP of AI Operations",
  description: "Personal website of Brandon Gadoci, VP of AI Operations at data.world, writing about AI, AI Operations, and research",
  icons: {
    icon: "/images/website-images/avatar-circle.png",
    apple: "/images/website-images/avatar-circle.png",
  },
  // Default Open Graph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brandongadoci.com',
    siteName: 'Brandon Gadoci',
    title: 'Brandon Gadoci | VP of AI Operations',
    description: 'Personal website of Brandon Gadoci, VP of AI Operations at data.world, writing about AI, AI Operations, and research',
    images: [
      {
        url: '/images/website-images/avatar-circle.png',
        width: 1200,
        height: 630,
        alt: 'Brandon Gadoci',
      },
    ],
  },
  // Default Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Brandon Gadoci | VP of AI Operations',
    description: 'Personal website of Brandon Gadoci, VP of AI Operations at data.world, writing about AI, AI Operations, and research',
    creator: '@bgadoci',
    images: ['/images/website-images/avatar-circle.png'],
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
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-8" style={{ maxWidth: '1350px' }}>
          {children}
        </main>
        
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6">
          <div className="container mx-auto px-4" style={{ maxWidth: '960px' }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © {new Date().getFullYear()} Brandon Gadoci | VP of AI Operations at data.world
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  About
                </Link>
                <Link href="https://www.linkedin.com/in/bgadoci/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  LinkedIn
                </Link>
                <Link href="https://x.com/bgadoci" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors">
                  X
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
