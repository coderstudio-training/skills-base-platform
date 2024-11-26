import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/utils';
import { Employee } from '@/types/admin';
import { BackendSkillResponse, SkillsResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const SKILLS_API_URL = process.env.NEXT_PUBLIC_SKILLS_SERVICE_URL || 'http://localhost:3002';
const EMPLOYEES_API_URL = process.env.NEXT_PUBLIC_EMPLOYEES_SERVICE_URL || 'http://localhost:3001';

function transformToStaffResponse(data: BackendSkillResponse): SkillsResponse {
  const skills = data.skills;
  const technicalSkills = skills.filter(skill => skill.category === 'Technical Skills');
  const softSkills = skills.filter(skill => skill.category === 'Soft Skills');

  const technicalAverage =
    technicalSkills.length > 0
      ? Number(
          (
            technicalSkills.reduce((sum, skill) => sum + skill.average, 0) / technicalSkills.length
          ).toFixed(2),
        )
      : 0;

  const softAverage =
    softSkills.length > 0
      ? Number(
          (softSkills.reduce((sum, skill) => sum + skill.average, 0) / softSkills.length).toFixed(
            2,
          ),
        )
      : 0;

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
    metrics: {
      technicalSkillsAverage: technicalAverage,
      softSkillsAverage: softAverage,
      skillsAssessed: skills.length,
    },
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.log(`Fetching skills data for user role: ${session.user.role}`);

    const skillsResponse = await fetch(`${SKILLS_API_URL}/api/skills/skills-matrix`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!skillsResponse.ok) {
      const error = await skillsResponse.json();
      logger.error('Failed to fetch skills data', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch skill matrix data' },
        { status: skillsResponse.status },
      );
    }

    const skillsData: BackendSkillResponse[] = await skillsResponse.json();
    const { role, email, name } = session.user;

    // For staff role
    if (role !== 'admin' && role !== 'manager') {
      logger.log(`Fetching staff data for email: ${email}`);
      const staffData = skillsData.find(employee => employee.employeeInfo.email === email);
      if (!staffData) {
        logger.warn(`Staff data not found for email: ${email}`);
        return NextResponse.json({ error: 'Staff data not found' }, { status: 404 });
      }
      const response = transformToStaffResponse(staffData);
      return NextResponse.json(response);
    }

    // For manager role, fetch team members first
    if (role === 'manager') {
      try {
        logger.log(`Fetching team data for manager: ${name}`);

        const teamResponse = await fetch(
          `${EMPLOYEES_API_URL}/employees/manager/${encodeURIComponent(name)}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          },
        );

        if (!teamResponse.ok) {
          logger.error(`Failed to fetch team data for manager: ${name}`);
          throw new Error('Failed to fetch team data');
        }

        const teamMembers: Employee[] = await teamResponse.json();
        logger.debug(
          'Team members fetched:',
          JSON.stringify(
            {
              managerName: name,
              teamSize: teamMembers.length,
              teamMembers: teamMembers.map(m => ({
                email: m.email,
                name: `${m.firstName} ${m.lastName}`,
              })),
            },
            null,
            2,
          ),
        );

        // Get team member emails
        const teamEmails = new Set(teamMembers.map(member => member.email.toLowerCase()));

        // Filter skills data to only include team members
        const teamData = skillsData.filter(employee =>
          teamEmails.has(employee.employeeInfo.email.toLowerCase()),
        );

        logger.log(`Found skills data for ${teamData.length} team members`);
        return NextResponse.json(teamData);
      } catch (error) {
        logger.error('Error in manager route:', {
          managerName: name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
      }
    }

    // For admin role
    logger.log('Returning all skills data for admin role');
    return NextResponse.json(skillsData);
  } catch (error) {
    logger.error('Error in skill matrix route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
