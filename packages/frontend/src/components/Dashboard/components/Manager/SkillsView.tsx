import StaffSkillsCard from '@/components/Dashboard/components/Cards/StaffSkillsCard';
import useTeamSkills from '@/components/Dashboard/hooks/useTeamSkills';
import { TabViewProps } from '@/components/Dashboard/types';

export default function SkillsView({ name }: TabViewProps) {
  const { teamSkills, error, loading } = useTeamSkills(name || '');

  // early return for loading state
  if (loading) {
    return <StaffSkillsCard skillsData={null} loading={true} error={null} />;
  }

  // early return for error state
  if (error) {
    return <StaffSkillsCard skillsData={null} loading={false} error={error} />;
  }

  return <StaffSkillsCard skillsData={teamSkills} loading={false} error={null} />;
}
