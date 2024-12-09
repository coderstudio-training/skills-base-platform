// blocks/Manager/components/ManagerOverview.tsx
import { TeamCompositionCard } from '@/blocks/Dashboard/components/Cards/TeamCompositionCard';
import { TeamMembersListCard } from '@/blocks/Dashboard/components/Cards/TeamMembersListCard';
import { TeamMetricCards } from '@/blocks/Dashboard/components/Cards/TeamMetricCards';
import { ManagerOverviewProps } from '@/blocks/Dashboard/types';

export function ManagerOverview({ teamMembers, loading, error }: ManagerOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Team Stats */}
      <TeamMetricCards
        teamSize={teamMembers.length}
        averagePerformance={97}
        skillGrowth={35}
        loading={loading}
        error={error}
      />

      {/* Team Charts and Lists */}
      <div className="grid gap-4 md:grid-cols-2">
        <TeamCompositionCard teamMembers={teamMembers} loading={loading} />

        <TeamMembersListCard members={teamMembers} loading={loading} error={error} />
      </div>
    </div>
  );
}
