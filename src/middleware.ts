// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const LOGIN = '/signin'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get('auth-token')?.value

  // Public routes handling
  if (path === LOGIN) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
        return NextResponse.redirect(new URL('/dashboard', req.url))
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
    return NextResponse.redirect(new URL(`${LOGIN}?redirect=${path}`, req.url))
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))

    // Clone request headers and add user data
    const headers = new Headers(req.headers)
    headers.set('x-user-role', payload.role as string)
    headers.set('x-user-id', payload.userId as string)

    return NextResponse.next({ headers })
  } catch {
    const res = NextResponse.redirect(new URL(LOGIN, req.url))
    res.cookies.delete('auth-token')
    return res
  }
}

export const config = {
  matcher: [
    '/login'
  ]
}
