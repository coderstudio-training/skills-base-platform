export interface Skill {
  name: string;
  category: 'Technical Skills' | 'Soft Skills';
  selfRating: number;
  managerRating: number;
  average: number;
  gap: number;
  required: number;
}

export interface SkillsResponse {
  email: string;
  name: string;
  careerLevel: string;
  capability: string;
  skills: Skill[];
}

export interface UserMetrics {
  averageGap: number;
  skillsMeetingRequired: number;
  skillsNeedingImprovement: number;
  largestGap: number;
  softSkillsAverage: number;
  technicalSkillsAverage: number;
  totalSkillsAssessed: number;
}

export interface SkillSummaryResponse {
  metrics: UserMetrics;
  skills: Skill[];
}
