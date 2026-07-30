import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/check-email',
    '/auth/callback',
    '/',
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Get user from session (populated by updateSession)
  const user = request.cookies.get('sb-auth-token')

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!user && !isPublicRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
