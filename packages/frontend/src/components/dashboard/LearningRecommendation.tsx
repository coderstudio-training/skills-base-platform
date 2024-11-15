'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { learningRecommendationAPI } from '@/lib/api';
import React, { useEffect, useState } from 'react';

// Add all necessary interfaces at the top
interface CourseDetails {
  name: string;
  provider: string;
  duration: string;
  format: string;
  learningPath: string;
  learningObjectives: string[];
  prerequisites: string;
  businessValue: string;
}

interface Recommendation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  type: 'skillGap' | 'promotion';
  course: CourseDetails;
}

// interface RecommendationResponse {
//   success: boolean;
//   employeeName: string;
//   careerLevel: string;
//   recommendations: Recommendation[];
//   generatedDate: Date;
//   message?: string;
// }

const LearningRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const testEmail = 'kathlynelmajoy.alcoseba@stratpoint.com';

  // const fetchData = async () => {
  //   try{
  //     setLoading(true);
  //     setError(null);
  //     const response = await learningRecommendationAPI.getLearningPaths(testEmail);
  //     setRecommendations(response)
  //   } catch (err){
  //     console.error('Error fetching skill gaps:', err);
  //     setError(err instanceof Error ? err.message : 'Failed to fetch Data');
  //   } finally{
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching recommendations...');
      const response = await learningRecommendationAPI.getLearningPaths(testEmail);
      console.log('Received response:', response);

      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchRecommendations = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch('/api/learning/recommendation');
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch recommendations');
  //       }
  //       const data = await response.json();

  //       if (data.success && data.recommendations) {
  //         const transformedRecommendations = data.recommendations.map((rec: { skillName: any; currentLevel: any; targetLevel: any; gap: number; course: { name: any; provider: any; duration: any; format: any; learningObjectives: string; prerequisites: any; businessValue: any; }; }) => ({
  //           skill: rec.skillName,
  //           currentLevel: rec.currentLevel,
  //           requiredLevel: rec.targetLevel,
  //           gap: rec.gap,
  //           priority: rec.gap >= 2 ? "Critical" : rec.gap >= 1 ? "High" : "Medium",
  //           course: {
  //             name: rec.course.name,
  //             provider: rec.course.provider,
  //             duration: rec.course.duration,
  //             format: rec.course.format,
  //             certification: 'N/A',
  //             objectives: Array.isArray(rec.course.learningObjectives)
  //               ? rec.course.learningObjectives
  //               : rec.course.learningObjectives.split(','),
  //             prerequisites: rec.course.prerequisites,
  //             businessValue: rec.course.businessValue,
  //             targetLevel: rec.targetLevel
  //           }
  //         }));

  //         setRecommendations(transformedRecommendations);
  //       }
  //     } catch (err) {
  //       console.error('Fetch error:', err);
  //       setError(err instanceof Error ? err.message : 'Failed to load recommendations');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRecommendations();
  // }, []);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Growth Plan</CardTitle>
          <p className="text-sm text-gray-500">Skill gaps and recommended training courses</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading recommendations...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Skill</th>
                  <th className="text-left py-2">Current Level</th>
                  <th className="text-left py-2">Required Level</th>
                  <th className="text-left py-2">Gap</th>
                  <th className="text-left py-2">Recommended Training Course</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((reco, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4">{reco.skillName}</td>
                    <td className="py-4">{reco.currentLevel}</td>
                    <td className="py-4">{reco.targetLevel}</td>
                    <td className="py-4">{reco.gap}</td>
                    <td className="py-4">
                      <button
                        onClick={() => {
                          // setSelectedCourse(reco);
                          // setIsDialogOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        {reco.course.name}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <div className="flex justify-between items-start">
            <DialogHeader>
              <DialogTitle>{selectedCourse?.course.name}</DialogTitle>
              <p className="text-sm text-gray-500">
                Training details and learning objectives
              </p>
            </DialogHeader>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedCourse && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{selectedCourse.skill}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Level:</p>
                  <p>{selectedCourse.currentLevel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Target Level:</p>
                  <p>{selectedCourse.requiredLevel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Provider:</p>
                  <p>{selectedCourse.course.provider}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration:</p>
                  <p>{selectedCourse.course.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500">Format:</p>
                  <p>{selectedCourse.course.format}</p>
                </div>
                <div>
                  <p className="text-gray-500">Certification:</p>
                  <p>{selectedCourse.course.certification}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Learning Path:</h4>
                <p className="text-sm text-gray-600">
                  This course will help you progress from level {selectedCourse.currentLevel} to level {selectedCourse.requiredLevel}, 
                  which is appropriate for your career level.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Learning Objectives:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedCourse.course.objectives.map((objective, i) => (
                    <li key={i}>{objective.trim()}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Prerequisites:</h4>
                  <p className="text-sm">{selectedCourse.course.prerequisites}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Business Value:</h4>
                  <p className="text-sm">{selectedCourse.course.businessValue}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default LearningRecommendations;
