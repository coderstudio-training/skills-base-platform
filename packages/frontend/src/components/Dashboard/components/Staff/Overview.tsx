// components/Staff/Overview.tsx
'use client';

import { ApiError } from '@/lib/api/types';
import { Blocks, BrainCircuit, User2 } from 'lucide-react';
import { StaffData } from '../../types';
import { MetricCard } from '../Cards/MetricCard';
import { SkillsOverviewCard } from '../Cards/SkillsOverviewCard';

interface OverviewProps {
  skillsData: StaffData | null;
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
  loading?: boolean;
  error?: ApiError | null;
}

export default function Overview({
  skillsData,
  selectedCategory,
  onCategoryChange,
  error,
}: OverviewProps) {
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
