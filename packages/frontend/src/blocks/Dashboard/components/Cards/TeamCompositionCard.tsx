// blocks/Manager/components/Charts/TeamCompositionCard.tsx
import { TeamMember } from '@/types/manager';
import { useMemo } from 'react';
import { BaseBarChart, ChartSeries } from '../Charts/BaseBarChart';

interface TeamCompositionCardProps {
  teamMembers: TeamMember[];
  loading?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00ced1'];

export function TeamCompositionCard({ teamMembers, loading = false }: TeamCompositionCardProps) {
  const { chartData, chartSeries } = useMemo(() => {
    // Get unique levels and designations
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
      .filter((item): item is Record<string, number | string> => item !== null);

    // Filter out levels with no data
    const filteredLevels = levels.filter(level =>
      composition.some(row => row[level] !== undefined),
    );

    // Create series configuration
    const series: ChartSeries[] = filteredLevels.map((level, index) => ({
      key: level,
      name: level,
      color: COLORS[index % COLORS.length],
    }));

    return {
      chartData: composition,
      chartSeries: series,
    };
  }, [teamMembers]);

  return (
    <BaseBarChart
      data={chartData}
      title="Team Composition"
      description="Distribution of roles across experience levels"
      loading={loading}
      xAxisKey="skill"
      series={chartSeries}
      height={400}
      stacked={true}
      loadingMessage="Loading team composition..."
      noDataMessage="No team data available"
    />
  );
}
