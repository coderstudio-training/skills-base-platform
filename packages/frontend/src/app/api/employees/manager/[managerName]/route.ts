import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, { params }: { params: { managerName: string } }) {
  try {
    const managerName = params.managerName;

    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_BASE_URL}/employees/manager/${encodeURIComponent(managerName)}`,
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
    console.error('Error in employees API route:', error);
    return Response.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
