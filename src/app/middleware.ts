import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware function that runs before matching routes
export function middleware(request: NextRequest) {
  // Check for token in cookies
  const token = request.cookies.get('token')

  // If no token AND not already on an auth page
  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    // Redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Config specifies which routes this middleware applies to
export const config = {
  matcher: ["/wallet/:path*"], // Applies to /wallet and all its sub-routes
};
