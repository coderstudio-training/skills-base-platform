import { useTeamData } from '@/components/Dashboard/hooks/useTeamData';
import {
  MemberRecommendations,
  RecommendationResponse,
  TeamMember,
} from '@/components/Dashboard/types';
import { learningApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { useEffect, useState } from 'react';

export function useTeamRecommendations(managerName: string) {
  const { hasPermission } = useAuth();
  const { teamMembers } = useTeamData(managerName);
  const [teamData, setTeamData] = useState<
    Array<TeamMember & { recommendations?: MemberRecommendations }>
  >([]);

  // Get recommendations for the first team member
  const { data: recommendationsData } = useQuery<RecommendationResponse>(
    learningApi,
    `/api/learning/recommendations/${teamMembers[0]?.email}`,
    {
      enabled:
        teamMembers.length > 0 && !!teamMembers[0]?.email && hasPermission('canViewLearning'),
      requiresAuth: true,
    },
  );

  // Combine team members with their recommendations
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
  };
}
