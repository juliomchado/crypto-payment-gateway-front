import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes - require authentication
  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))

  // Auth routes - redirect to dashboard if already authenticated
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthRoute = authPaths.some(path => pathname === path)

  if (isAuthRoute) {
    const token = request.cookies.get('token')?.value
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isProtectedRoute) {
    // In production: only check JWT cookie
    // In development with MOCK: skip middleware check (handled client-side)
    const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

    if (!isMockMode) {
      const token = request.cookies.get('token')?.value

      if (!token) {
        // No authentication found - redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Token exists - backend will validate on API calls
      // Admin-only routes checked in layout (client-side) since we need to decode JWT
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
}
