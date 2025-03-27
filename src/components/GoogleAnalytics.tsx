'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = 'G-5C4BQHH80G';
  
  // Only run in production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // This useEffect is for page view tracking when navigating between pages
  useEffect(() => {
    // Only run in production
    if (!isProduction) return;
    
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    // Add event listener for route changes
    document.addEventListener('routeChangeComplete', handleRouteChange as any);
    
    return () => {
      document.removeEventListener('routeChangeComplete', handleRouteChange as any);
    };
  }, []);

  // Don't render anything in non-production environments
  if (!isProduction) {
    return null;
  }
  
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

// Add TypeScript declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
