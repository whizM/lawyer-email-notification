// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const LOGIN = '/signin'
const protectedRoutes = ['/dashboard', '/settings', '/lawyers', '/email-templates']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Skip middleware for static assets, API routes, and Next.js internals
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.') // This catches most static files (css, js, images, etc.)
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth-token')?.value

  // Public routes handling
  if (path === LOGIN) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      } catch (error) {
        console.error('JWT verification failed on signin page:', error)
        // Invalid token - clear cookie
        const res = NextResponse.next()
        res.cookies.delete('auth-token')
        return res
      }
    }
    return NextResponse.next()
  }

  // Authentication check for protected routes
  if (protectedRoutes.includes(path)) {
    if (!token) {
      console.log('No token found for protected route:', path)
      return NextResponse.redirect(new URL(`${LOGIN}?redirect=${path}`, req.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
      const { payload } = await jwtVerify(token, secret)

      // Clone request headers and add user data
      const headers = new Headers(req.headers)
      headers.set('x-user-role', payload.role as string)
      headers.set('x-user-id', payload.userId as string)

      return NextResponse.next({ headers })
    } catch (error) {
      console.error('JWT verification failed for protected route:', path, error)
      const res = NextResponse.redirect(new URL(LOGIN, req.url))
      res.cookies.delete('auth-token')
      return res
    }
  }

  // For all other routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
