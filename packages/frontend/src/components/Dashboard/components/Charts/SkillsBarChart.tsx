import { CustomBarChart } from '@/components/ui/barchart';
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
    requiredRating: skill.required,
    gap: Math.abs(skill.gap),
    gapType: skill.gap < 0 ? -1 : 1, // Using number instead of boolean
  }));

  return (
    <div className="h-[450px] w-full">
      <CustomBarChart
        data={chartData}
        xAxisKey="skill"
        yAxisDomain={[0, 6]}
        yAxisTicks={[0, 1.5, 3, 4.5, 6]}
        series={[
          {
            key: 'average',
            name: 'Current Level',
            color: { type: 'static', value: '#4285f4' },
          },
          {
            key: 'requiredRating',
            name: 'Required Level',
            color: { type: 'static', value: '#666666' },
          },
          {
            key: 'gap',
            name: 'Skill Gap',
            color: {
              type: 'dynamic',
              getValue: data => (data.gapType === -1 ? '#dc2626' : '#22c55e'),
            },
          },
        ]}
        height={500}
      />
    </div>
  );
}
