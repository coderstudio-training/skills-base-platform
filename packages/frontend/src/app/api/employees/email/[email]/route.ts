import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const email = params.email;

    const response = await fetch(`${API_BASE_URL}/employees/email/${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in employees API route:', error);
    return Response.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
