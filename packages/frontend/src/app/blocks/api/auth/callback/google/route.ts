import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Redirects to the correct dashboard page based on the user's role.
 *
 * If the role is not found, redirects to the error page.
 *
 * @param req NextRequest
 * @returns NextResponse
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token?.role) {
    const role = token.role.toLowerCase();
    return NextResponse.redirect(new URL(`${window.location.origin}/dashboard/${role}`, req.url));
  }

  // If no role is found, redirect to a default page or show an error
  return NextResponse.redirect(new URL('/auth/error', req.url));
}
