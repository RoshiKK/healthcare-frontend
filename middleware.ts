import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const user = request.cookies.get('user')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/admin', '/doctor', '/appointments']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based protection
  if (pathname.startsWith('/admin') && user) {
    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/doctor') && user) {
    const userData = JSON.parse(user)
    if (userData.role !== 'doctor') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/appointments/:path*']
}