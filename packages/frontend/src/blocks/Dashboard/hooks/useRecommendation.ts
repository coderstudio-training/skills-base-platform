import { learningApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { Recommendation } from '@/types/staff';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export function useRecommendations() {
  const { data: session } = useSession();
  const [selectedCourse, setSelectedCourse] = useState<Recommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: recommendationData,
    error,
    isLoading,
  } = useQuery<{ recommendations: Recommendation[] }>(
    learningApi,
    `/api/learning/recommendations/${session?.user?.email}`,
    {
      enabled: !!session?.user?.email,
      revalidate: 300, // Cache for 5 minutes
      requiresAuth: true,
    },
  );

  const handleCourseClick = (course: Recommendation) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  return {
    recommendations: recommendationData?.recommendations || [],
    loading: isLoading,
    error,
    selectedCourse,
    setSelectedCourse,
    isDialogOpen,
    setIsDialogOpen,
    handleCourseClick,
  };
}
