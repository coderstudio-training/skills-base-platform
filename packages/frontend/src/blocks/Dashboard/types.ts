export interface SkillSummaryResponse {
  metrics: UserMetrics;
  skills: Skill[];
}

export interface UserMetrics {
  averageGap: number;
  skillsMeetingRequired: number;
  skillsNeedingImprovement: number;
  largestGap: number;
  softSkillsAverage: number;
  technicalSkillsAverage: number;
  skillsAssessed: number;
}

export interface Skill {
  skill: string;
  category: 'Technical Skills' | 'Soft Skills';
  average: number;
  requiredRating: number;
  gap: number;
}
