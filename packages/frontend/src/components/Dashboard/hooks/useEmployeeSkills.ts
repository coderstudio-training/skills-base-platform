import { Skill, SkillDetail, StaffSkills, TaxonomyResponse } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { useEffect, useState } from 'react';

export function useEmployeeSkills() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [processedSkills, setProcessedSkills] = useState<SkillDetail[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { hasPermission } = useAuth();

  // Query for employee skills
  const {
    data: skillsData,
    error: skillsError,
    isLoading: skillsLoading,
  } = useQuery<StaffSkills>(
    skillsApi,
    selectedEmail ? `skills-matrix/user/?email=${selectedEmail}` : '',
    {
      cacheStrategy: 'force-cache',
      requiresAuth: true,
      enabled: hasPermission('canViewSkills'),
    },
  );

  // Process skills and fetch taxonomy data
  useEffect(() => {
    const fetchTaxonomyData = async () => {
      if (!skillsData?.skills) return;

      setIsProcessing(true);
      setError(null);

      try {
        const skillsWithDescriptions = await Promise.all(
          skillsData.skills.map(async (skill: Skill) => {
            try {
              // Using useQuery's underlying client for consistency
              const taxonomyResponse = await skillsApi.get<TaxonomyResponse>(
                `/taxonomy/technical/title/${skill.name}?businessUnit=QA`,
                { requiresAuth: true, cache: 'force-cache' },
              );

              if (!taxonomyResponse.data?.[0]) {
                console.warn(`No taxonomy found for skill: ${skill.name}`);
                return {
                  skill: skill.name,
                  category: skill.category,
                  selfRating: skill.selfRating,
                  managerRating: skill.managerRating,
                  requiredRating: skill.required,
                  gap: skill.gap,
                  average: skill.average,
                  description: 'No description available',
                  proficiencyDescription: 'No proficiency description available',
                } as SkillDetail;
              }

              const taxonomyData = taxonomyResponse.data;

              // Use Math.floor to get the exact level key
              const levelKey = `Level ${Math.floor(skill.average)}`;
              const proficiencyDescription =
                taxonomyData[0]?.proficiencyDescription?.[levelKey]?.[1] ||
                'No proficiency description available';

              return {
                skill: skill.name,
                category: skill.category,
                selfRating: skill.selfRating,
                managerRating: skill.managerRating,
                requiredRating: skill.required,
                gap: skill.gap,
                average: skill.average,
                description: taxonomyData[0]?.description || 'No description available',
                proficiencyDescription,
              } as SkillDetail;
            } catch (error) {
              console.error(`Error fetching description for ${skill.name}:`, error);
              return {
                skill: skill.name,
                category: skill.category,
                selfRating: skill.selfRating,
                managerRating: skill.managerRating,
                requiredRating: skill.required,
                gap: skill.gap,
                average: skill.average,
                description: 'No description available',
                proficiencyDescription: 'No proficiency description available',
              } as SkillDetail;
            }
          }),
        );

        setProcessedSkills(skillsWithDescriptions);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred');
        setError(err);
        setProcessedSkills([]);
      } finally {
        setIsProcessing(false);
      }
    };

    if (skillsData?.skills) {
      fetchTaxonomyData();
    }
  }, [skillsData]);

  const fetchSkills = async (email: string) => {
    setSelectedEmail(email);
  };

  const clearSkills = () => {
    setSelectedEmail(null);
    setProcessedSkills([]);
    setError(null);
  };

  return {
    skills: processedSkills,
    loading: skillsLoading || isProcessing,
    error: error || skillsError,
    fetchSkills,
    clearSkills,
  };
}
