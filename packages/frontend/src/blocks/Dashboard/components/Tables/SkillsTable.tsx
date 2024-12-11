// components/Staff/Tables/SkillsTable.tsx
import { Progress } from '@/components/ui/progress';
import { Skill, SkillStatus } from '../../types';
import { ColumnConfig, DataTable } from './DataTable';

interface SkillsTableProps {
  skills: Skill[];
  category: 'Technical Skills' | 'Soft Skills';
}

const statusStyles = {
  [SkillStatus.PROFICIENT]: 'text-white bg-green-500 px-2 py-1 rounded-md text-sm font-medium',
  [SkillStatus.DEVELOPING]: 'text-white bg-orange-500 px-2 py-1 rounded-md text-sm font-medium',
};

const RatingCell = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2">
    <Progress value={(value / 6) * 100} className="w-20 h-2" />
    <span className="text-sm font-normal w-4">{value}</span>
  </div>
);

export function SkillsTable({ skills, category }: SkillsTableProps) {
  const filteredSkills = skills.filter(skill => skill.category === category);

  const columns: ColumnConfig<Skill>[] = [
    {
      header: 'Skill',
      key: 'name',
      width: 'w-[30%]',
    },
    {
      header: 'Self Rating',
      key: 'selfRating',
      width: 'w-[20%]',
      render: skill => <RatingCell value={skill.selfRating} />,
    },
    {
      header: 'Manager Rating',
      key: 'managerRating',
      width: 'w-[20%]',
      render: skill => <RatingCell value={skill.managerRating} />,
    },
    {
      header: 'Required Level',
      key: 'required',
      width: 'w-[15%]',
      align: 'center',
      render: skill => <RatingCell value={skill.required} />,
    },
    {
      header: 'Status',
      key: 'status',
      width: 'w-[15%]',
      render: skill => <span className={statusStyles[skill.status]}>{skill.status}</span>,
    },
  ];

  return <DataTable data={filteredSkills} columns={columns} />;
}
