import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  try {
    // Refresh session if expired - required for Server Components
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    // Bypass authentication checks temporarily for debugging
    // Just pass through all requests and let client-side handle auth
    return response;

    /* Original logic - commented out for debugging
    // Check if we need to protect this route
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/profile');
    
    // If the route is protected and there's no active session, redirect to /auth
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is trying to access /auth but they're already logged in,
    // redirect them to /profile
    if (path === '/auth' && session) {
      const redirectUrl = new URL('/profile', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    */
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, just continue to the page
    return response;
  }
}

// Modify the matcher to exclude profile route for now
export const config = {
  matcher: ['/auth', '/api/:path*'],
}; 