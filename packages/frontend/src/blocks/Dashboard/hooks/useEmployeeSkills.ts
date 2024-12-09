import { SkillDetail } from '@/types/admin';
import { useState } from 'react';

export function useEmployeeSkills() {
  const [skills, setSkills] = useState<SkillDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkills = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/skills/employee/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee skills');
      }
      const data = await response.json();

      // Fetch descriptions for each skill using taxonomy find by title
      const skillsWithDescriptions = await Promise.all(
        data.skills.map(async (skill: SkillDetail) => {
          try {
            const taxonomyResponse = await fetch(
              `/api/taxonomy/technical/title/${skill.skill}?businessUnit=QA`,
            );

            if (!taxonomyResponse.ok) {
              console.warn(`No taxonomy found for skill: ${skill.skill}`);
              return {
                ...skill,
                description: 'No description available',
                proficiencyDescription: 'No proficiency description available',
              };
            }

            const taxonomyData = await taxonomyResponse.json();

            // Use Math.floor to get the exact level key
            const levelKey = `Level ${Math.floor(skill.average)}`;
            const proficiencyDescription =
              taxonomyData[0]?.proficiencyDescription?.[levelKey]?.[1] ||
              'No proficiency description available';

            return {
              ...skill,
              description:
                taxonomyData.length > 0 ? taxonomyData[0].description : 'No description available',
              proficiencyDescription,
            };
          } catch (error) {
            console.error(`Error fetching description for ${skill.skill}:`, error);
            return {
              ...skill,
              description: 'No description available',
              proficiencyDescription: 'No proficiency description available',
            };
          }
        }),
      );

      setSkills(skillsWithDescriptions);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred');
      setError(err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSkills = () => {
    setSkills([]);
    setError(null);
  };

  return {
    skills,
    loading,
    error,
    fetchSkills,
    clearSkills,
  };
}
