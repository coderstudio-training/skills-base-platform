import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (token?.role) {
    const role = token.role.toLowerCase()
    return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
  }

  // If no role is found, redirect to a default page or show an error
  return NextResponse.redirect(new URL('/auth/error', req.url))
}
