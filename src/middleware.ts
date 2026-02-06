import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes and handle CORS
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    if (allowedOrigin && origin && origin === allowedOrigin) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          Vary: 'Origin',
        },
      });
    }

    return new NextResponse(null, { status: 403 });
  }

  // Add CORS headers to all responses
  const response = NextResponse.next();
  if (allowedOrigin && origin && origin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Vary', 'Origin');
  }

  // Admin routes that don't require authentication
  const publicAdminRoutes = ['/admin/login', '/admin/setup'];

  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow access to public admin routes
    if (publicAdminRoutes.some(route => pathname.startsWith(route))) {
      return response;
    }

    // Check for session cookie
    const sessionToken = request.cookies.get('toxic_session')?.value;

    if (!sessionToken) {
      // Redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
