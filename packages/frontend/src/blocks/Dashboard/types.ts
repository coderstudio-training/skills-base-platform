export interface AdminDashboardProps {
  filters?: DashboardFilters;
}

export interface DashboardFilters {
  department?: string;
  skillCategory?: string;
  timeRange?: string;
  status?: string;
}

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  designation: string;
  employmentStatus: string;
  businessUnit: string;
  picture?: string;
}

export interface EmployeesResponse {
  items: Employee[];
  total: number;
  totalPages: number;
}

export interface BusinessUnitsResponse {
  businessUnits: string[];
  distribution?: BusinessUnitStat[];
}

export interface EmployeeStats {
  totalEmployeesCount: number;
  businessUnitsCount: number;
  activeEmployeesCount: number;
}

export interface BusinessUnitStat {
  name: string;
  count: number;
}

export interface TopPerformer {
  ranking: number;
  name: string;
  score: number;
}

export interface SkillGap {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface SkillDetail {
  skill: string;
  average: number;
  requiredRating: number;
  gap: number;
  description?: string;
  proficiencyDescription?: string;
  currentLevel: number;
  selfRating: number;
  managerRating: number;
}

export interface UserDirectoryProps {
  employees: Employee[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: string) => void;
}

export interface SearchAndFilterProps {
  selectedBusinessUnit: string;
  businessUnits: string[];
  searchQuery: string;
  onBusinessUnitChange: (unit: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

// staff

export enum SkillStatus {
  PROFICIENT = 'Proficient',
  DEVELOPING = 'Developing',
}

export interface Skill {
  name: string;
  category: 'Technical Skills' | 'Soft Skills';
  selfRating: number;
  managerRating: number;
  average: number;
  gap: number;
  required: number;
  status: SkillStatus;
}

export interface CategoryMetrics {
  averageGap: number;
  skillsMeetingRequired: number;
  skillsNeedingImprovement: number;
  largestGap: number;
  averageRating: number;
  totalSkills: number;
}

export interface UserMetrics {
  overall: CategoryMetrics;
  softSkills: CategoryMetrics;
  technicalSkills: CategoryMetrics;
}

export interface StaffSkills {
  email: string;
  name: string;
  careerLevel: string;
  capability: string;
  skills: Skill[];
}

export interface StaffData {
  metrics: UserMetrics;
  skills: Skill[];
}

// Manager

export interface TeamData {
  members: StaffSkills[];
}

// Admin

export interface TopSkill {
  name: string;
  prevalence: number;
}

export interface SkillGap {
  name: string;
  currentAvg: number;
  requiredLevel: number;
  gap: number;
}

export interface OrganizationSkillsAnalysis {
  capabilities: {
    capability: string;
    topSkills: TopSkill[];
    skillGaps: SkillGap[];
  }[];
}

export interface SkillDistributionItem {
  name: string;
  userCount: number;
  status: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface SkillDistributionCategory {
  category: string;
  skills: SkillDistributionItem[];
}

export interface BusinessUnitDistribution {
  businessUnit: string;
  categories: SkillDistributionCategory[];
}

export interface GradeDistribution {
  grade: string;
  userCount: number;
}

export interface DistributionsResponse {
  skillDistribution: BusinessUnitDistribution[];
  gradeDistribution: GradeDistribution[];
}

export interface EmployeeRanking {
  name: string;
  ranking: number;
  score: number;
}

export interface EmployeeRankingsResponse {
  rankings: EmployeeRanking[];
}
