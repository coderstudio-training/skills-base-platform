'use client';

import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { useRecommendations } from '@/components/Dashboard/hooks/useRecommendation';
import { TabViewProps } from '@/components/Dashboard/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { X } from 'lucide-react';

function GrowthPlan(user: TabViewProps) {
  const {
    recommendations,
    loading,
    error,
    selectedCourse,
    isDialogOpen,
    setIsDialogOpen,
    handleCourseClick,
  } = useRecommendations(user.email || '');

  return (
    <>
      <BaseCard
        title="Growth Plan"
        description="Skill gaps and recommended training courses"
        loading={loading}
      >
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[600px]">
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
                        <span
                          className={`px-3 py-1 rounded-md ${
                            rec.gap < 0
                              ? 'bg-red-500 text-white'
                              : rec.gap === 0
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-400 text-white'
                          }`}
                        >
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
          </ScrollArea>
        )}
      </BaseCard>

      {isDialogOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl p-6 relative">
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
}

export default GrowthPlan;
