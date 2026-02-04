import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 *
 * Checks for session cookie and redirects to login if not authenticated.
 * Allows access to login and setup pages without authentication.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes that don't require authentication
  const publicAdminRoutes = ['/admin/login', '/admin/setup'];

  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow access to public admin routes
    if (publicAdminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get('toxic_session')?.value;

    if (!sessionToken) {
      // Redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists, allow access
    // Note: Full session validation happens in the page/API handlers
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
