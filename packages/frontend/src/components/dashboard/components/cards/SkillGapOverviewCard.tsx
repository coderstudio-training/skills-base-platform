import { useSkillGaps } from '@/components/dashboard/hooks/useSkillGaps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

export function SkillGapOverview() {
  const { skillGaps, loading } = useSkillGaps();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold leading-none tracking-tight">
          Skill Gap Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading skill gaps...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {skillGaps.map(skill => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{skill.name}</span>
                  <span>{skill.gap.toFixed(1)}</span>
                </div>
                <Progress
                  value={(skill.currentLevel / skill.requiredLevel) * 100}
                  className="h-2"
                />
              </div>
            ))}
            {skillGaps.length === 0 && (
              <div className="text-center text-gray-500 py-4">No skill gaps identified</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
