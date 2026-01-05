import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // In a real app, you would check the user's role from a session/JWT
    // For now, this is a placeholder that allows access
    // You should integrate with your auth system to check if user.role === 'ADMIN'

    // Example: Read from cookie and verify JWT to check role
    // const token = request.cookies.get('token')?.value
    // if (!token || !isAdmin(token)) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url))
    // }

    // For mock mode, we'll allow access
    // In production, uncomment the logic above
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
