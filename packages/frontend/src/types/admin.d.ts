// types/admin.d.ts

export interface AdminData {
  totalStaffs: number;
  totalDepartments: number;
  averagePerformance: number;
  skillGrowth: number;
  performanceTrend: Array<{ month: string; performance: number }>;
  departmentPerformance: Array<{ name: string; performance: number }>;
  topSkills: Array<{ name: string; prevalence: number }>;
  skillGaps: Array<{ name: string; currentLevel: number; gap: number }>;
  topPerformers: Array<{
    name: string;
    department: string;
    performanceScore: number;
  }>;
  totalTrainingHours: number;
  staffsInTraining: number;
  averageTrainingSatisfaction: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  staffCount: number;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  position: string;
  hireDate: string;
  skills: StaffSkill[];
  managerId?: string;
}

export interface StaffSkill {
  skillId: string;
  proficiencyLevel: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  skillIds: string[];
  duration: number; // in hours
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  provider: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  skillIds: string[];
  estimatedDuration: number; // in hours
}

export interface DepartmentPerformanceData {
  name: string;
  performance: number;
}

export interface SkillDistributionData {
  name: string;
  value: number;
}

export interface PerformanceTrendData {
  month: string;
  performance: number;
}

export interface TopPerformerData {
  name: string;
  department: string;
  performanceScore: number;
  keySkills: string[];
}

export interface TopSkillData {
  name: string;
  prevalence: number; // This will be the average rating converted to percentage
}

export interface SkillGapData {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}
