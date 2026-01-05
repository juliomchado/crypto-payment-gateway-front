import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Note: This middleware runs on the edge and cannot access localStorage
    // For proper admin protection, you would need to:
    // 1. Store user role in an HTTP-only cookie after login
    // 2. Read and verify the cookie here
    // 3. Decode JWT token to check if user.role === 'ADMIN'

    // For now, we'll rely on client-side protection in the layout
    // In production with real backend, uncomment the code below:

    /*
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify JWT and check role
      const payload = verifyJWT(token)
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    */
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
