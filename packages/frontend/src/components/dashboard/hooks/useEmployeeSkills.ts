import { SkillDetail } from '@/components/dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useState } from 'react';

interface SkillsResponse {
  skills: SkillDetail[];
}

export function useEmployeeSkills(employeeEmail: string) {
  const [isLoading, setIsLoading] = useState(false);

  const { data, error, refetch } = useQuery<SkillsResponse>(
    skillsApi,
    `/api/skills/employee/${employeeEmail}`,
    {
      enabled: false,
      revalidate: 3600,
    },
  );

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    skills: data?.skills || [],
    loading: isLoading,
    error,
    fetchSkills,
  };
}
