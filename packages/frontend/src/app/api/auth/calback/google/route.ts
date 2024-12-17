import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Redirect users to the corresponding dashboard based on their role.
 *
 * @param req - The NextRequest object.
 * @returns A redirect response to the corresponding dashboard.
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
