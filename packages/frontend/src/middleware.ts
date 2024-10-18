// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If the user is logged in and trying to access the home page
  if (session && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
    const role = session.role as string

    switch (role) {
      case 'admin':
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      case 'manager':
        return NextResponse.redirect(new URL('/dashboard/manager', request.url))
      case 'employee':
        return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      default:
        // If role is not recognized, redirect to a default dashboard or show an error
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // If the user is not logged in, allow them to access the home page
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login']
}
