import { SkillDetail } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useState } from 'react';

interface SkillResponse {
  skills: SkillDetail[];
}

interface TaxonomyResponse {
  description?: string;
  proficiencyDescription?: {
    [key: string]: string[];
  };
}

export function useEmployeeSkills() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Query for employee skills
  const {
    data: skillsData,
    error: skillsError,
    isLoading: skillsLoading,
  } = useQuery<SkillResponse>(
    skillsApi,
    selectedEmail ? `skills-matrix/user/?email=${selectedEmail}` : '',
    {
      enabled: !!selectedEmail,
      requiresAuth: true,
    },
  );

  // Query for taxonomy data if we have skills
  const {
    data: taxonomyData,
    error: taxonomyError,
    isLoading: taxonomyLoading,
  } = useQuery<TaxonomyResponse[]>(
    skillsApi,
    skillsData?.skills?.length
      ? `/taxonomy/technical/title/${encodeURIComponent(skillsData.skills[0]?.skill)}?businessUnit=QA`
      : '',
    {
      enabled: !!skillsData?.skills?.length,
      requiresAuth: true,
    },
  );

  // Process and combine the data
  const processedSkills =
    skillsData?.skills.map(skill => {
      const levelKey = `Level ${Math.floor(skill.average)}`;
      return {
        ...skill,
        description: taxonomyData?.[0]?.description || 'No description available',
        proficiencyDescription:
          taxonomyData?.[0]?.proficiencyDescription?.[levelKey]?.[1] ||
          'No proficiency description available',
      };
    }) || [];

  const fetchSkills = async (email: string) => {
    setSelectedEmail(email);
  };

  const clearSkills = () => {
    setSelectedEmail(null);
  };

  return {
    skills: processedSkills,
    loading: skillsLoading || taxonomyLoading,
    error: skillsError || taxonomyError,
    fetchSkills,
    clearSkills,
  };
}
