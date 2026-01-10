import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes - require authentication
  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value
    const mockUser = request.cookies.get('mock_user')?.value

    // Check authentication: either real token or mock user (for development)
    const isAuthenticated = token || mockUser

    if (!isAuthenticated) {
      // No authentication found - redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Token exists - backend will validate on API calls
    // Admin-only routes checked in layout (client-side) since we need to decode JWT
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
