// packages/frontend/src/app/api/skills/skill-matrix/route.ts
import { authOptions } from '@/lib/auth';
import { SkillsResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';

interface BackendSkillResponse {
  employeeInfo: {
    email: string;
    name: string;
    careerLevel: string;
    capability: string;
    managerEmail?: string;
  };
  skills: {
    skill: string;
    category: string;
    selfRating: number;
    managerRating: number;
    requiredRating: number;
    gap: number;
    average: number;
  }[];
}

function transformToStaffResponse(data: BackendSkillResponse): SkillsResponse {
  return {
    skills: data.skills.map(skill => ({
      skill: skill.skill,
      category: skill.category,
      selfRating: skill.selfRating,
      managerRating: skill.managerRating,
      requiredRating: skill.requiredRating,
      gap: skill.gap,
      average: skill.average,
    })),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/skills/skills-matrix`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Failed to fetch skill matrix data' },
        { status: response.status },
      );
    }

    const data: BackendSkillResponse[] = await response.json();
    const { role, email } = session.user;

    // For staff role or default case
    if (role !== 'admin' && role !== 'manager') {
      const staffData = data.find(employee => employee.employeeInfo.email === email);

      if (!staffData) {
        return NextResponse.json({ error: 'Staff data not found' }, { status: 404 });
      }

      return NextResponse.json(transformToStaffResponse(staffData));
    }

    // For manager role
    if (role === 'manager') {
      const teamData = data.filter(employee => employee.employeeInfo.managerEmail === email);
      return NextResponse.json(
        teamData.map(employeeData => transformToStaffResponse(employeeData)),
      );
    }

    // For admin role
    return NextResponse.json(data.map(employeeData => transformToStaffResponse(employeeData)));
  } catch (error) {
    console.error('Error in skill matrix API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
