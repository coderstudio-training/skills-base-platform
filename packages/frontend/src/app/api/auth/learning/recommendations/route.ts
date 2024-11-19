import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

const API_BASE_URL = 'http://localhost:3003';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Server session:', session);

    if (!session?.user?.accessToken) {
      console.error('No access token in session');
      return new Response('Unauthorized - No token', { status: 401 });
    }

    const email = session.user.email;
    if (!email) {
      console.error('No email in session');
      return new Response('Unauthorized - No email', { status: 401 });
    }

    console.log('Making backend request for email:', email);
    const response = await fetch(
      `${API_BASE_URL}/api/learning/recommendations/${encodeURIComponent(email)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
