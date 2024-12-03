import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types/manager';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00ced1'];

interface TeamCompositionChartProps {
  teamMembers: TeamMember[];
  loading?: boolean;
}

const TeamCompositionChart = ({ teamMembers, loading = false }: TeamCompositionChartProps) => {
  const compositionData = useMemo(() => {
    // Manually create unique levels and designations
    const levels = Array.from(new Set(teamMembers.map(member => member.jobLevel))).filter(
      level => level && level.trim() !== '',
    );
    const designations = Array.from(new Set(teamMembers.map(member => member.designation))).filter(
      designation => designation && designation.trim() !== '',
    );

    // Create a dynamic data structure
    const composition = designations
      .map(designation => {
        const rowData: Record<string, number | string> = { skill: designation };
        let hasNonZeroValues = false;

        // Dynamically add counts for each job level
        levels.forEach(level => {
          const count = teamMembers.filter(
            member => member.designation === designation && member.jobLevel === level,
          ).length;

          if (count > 0) {
            rowData[level] = count;
            hasNonZeroValues = true;
          }
        });

        return hasNonZeroValues ? rowData : null;
      })
      .filter(Boolean);

    // Filter out levels with no data
    const filteredLevels = levels.filter(level =>
      composition.some(row => row && row[level] !== undefined),
    );

    return { composition, levels: filteredLevels };
  }, [teamMembers]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading team composition...</p>
          </div>
        </div>
      );
    }

    if (teamMembers.length === 0 || compositionData.composition.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          No team data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={compositionData.composition}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" />
          <YAxis />
          <Tooltip />
          <Legend />
          {compositionData.levels.map((level, index) => (
            <Bar
              key={level}
              dataKey={level}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              name={level}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold mb-1">Team Composition</CardTitle>
        <CardDescription>Distribution of roles across experience levels</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default TeamCompositionChart;
