// packages/frontend/src/app/api/skill-matrix/analytics/route.ts
import { authOptions } from '@/lib/auth';
import { SkillGapData, TopSkillData } from '@/types/admin';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';

interface BackendResponse {
  topSkills: {
    name: string;
    prevalence: number;
  }[];
  skillGaps: {
    name: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
  }[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await fetch(`${API_BASE_URL}/api/skills/analytics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to fetch analytics data' },
        { status: response.status },
      );
    }

    const data: BackendResponse = await response.json();

    // Transform and round the data for frontend display
    const transformedData = {
      topSkills: data.topSkills.map(
        (skill): TopSkillData => ({
          name: skill.name,
          prevalence: Math.round(skill.prevalence), // Round to nearest integer for cleaner display
        }),
      ),
      skillGaps: data.skillGaps.map(
        (skill): SkillGapData => ({
          name: skill.name,
          currentLevel: Number(skill.currentLevel.toFixed(1)), // Round to 1 decimal place
          requiredLevel: Number(skill.requiredLevel.toFixed(1)),
          gap: Number(skill.gap.toFixed(1)),
        }),
      ),
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in skill matrix analytics route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
