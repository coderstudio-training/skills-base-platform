'use client';

import { Blocks, BrainCircuit, User2 } from 'lucide-react';
import { useState } from 'react';
import { SkillSummaryResponse } from '../../types';
import { MetricsCard } from '../Cards/MetricsCard';
import { SkillsOverviewCard } from '../Cards/SkillsOverviewCard';

interface OverviewProps {
  skillsData: SkillSummaryResponse | null;
}

export default function Overview({ skillsData }: OverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );

  if (!skillsData) {
    console.log('No skills data available');
    return <div>No skills data available</div>;
  }

  const { metrics, skills } = skillsData;

  if (!metrics || !skills) {
    console.log('Invalid data structure:', skillsData);
    return <div>Invalid data structure received</div>;
  }

  const safeMetrics = {
    softSkillsAverage: metrics.softSkillsAverage ?? 0,
    technicalSkillsAverage: metrics.technicalSkillsAverage ?? 0,
    skillsAssessed: metrics.totalSkillsAssessed ?? 0, // Updated field name
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricsCard
          icon={User2}
          title="Soft Skills Average"
          value={safeMetrics.softSkillsAverage}
        />
        <MetricsCard
          icon={BrainCircuit}
          title="Technical Skills Average"
          value={safeMetrics.technicalSkillsAverage}
        />
        <MetricsCard
          icon={Blocks}
          title="Skills Assessed"
          value={safeMetrics.skillsAssessed}
          decimals={0}
        />
      </div>

      <SkillsOverviewCard
        skills={skills}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
}
