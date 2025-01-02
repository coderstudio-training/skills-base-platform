import StaffSkillsCard from '@/components/Dashboard/components/Cards/StaffSkillsCard';
import ManagerTrainingLoading from '@/components/Dashboard/components/Skeletons/TabLoadingCard';
import useTeamSkills from '@/components/Dashboard/hooks/useTeamSkills';
import { TabViewProps } from '@/components/Dashboard/types';

export default function SkillsView({ name }: TabViewProps) {
  const { teamSkills, error, loading } = useTeamSkills(name || '');

  if (loading) {
    <ManagerTrainingLoading
      title="Team Skills Breakdown"
      description="Detailed view of individual skills"
    />;
  }

  return <StaffSkillsCard skillsData={teamSkills} loading={false} error={error} />;
}
