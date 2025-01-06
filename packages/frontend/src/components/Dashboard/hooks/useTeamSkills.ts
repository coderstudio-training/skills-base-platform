import { useTeamData } from '@/components/Dashboard/hooks/useTeamData';
import { TeamData } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';

export default function useTeamSkills(name: string) {
  const { hasPermission } = useAuth();
  const { teamMembers } = useTeamData(name);

  const {
    data: teamSkills,
    error: teamSkillsError,
    isLoading: teamSkillsLoading,
  } = useQuery<TeamData>(
    skillsApi,
    name ? `skills-matrix/manager/${encodeURIComponent(name)}` : '',
    {
      requiresAuth: true,
      enabled: hasPermission('canViewSkills') && teamMembers.length > 0,
      cacheStrategy: 'force-cache',
    },
  );

  // Create a map of email to picture from teamMembers
  const pictureMap = new Map(teamMembers.map(member => [member.email, member.picture]));

  // Merge pictures into teamSkills data if available
  const mergedTeamData = teamSkills
    ? {
        members: teamSkills.members.map(member => ({
          ...member,
          picture: pictureMap.get(member.email),
        })),
      }
    : { members: [] };

  if (!teamMembers.length) {
    return {
      teamSkills: { members: [] },
      error: null,
      loading: false,
    };
  }

  return {
    teamSkills: mergedTeamData,
    error: teamSkillsError,
    loading: teamSkillsLoading,
  };
}
