/**
 * Utility function to safely resolve dynamic route params
 * This handles the difference between development and production environments
 * where params might be a direct object or a Promise
 */
export async function resolveParams<T>(params: T | Promise<T>): Promise<T> {
  return Promise.resolve(params);
}
