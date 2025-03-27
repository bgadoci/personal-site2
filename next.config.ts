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
    // Use the redirects from the generated file
    return (redirectsConfig as RedirectsConfig).redirects();
  }
};

export default nextConfig;
