// types/admin.d.ts

export interface TopPerformer {
  name: string;
  score: number;
  ranking: number;
}

export interface TopPerformersResponse {
  rankings: TopPerformer[];
}

export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  businessUnit: string;
  employmentStatus: string;
  grade: string;
  skills?: SkillDetail[];
}

export interface SkillDetail {
  skill: string;
  category: string;
  selfRating: number;
  managerRating: number;
  requiredRating: number;
  gap: number;
  average: number;
}

export interface EmployeeSkill {
  name: string;
  level: string;
  currentLevel?: number;
  requiredLevel?: number;
  selfAssessment?: string;
  managerAssessment?: string;
  description?: string;
}

export interface BusinessUnitStats {
  name: string;
  count: number;
}

export interface SkillGap {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  topSkills: Array<{ name: string; level: string }>;
  skillGaps: Array<SkillGap>;
  businessUnitStats: Array<BusinessUnitStats>;
}

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

export interface SkillDistributionCategory {
  category: string;
  skills: SkillDistributionItem[];
}

export interface SkillDistributionItem {
  name: string;
  userCount: number;
  status: 'warning' | 'critical' | 'normal';
}

export interface GradeDistributionItem {
  grade: string;
  userCount: number;
}

export interface BusinessUnitSkillDistribution {
  businessUnit: string;
  categories: SkillDistributionCategory[];
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
