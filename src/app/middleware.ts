import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware function that runs before matching routes
export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Allow access to the landing page and static assets
  if (path === '/' || path.startsWith('/_next') || path.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check for token in cookies for protected routes
  const token = request.cookies.get('token')

  // If no token and trying to access wallet routes
  if (!token && path.startsWith('/wallet')) {
    // Redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Config specifies which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
