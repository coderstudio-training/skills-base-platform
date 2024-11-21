import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const searchTerm = searchParams.get('searchTerm') || '';
    const businessUnit = searchParams.get('businessUnit') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(searchTerm && { searchTerm }),
      ...(businessUnit && { businessUnit }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/employees/search?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search employees');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search employees' }, { status: 500 });
  }
}
