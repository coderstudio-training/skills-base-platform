import BaseCard from '@/blocks/Dashboard/components/Cards/BaseCard';
import { TeamCompositionBarChart } from '@/blocks/Dashboard/components/Charts/TeamCompositionBarChart';
import { COLORS } from '@/blocks/Dashboard/constants';
import { ChartSeries, TeamCompositionCardProps } from '@/blocks/Dashboard/types';
import { useMemo } from 'react';

export function TeamCompositionCard({ teamMembers, loading = false }: TeamCompositionCardProps) {
  const { chartData, chartSeries } = useMemo(() => {
    const levels = Array.from(new Set(teamMembers.map(member => member.jobLevel))).filter(
      level => level && level.trim() !== '',
    );
    const designations = Array.from(new Set(teamMembers.map(member => member.designation))).filter(
      designation => designation && designation.trim() !== '',
    );

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

    const filteredLevels = levels.filter(level =>
      composition.some(row => row[level] !== undefined),
    );

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
    <BaseCard
      title="Team Composition"
      description="Distribution of roles across experience levels"
      loading={loading}
      loadingMessage="Loading team composition..."
    >
      <TeamCompositionBarChart
        data={chartData}
        loading={loading}
        xAxisKey="skill"
        series={chartSeries}
        height={400}
        stacked={true}
        loadingMessage="Loading team composition..."
        noDataMessage="No team data available"
      />
    </BaseCard>
  );
}
