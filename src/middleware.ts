import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Flag to track if sync has been performed
// This needs to be outside the middleware function to persist between requests
let hasSyncedOnStartup = false;

// Flag to track if a sync is currently in progress to prevent multiple concurrent syncs
let isSyncInProgress = false;

export async function middleware(request: NextRequest) {
  // Skip syncing for API routes to prevent infinite loops
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Only sync once per application startup and only if not already in progress
  if (!hasSyncedOnStartup && !isSyncInProgress) {
    console.log('First request detected, syncing content...');
    isSyncInProgress = true; // Set flag to prevent concurrent syncs
    
    try {
      // Get the base URL from the request
      // In production, we need to ensure we're using the correct protocol and host
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || request.nextUrl.host;
      const baseUrl = `${protocol}://${host}`;
      const syncUrl = `${baseUrl}/api/sync`;
      console.log(`Calling sync API at ${syncUrl}`);
      
      const response = await fetch(syncUrl);
      if (response.ok) {
        const result = await response.json();
        console.log('Sync result:', result);
        hasSyncedOnStartup = true; // Mark sync as completed
      } else {
        console.error('Sync API returned error:', response.status);
      }
    } catch (error) {
      console.error('Error during startup sync:', error);
    } finally {
      isSyncInProgress = false; // Reset flag regardless of success/failure
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Only run middleware on specific paths to avoid unnecessary processing
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public resources)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)).*)',
  ],
};
