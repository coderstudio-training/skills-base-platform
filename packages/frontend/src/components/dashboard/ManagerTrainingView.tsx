// components/dashboard/ManagerTrainingView.tsx
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { managerAPI } from '@/lib/api';
import { MemberRecommendations, TeamMember } from '@/types/manager';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface MemberData extends TeamMember {
  recommendations: MemberRecommendations[];
}

const ManagerTrainingView = () => {
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const members = await managerAPI.getTeamMembers();
        const results = await Promise.all(
          members.map(async member => {
            try {
              const response = await managerAPI.getMemberRecommendations(member.email);
              return {
                ...member,
                recommendations: response.recommendations || [],
              };
            } catch (error) {
              return {
                ...member,
                recommendations: [],
              };
            }
          }),
        );
        setMemberData(results);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Recommendations</CardTitle>
        <CardDescription>Personalized course recommendations based on skill gaps</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-8">
            {memberData.map((data: MemberData) => (
              <div key={data.id} className="space-y-4 pb-6 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
                  </Avatar>
                  {/* <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gray-100">
                    {member.name.split(' ').map((n: any[]) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar> */}
                  <div>
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">{data.role}</p>
                  </div>
                </div>

                {data.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {data.recommendations.map((rec: MemberRecommendations, index: number) => (
                      <Card key={index} className="p-4">
                        <CardTitle className="text-lg mb-2">{rec.course.name}</CardTitle>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Skill:</span> {rec.skillName}
                          </div>
                          <div>
                            <span className="font-semibold">Provider:</span> {rec.course.provider}
                          </div>
                          <div>
                            <span className="font-semibold">Duration:</span> {rec.course.duration}
                          </div>
                          <div>
                            <span className="font-semibold">Format:</span> {rec.course.format}
                          </div>
                          <div>
                            <span className="font-semibold">Prerequisites:</span>{' '}
                            {rec.course.prerequisites}
                          </div>
                          <div>
                            <span className="font-semibold">Current Level:</span>
                            <Progress
                              value={rec.currentLevel * 20}
                              className="w-[60px] inline-block ml-2"
                            />
                            {rec.currentLevel}
                          </div>
                          <div>
                            <span className="font-semibold">Target Level:</span>
                            <Progress
                              value={rec.targetLevel * 20}
                              className="w-[60px] inline-block ml-2"
                            />
                            {rec.targetLevel}
                          </div>
                        </div>

                        {/* {rec.course. && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {rec.course.description}
                        </p>
                      )} */}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="ml-12 text-sm text-muted-foreground">
                    No training recommendations available.
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ManagerTrainingView;
