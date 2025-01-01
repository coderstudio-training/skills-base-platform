// src/blocks/Dashboard/components/Manager/Training.tsx
import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { useTeamRecommendations } from '@/components/Dashboard/hooks/useTeamRecommendations';
import { TabViewProps } from '@/components/Dashboard/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

function Training(user: TabViewProps) {
  const { teamData } = useTeamRecommendations(user.name || '');

  return (
    <BaseCard
      title="Training Recommendations"
      description="Personalized course recommendations based on skill gaps"
    >
      <ScrollArea className="h-[566px]">
        <div className="space-y-8">
          {teamData.map(member => (
            <div key={member.employeeId} className="space-y-4 pb-6 border-b last:border-b-0">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {member.picture ? (
                    <AvatarImage
                      src={member.picture}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  ) : (
                    <AvatarFallback>{`${member.firstName[0]}${member.lastName[0]}`}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{`${member.firstName} ${member.lastName}`}</p>
                  <p className="text-sm text-muted-foreground">{member.designation}</p>
                </div>
              </div>

              {member.recommendations?.recommendations?.length ? (
                <div className="space-y-4">
                  {member.recommendations.recommendations.map((rec, index) => (
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
                          <span className="font-semibold">Training Focus:</span>{' '}
                          {rec.type === 'skillGap' ? 'Required Skills' : 'For Promotion'}
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
    </BaseCard>
  );
}

export default Training;
