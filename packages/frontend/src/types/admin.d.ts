// types/admin.d.ts

export interface AdminData {
  totalEmployees: number
  totalDepartments: number
  averagePerformance: number
  skillGrowth: number
  performanceTrend: Array<{ month: string; performance: number }>
  departmentPerformance: Array<{ name: string; performance: number }>
  topSkills: Array<{ name: string; prevalence: number }>
  skillGaps: Array<{ name: string; currentLevel: number; gap: number }>
  topPerformers: Array<{ name: string; department: string; performanceScore: number }>
  totalTrainingHours: number
  employeesInTraining: number
  averageTrainingSatisfaction: number
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  position: string;
  hireDate: string;
  skills: EmployeeSkill[];
  managerId?: string;
}

export interface EmployeeSkill {
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

export interface SkillGapData {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
}
