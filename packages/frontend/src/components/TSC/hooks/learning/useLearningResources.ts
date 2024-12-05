import { learningApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { Course } from '@/types/admin';
import { useEffect, useMemo, useState } from 'react';

export function useLearningResources() {
  const [allResources, setAllResources] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Prepare query parameters
  const queryParams = new URLSearchParams();
  if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
  if (selectedLevel !== 'all') queryParams.append('level', selectedLevel);

  // Use useQuery for fetching resources
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<Course[]>(
    learningApi,
    `/api/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    {
      requiresAuth: true,
      revalidate: 300,
    },
  );

  // Update allResources when data changes
  useEffect(() => {
    if (data) {
      setAllResources(data);
    }
  }, [data]);

  // Get unique categories from all resources
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allResources.map(r => r.skillCategory))).sort();
    return ['all', ...uniqueCategories];
  }, [allResources]);

  // Get possible levels from all resources
  const levels = useMemo(() => {
    const uniqueLevels = Array.from(new Set(allResources.map(r => r.requiredLevel)))
      .sort((a, b) => a - b)
      .map(level => level.toString());
    return ['all', ...uniqueLevels];
  }, [allResources]);

  return {
    resources: allResources,
    loading,
    error: error?.message || null,
    categories,
    levels,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
  };
}
