import { learningApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { getTeamMembers } from '@/lib/users/employees/api';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MemberRecommendations, RecommendationResponse, TeamMember } from '../types';

export function useTeamRecommendations() {
  const { data: session } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamData, setTeamData] = useState<
    Array<TeamMember & { recommendations?: MemberRecommendations }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members the old way since it works
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!session?.user?.name) {
        setError('No user session found');
        setLoading(false);
        return;
      }

      try {
        const { data: teamResponse } = await getTeamMembers(session.user.name);
        if (!teamResponse) {
          throw new Error('Failed to fetch team members');
        }
        setTeamMembers(teamResponse);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [session?.user?.name]);

  // Use useQuery for recommendations once we have team members
  const { data: recommendationsData, isLoading: recommendationsLoading } =
    useQuery<RecommendationResponse>(
      learningApi,
      `/api/learning/recommendations/${teamMembers[0]?.email}`,
      {
        enabled: teamMembers.length > 0 && !!teamMembers[0]?.email,
        requiresAuth: true,
        revalidate: 300,
      },
    );

  // Combine data when either changes
  useEffect(() => {
    if (teamMembers.length > 0 && recommendationsData) {
      setTeamData(
        teamMembers.map(member => ({
          ...member,
          recommendations: recommendationsData,
        })),
      );
    }
  }, [teamMembers, recommendationsData]);

  return {
    teamData,
    loading: loading || recommendationsLoading,
    error,
  };
}
