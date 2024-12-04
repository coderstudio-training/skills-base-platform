// hooks/learning/useLearningResources.ts
import { getLearningResources } from '@/lib/api';
import { Course } from '@/types/admin';
import { useEffect, useMemo, useState } from 'react';

export function useLearningResources() {
  const [allResources, setAllResources] = useState<Course[]>([]); // Store all resources
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLearningResources();
        setAllResources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []); // Only fetch once at component mount

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

  // Filter resources based on selected category and level
  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      const matchesCategory =
        selectedCategory === 'all' || resource.skillCategory === selectedCategory;
      const matchesLevel =
        selectedLevel === 'all' || resource.requiredLevel.toString() === selectedLevel;
      return matchesCategory && matchesLevel;
    });
  }, [allResources, selectedCategory, selectedLevel]);

  return {
    resources: filteredResources,
    loading,
    error,
    categories,
    levels,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
  };
}
