import { learningApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useState } from 'react';
import { Recommendation } from '../types';

export function useRecommendations(email: string) {
  const [selectedCourse, setSelectedCourse] = useState<Recommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: recommendationData,
    error,
    isLoading,
  } = useQuery<{ recommendations: Recommendation[] }>(
    learningApi,
    `/api/learning/recommendations/${email}`,
    {
      cacheStrategy: 'force-cache',
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
