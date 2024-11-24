import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types/manager';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const cleanDesignation = (designation: string) => {
  return designation === 'Software QA Engineer' ? 'QA Engineer' : designation;
};

interface TeamCompositionChartProps {
  teamMembers: TeamMember[];
  loading?: boolean;
}

const TeamCompositionChart = ({ teamMembers, loading = false }: TeamCompositionChartProps) => {
  const compositionData = useMemo(() => {
    const composition = teamMembers.reduce(
      (acc, member) => {
        const cleanedDesignation = cleanDesignation(member.designation);
        const role = `${member.jobLevel} ${cleanedDesignation}`;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(composition).map(([name, value]) => ({
      name,
      value,
    }));
  }, [teamMembers]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading team composition...</p>
          </div>
        </div>
      );
    }

    if (teamMembers.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No team data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={compositionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {compositionData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold mb-1">Team Composition</CardTitle>
        <CardDescription>Distribution of roles in your team</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default TeamCompositionChart;
