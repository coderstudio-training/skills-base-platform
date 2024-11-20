import { getTeamMembers } from '@/lib/user/employees/api';
import { formatError } from '@/lib/utils';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { managerName: string } }) {
  try {
    const managerName = params.managerName;
    const { data, error } = await getTeamMembers(managerName);

    if (error) {
      throw new Error(`${formatError(error)}`);
    }

    return data;
  } catch (error) {
    console.error('Error in employees API route', error);
    return Response.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
