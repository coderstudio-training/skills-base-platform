import IndividualPerformanceCard from '@/components/Dashboard/components/Cards/IndividualPerformanceCard';
import { TeamMembersListProps } from '@/components/Dashboard/types';

export default function Performance({ members, loading, error }: TeamMembersListProps) {
  return <IndividualPerformanceCard members={members} loading={loading} error={error} />;
}
