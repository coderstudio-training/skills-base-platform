// packages/frontend/src/app/api/skills/distributions/route.ts
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/skills/distributions`, // Updated path to match backend
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to fetch distribution data' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distributions route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
