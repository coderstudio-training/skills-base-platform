// src/app/api/courses/route.ts
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

    // Get or Extract filter parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    // Construct API URL including the filters
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (level) queryParams.append('level', level);

    const url = `${API_BASE_URL}/api/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
