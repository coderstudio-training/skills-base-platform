import { getUserPicture } from '@/lib/user/api';
import { formatError } from '@/lib/utils';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = params.email;
    const { data, error } = await getUserPicture(email);

    if (error) {
      throw new Error(`${formatError(error)}`);
    }

    return data;
  } catch (error) {
    console.error('Error in employees API route', error);
    return Response.json({ error: `Failed to fetch team members' picture` }, { status: 500 });
  }
}
