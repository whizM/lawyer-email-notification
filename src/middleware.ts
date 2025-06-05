// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_PREFIX = '/admin'
const USER_LOGIN = '/signin'
const ADMIN_LOGIN = '/admin/signin'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get('auth-token')?.value
  const isAdminRoute = path.startsWith(ADMIN_PREFIX)

  // Public routes handling
  if ([USER_LOGIN, ADMIN_LOGIN].includes(path)) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
        const redirectPath = payload.role === 'admin' ? '/admin/dashboard' : '/dashboard'
        return NextResponse.redirect(new URL(redirectPath, req.url))
      } catch {
        // Invalid token - clear cookie
        const res = NextResponse.next()
        res.cookies.delete('auth-token')
        return res
      }
    }
    return NextResponse.next()
  }

  // Authentication check
  if (!token) {
    const loginPath = isAdminRoute ? ADMIN_LOGIN : USER_LOGIN
    return NextResponse.redirect(new URL(`${loginPath}?redirect=${path}`, req.url))
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))

    // Role-based authorization
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url))
    }

    // Clone request headers and add user data
    const headers = new Headers(req.headers)
    headers.set('x-user-role', payload.role as string)
    headers.set('x-user-id', payload.userId as string)

    return NextResponse.next({ headers })
  } catch {
    const res = NextResponse.redirect(new URL(isAdminRoute ? ADMIN_LOGIN : USER_LOGIN, req.url))
    res.cookies.delete('auth-token')
    return res
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/admin/signin'
  ]
}
