import { learningRecommendationAPI } from '@/lib/api';
import { getTeamMembers } from '@/lib/users/employees/api';
import { MemberRecommendations, TeamMember } from '@/types/manager';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useTeamRecommendations() {
  const { data: session } = useSession();
  const [teamData, setTeamData] = useState<
    Array<TeamMember & { recommendations?: MemberRecommendations }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!session?.user?.name) {
        setError('No user session found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: teamResponse } = await getTeamMembers(session.user.name);

        if (!teamResponse) {
          throw new Error('Failed to fetch team members');
        }

        const teamMembers = await teamResponse;

        const membersWithRecommendations = await Promise.all(
          teamMembers.map(async (member: TeamMember) => {
            try {
              const recommendations = await learningRecommendationAPI(member.email || '');
              return {
                ...member,
                recommendations,
              };
            } catch (err) {
              console.error(`Error fetching recommendations for ${member.email}:`, err);
              return member;
            }
          }),
        );

        setTeamData(membersWithRecommendations);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setTeamData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [session?.user?.name]);

  return {
    teamData,
    loading,
    error,
  };
}
