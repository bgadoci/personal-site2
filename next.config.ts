import type { NextConfig } from "next";
import redirectsConfig from "./redirects.js";

// Type for the redirects function
interface RedirectsConfig {
  redirects(): Promise<Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }>>;
}

const nextConfig: NextConfig = {
  /* config options here */
  
  // Add the redirects configuration
  async redirects() {
    // Get the redirects from the generated file
    const contentRedirects = await (redirectsConfig as RedirectsConfig).redirects();
    
    // Add domain-level redirects (www to non-www)
    const domainRedirects = [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.bgadoci.com',
          },
        ],
        destination: 'https://bgadoci.com/:path*',
        permanent: true,
      },
    ];
    
    // Combine both redirect arrays
    return [...domainRedirects, ...contentRedirects];
  },
  
  // Add hostname configuration for images
  images: {
    domains: ['bgadoci.com', 'www.bgadoci.com', 'storage.googleapis.com'],
  }
};

export default nextConfig;
