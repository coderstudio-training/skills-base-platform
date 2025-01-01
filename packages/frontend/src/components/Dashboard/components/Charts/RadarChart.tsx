import { Skill } from '@/components/Dashboard/types'; // Update to use the new Skill interface
import { CustomTooltip } from '@/components/ui/tooltip';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillsChartProps {
  skills: Skill[];
  category: 'Technical Skills' | 'Soft Skills';
}

export function SkillsRadarChart({ skills, category }: SkillsChartProps) {
  const chartData = skills
    .filter(skill => skill.category === category)
    .map(skill => ({
      skill: skill.name, // Use name instead of skill
      average: skill.average,
      requiredRating: skill.required, // Use required instead of requiredRating
      gap: skill.gap,
    }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid gridType="circle" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#666', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
          <Radar
            name="Current Level"
            dataKey="average"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Radar
            name="Required Level"
            dataKey="requiredRating"
            stroke="#4ade80"
            fill="#4ade80"
            fillOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
