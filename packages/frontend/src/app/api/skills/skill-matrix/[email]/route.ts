import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';

export async function GET(request: Request, { params }: { params: { email: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = params;
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/skills/skill-matrix?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch skill matrix data' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in skill matrix API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
