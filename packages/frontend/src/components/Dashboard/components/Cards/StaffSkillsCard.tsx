import { SkillStatus, TeamData } from '@/components/Dashboard/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiError } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import BaseCard from './BaseCard';

interface StaffSkillsCardProps {
  skillsData: TeamData | null;
  loading?: boolean;
  error?: ApiError | null;
}

export default function StaffSkillsCard({ skillsData, loading, error }: StaffSkillsCardProps) {
  return (
    <BaseCard
      title="Team Skills Breakdown"
      loading={loading}
      error={error}
      description="Detailed view of individual skills"
    >
      <ScrollArea className="h-[500px] w-full">
        <div className="space-y-6 pr-4">
          {skillsData?.members.map(member => (
            <div
              key={member.email}
              className="space-y-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="uppercase bg-secondary text-secondary-foreground">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {member.careerLevel} - {member.capability}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={cn(
                          skill.status === SkillStatus.PROFICIENT
                            ? 'text-white rounded-md bg-green-500 hover:bg-green-600'
                            : 'text-white rounded-md bg-red-500 hover:bg-red-600',
                        )}
                      >
                        {skill.name}: {skill.average.toFixed(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </BaseCard>
  );
}
