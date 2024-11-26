// app/api/learning/recommendations/route.ts
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:3003';

export async function GET(request: Request, { params }: { params: { email: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { email } = params;

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/learning/recommendations/${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
