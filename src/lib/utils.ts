/**
 * Type definitions for Next.js dynamic route params
 * In Next.js 15, params are now Promise<...> in production builds
 */

// For blog, book, and research pages
export type SlugParams = {
  params: Promise<{
    slug: string;
  }>;
};

// For tag pages
export type TagParams = {
  params: Promise<{
    tag: string;
  }>;
};

/**
 * Utility function to safely resolve dynamic route params
 * This handles the difference between development and production environments
 * where params might be a direct object or a Promise
 */
export async function resolveParams<T>(params: T | Promise<T>): Promise<T> {
  return Promise.resolve(params);
}
