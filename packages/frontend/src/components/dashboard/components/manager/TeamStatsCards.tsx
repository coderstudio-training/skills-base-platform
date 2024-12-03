import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, TrendingUp, Users } from 'lucide-react';

interface TeamStatsCardProps {
  teamSize: number;
  averagePerformance?: number;
  skillGrowth?: number;
}

export default function TeamStatsCard({
  teamSize,
  averagePerformance = 87,
  skillGrowth = 15,
}: TeamStatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Team Size */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamSize}</div>
        </CardContent>
      </Card>

      {/* Average Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averagePerformance}%</div>
        </CardContent>
      </Card>

      {/* Skill Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skill Growth</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{skillGrowth}%</div>
          <p className="text-xs text-muted-foreground">In the last 6 months</p>
        </CardContent>
      </Card>
    </div>
  );
}
