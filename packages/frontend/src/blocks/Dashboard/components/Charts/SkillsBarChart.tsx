// components/Staff/Charts/SkillsGapChart.tsx
import { CustomBarChart } from '@/components/ui/barchart';
import { ResponsiveContainer } from 'recharts';
import { Skill } from '../../types';

interface SkillsGapChartProps {
  skills: Skill[];
  category: 'Technical Skills' | 'Soft Skills';
}

export function SkillsGapChart({ skills, category }: SkillsGapChartProps) {
  const filteredSkills = skills.filter(skill => skill.category === category);

  const chartData = filteredSkills.map(skill => ({
    skill: skill.name,
    average: skill.average,
    required: skill.required,
    gap: skill.gap,
  }));

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height={500}>
        <CustomBarChart
          data={chartData}
          xAxisKey="skill"
          series={[
            { key: 'average', name: 'Current Level', color: '#4285f4' },
            { key: 'required', name: 'Required Level', color: '#666666' },
            { key: 'gap', name: 'Skill Gap', color: '#dc2626' },
          ]}
        />
      </ResponsiveContainer>
    </div>
  );
}
