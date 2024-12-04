import { learningRecommendationAPI } from '@/lib/api';
import { Recommendation } from '@/types/staff';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useRecommendations() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Recommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!session?.user?.email) {
        setError('No user session found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); //Reset error state
        const data = await learningRecommendationAPI(session.user.email);
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
        setRecommendations([]); // Reset recommendations on error
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [session?.user?.email]);

  const handleCourseClick = (course: Recommendation) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  return {
    recommendations,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    isDialogOpen,
    setIsDialogOpen,
    handleCourseClick,
  };
}
