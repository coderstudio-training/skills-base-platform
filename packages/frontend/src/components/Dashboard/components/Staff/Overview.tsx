'use client';

import { MetricCard } from '@/components/Dashboard/components/Cards/MetricCard';
import { SkillsOverviewCard } from '@/components/Dashboard/components/Cards/SkillsOverviewCard';
import { StaffSkillsProps } from '@/components/Dashboard/types';
import { Blocks, BrainCircuit, User2 } from 'lucide-react';

export default function Overview({
  skillsData,
  selectedCategory,
  onCategoryChange,
  error,
}: StaffSkillsProps) {
  const safeMetrics = {
    softSkillsAverage: skillsData?.metrics?.softSkills.averageRating ?? 0,
    technicalSkillsAverage: skillsData?.metrics?.technicalSkills.averageRating ?? 0,
    skillsAssessed: skillsData?.metrics?.overall.totalSkills ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={User2}
          title="Soft Skills Average"
          value={safeMetrics.softSkillsAverage}
          error={error}
        />
        <MetricCard
          icon={BrainCircuit}
          title="Technical Skills Average"
          value={safeMetrics.technicalSkillsAverage}
          error={error}
        />
        <MetricCard
          icon={Blocks}
          title="Skills Assessed"
          value={safeMetrics.skillsAssessed}
          error={error}
        />
      </div>

      <SkillsOverviewCard
        skills={skillsData?.skills ?? []}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        error={error}
      />
    </div>
  );
}
