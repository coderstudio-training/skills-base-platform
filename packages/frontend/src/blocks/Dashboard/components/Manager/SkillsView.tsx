import useTeamSkills from '../../hooks/useTeamSkills';
import StaffSkillsCard from '../Cards/StaffSkillsCard';

interface SkillsViewProps {
  name: string;
}

export default function SkillsView({ name }: SkillsViewProps) {
  const { teamSkills, error, loading } = useTeamSkills(name);

  // Add early return for loading state
  if (loading) {
    return <StaffSkillsCard skillsData={null} loading={true} error={null} />;
  }

  // Add early return for error state
  if (error) {
    return <StaffSkillsCard skillsData={null} loading={false} error={error} />;
  }

  return <StaffSkillsCard skillsData={teamSkills} loading={false} error={null} />;
}
