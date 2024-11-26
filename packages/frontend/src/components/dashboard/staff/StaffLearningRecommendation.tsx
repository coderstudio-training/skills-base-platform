'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { learningRecommendationAPI } from '@/lib/api';
import { Recommendation } from '@/types/staff';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const StaffLearningRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Recommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchRecommendations() {
      if (status === 'loading') return;

      if (!session?.user?.email) {
        setError('No user session found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await learningRecommendationAPI(session.user.email);
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
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

  const getGapStyle = (gap: number) => {
    if (gap < 0) return 'bg-red-500 text-white-10000';
    return 'bg-blue-400 text-white-800';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Growth Plan</CardTitle>
          <CardDescription>Skill gaps and recommended training courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Skill</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Current Level
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Required Level
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Gap</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Recommended Training Course
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="p-4 text-sm font-medium">{rec.skillName}</td>
                      <td className="p-4 text-sm">{rec.currentLevel}</td>
                      <td className="p-4 text-sm">{rec.targetLevel}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-3 py-1 rounded-md ${getGapStyle(rec.gap)}`}>
                          {rec.gap}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={() => handleCourseClick(rec)}
                          className="text-sm font-medium text-emerald-500 hover:text-emerald-600"
                        >
                          {rec.course?.name || `${rec.skillName} Fundamentals`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No recommendations available</div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mt-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCourse.course?.name}</h2>
                  <p className="text-sm text-gray-500">Training details and learning objectives</p>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{selectedCourse.skillName}</h3>
                  <span className="px-2 py-1 rounded bg-orange-100 text-orange-800">
                    Gap: {selectedCourse.gap}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-2">
                      <span className="text-gray-500">Current Level:</span>{' '}
                      {selectedCourse.currentLevel}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-500">Provider:</span>{' '}
                      {selectedCourse.course?.provider}
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span> {selectedCourse.course?.format}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="text-gray-500">Target Level:</span>{' '}
                      {selectedCourse.targetLevel}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-500">Duration:</span>{' '}
                      {selectedCourse.course?.duration}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Path:</h4>
                  <div className="text-sm text-gray-600">
                    This course will help you progress from level {selectedCourse.currentLevel} to
                    level {selectedCourse.targetLevel}, which is appropriate for your career level.
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Objectives:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedCourse.course?.learningObjectives?.map((objective, i) => (
                      <li key={i}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Prerequisites:</h4>
                    <p>{selectedCourse.course?.prerequisites}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Business Value:</h4>
                    <p>{selectedCourse.course?.businessValue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffLearningRecommendations;
