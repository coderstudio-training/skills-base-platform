import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

const API_BASE_URL = 'http://localhost:3002';

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const email = params.email;

    const response = await fetch(
      `${API_BASE_URL}/api/skills/employee/${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
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
    console.error('Error in skills matrix API route:', error);
    return Response.json({ error: 'Failed to fetch employee skills' }, { status: 500 });
  }
}
