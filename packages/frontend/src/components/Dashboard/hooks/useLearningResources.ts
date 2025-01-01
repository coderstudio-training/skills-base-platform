import { Course } from '@/components/Dashboard/types';
import { learningApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { useEffect, useMemo, useState } from 'react';

export function useLearningResources() {
  const [allResources, setAllResources] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [filteredResources, setFilteredResources] = useState<Course[]>([]);
  const { hasPermission } = useAuth();

  // Fetch resources
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<Course[]>(learningApi, '/api/courses', {
    requiresAuth: true,
    cacheStrategy: 'force-cache',
    enabled: hasPermission('canManageSystem'),
  });

  // Update allResources when data changes
  useEffect(() => {
    if (data) {
      setAllResources(data);
      setFilteredResources(data);
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

  // Apply filters whenever selection changes
  useEffect(() => {
    let result = [...allResources];

    if (selectedCategory !== 'all') {
      result = result.filter(r => r.skillCategory === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      result = result.filter(r => r.requiredLevel.toString() === selectedLevel);
    }

    setFilteredResources(result);
  }, [selectedCategory, selectedLevel, allResources]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  return {
    resources: filteredResources,
    loading,
    error: error?.message || null,
    categories,
    levels,
    selectedCategory,
    selectedLevel,
    setSelectedCategory: handleCategoryChange,
    setSelectedLevel: handleLevelChange,
  };
}
