// packages/frontend/src/app/api/skills/gaps/route.ts

import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return Response.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_BASE_URL}/api/skills/gaps/?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: authHeader || '',
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in skill gaps API route:', error);
    return Response.json({ error: 'Failed to fetch skill gaps data' }, { status: 500 });
  }
}
