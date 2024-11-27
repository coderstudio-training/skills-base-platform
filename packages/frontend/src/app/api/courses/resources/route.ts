// src/app/api/courses/resources/route.ts
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:3003';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    // Get category from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const url = `${API_BASE_URL}/api/courses/resources${category ? `?category=${category}` : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
