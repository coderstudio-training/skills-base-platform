import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import { ApiError, Roles } from '@/lib/api/types';
import { LucideIcon } from 'lucide-react';
import React, { Dispatch, SetStateAction } from 'react';

export interface LandingPageCardProps {
  title: string;
  description?: string;
  content?: string;
  contentHeader: string;
  icon?: LucideIcon;
  cardCn?: string;
  cardHeaderCn?: string;
  cardTitleCn?: string;
  iconCn?: string;
  cardContentCn?: string;
  descriptionCn?: string;
  contentCn?: string;
  contentHeaderCn?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface LoadingCardProps {
  skeleton_cn?: string;
  div_h1_cn?: string;
  div_h2_cn?: string;
  div_h3_cn?: string;
  skeleton_h_cn?: string;
  div_b1_cn?: string;
  headerContent?: string;
  bodyChildren: React.ReactNode;
}

export interface LoginFormCardProps {
  title?: string;
  description?: string;
  className?: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  formState: { email: string; password: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  adminLoginError: ApiError | null;
  adminLoginLoading: boolean;
}

export interface Notification {
  _id: string;
  workflow: {
    id: string;
    name: string;
  };
  execution: {
    status: 'success' | 'error' | 'running';
    startedAt: string;
    finishedAt?: string;
  };
  read: boolean;
  readAt?: string;
}

export interface NotificationCenterProps {
  onLastNotificationDateChange?: (date: string | null) => void;
}

export interface ReportSkill {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface ReportEmployee {
  name: string;
  department: string;
  skills: ReportSkill[];
}

export interface ReportData {
  title: string;
  description: string;
  date: string;
  summary?: {
    label: string;
    value: string | number;
  }[];
  details?: {
    label: string;
    value: string | number;
    change?: number;
  }[];
  employees?: ReportEmployee[];
}

export interface EmployeeSkillsReportData extends ReportData {
  employees: ReportEmployee[];
}

export interface ReportTemplateProps {
  data: ReportData;
}

export interface EmployeeSkillsReportProps {
  data: EmployeeSkillsReportData;
}

//in use
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

//in use
export interface EmployeesResponse {
  items: Employee[];
  total: number;
  totalPages: number;
}

//in use
export interface BusinessUnitsResponse {
  businessUnits: string[];
  distribution?: BusinessUnitStat[];
}

//in use
export interface EmployeeStats {
  totalEmployeesCount: number;
  businessUnitsCount: number;
  activeEmployeesCount: number;
}

//in use
export interface BusinessUnitStat {
  name: string;
  count: number;
}

//in use
export interface TopPerformer {
  ranking: number;
  name: string;
  score: number;
}

//in use
// export interface SkillGap {
//   name: string;
//   currentLevel: number;
//   requiredLevel: number;
//   gap: number;
// }

//in use
export interface SkillDetail {
  skill: string;
  name?: string;
  category: string;
  description?: string;
  proficiencyDescription?: string;
  selfRating: number;
  managerRating: number;
  requiredRating: number;
  gap: number;
  average: number;
}

//in use
export interface UserDirectoryProps {
  employees: Employee[];
  loading?: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: string) => void;
}

//in use
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

export interface IBaseTaxonomy {
  docTitle: string;
  docId: string;
  docRevisionId: string;
  category: string;
  title: string;
  description: string;
  proficiencyDescription: Record<string, string[]>;
  abilities: Record<string, string[]>;
  knowledge: Record<string, string[]>;
  rangeOfApplication?: string[];
}

export interface ITechnicalTaxonomy {
  data: IBaseTaxonomy[];
}

export interface ITaxonomyDTO extends IBaseTaxonomy {
  businessUnit: string;
}

export interface IBulkUpsertDTO {
  data: ITaxonomyDTO[];
}

export interface ITaxonomyResponse {
  updatedCount: number;
  errors: string[];
}

export interface TSCManagerProps {
  selectedBusinessUnit?: string;
  searchQuery?: string;
}

export interface TSCFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  targetTSC: TSC | null; // null equates to new tsc
  setTargetTSC: Dispatch<SetStateAction<TSC | null>>;
  formErrors: { [key: string]: string };
  handleSave: () => void;
}

export interface TSCContentProps {
  itemsBeforeScroll?: number;
  filteredTSCs: TSC[];
  searchQuery: string;
  handleEdit: (tsc: TSC) => void;
  handleDelete: (id: string) => void;
}

export interface TSCProficiency {
  level: string;
  code: string;
  description: string;
  knowledge: string[];
  abilities: string[];
}

export interface TSC {
  id: string;
  businessUnit: BusinessUnit;
  category: string;
  title: string;
  description: string;
  proficiencies: TSCProficiency[];
  rangeOfApplication: string[];
}

export const emptyTSC: Omit<TSC, 'id' | 'businessUnit'> = {
  category: '',
  title: '',
  description: '',
  proficiencies: [],
  rangeOfApplication: [],
};

export const emptyProficiency: TSCProficiency = {
  level: '',
  code: '',
  description: '',
  knowledge: [],
  abilities: [],
};

export type BusinessUnit = keyof typeof BUSINESS_UNITS;

//in use
export interface BaseCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: ApiError | null;
  loadingMessage?: string;
  errorMessage?: string;
  height?: 'auto' | 'fixed' | string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

// in use
export interface MetricCardProps {
  title: string;
  description?: string;
  value: number | string;
  loading?: boolean;
  error?: ApiError | null;
  icon?: LucideIcon;
  subtitle?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

//in use
export interface TeamCompositionCardProps {
  teamMembers: TeamMember[];
  loading?: boolean;
}

//in use
export interface TeamMembersListProps {
  members: TeamMember[];
  loading?: boolean;
  error?: ApiError | null;
}

//in use
export interface TeamMetricCardsProps {
  teamSize: number;
  averagePerformance?: number;
  skillGrowth?: number;
  loading?: boolean;
  error?: ApiError | null;
}

//in use
export interface ManagerOverviewProps {
  teamMembers: TeamMember[];
  loading?: boolean;
  error?: ApiError | null;
}

//in use
export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

//in use
export interface BaseBarChartProps {
  data: Record<string, number | string>[];
  loading?: boolean;
  xAxisKey: string;
  series: ChartSeries[];
  height?: number;
  stacked?: boolean;
  noDataMessage?: string;
  loadingMessage?: string;
}

export interface BusinessUnitsResponse {
  distribution?: BusinessUnitStat[];
}

//in use
export interface SkillGapsResponse {
  skillGaps: SkillGap[];
}

//in use
export interface TopPerformersResponse {
  rankings: TopPerformer[];
}

//in use
export interface UserProfile {
  firstName: string;
  lastName: string;
  designation: string;
  businessUnit: string;
  grade: string;
  roles: string[];
  picture?: string;
}

//in use
export interface AdminMetricCardsProps {
  stats: EmployeeStats;
  loading?: boolean;
  error?: ApiError | null;
}

export interface SkillsTableProps {
  skills: Skill[];
  category: 'Technical Skills' | 'Soft Skills';
}

//in use
export interface BusinessUnitDistributionProps {
  businessUnits: BusinessUnitStat[];
  loading?: boolean;
  error?: ApiError | null;
}

//in use
export interface SkillGapOverviewProps {
  skillGaps: SkillGap[];
  loading?: boolean;
  error?: ApiError | null;
}

//in use
export interface TopPerformersProps {
  rankings: TopPerformer[];
  loading?: boolean;
  error?: ApiError | null;
}

export interface ManagerEvaluationProps {
  teamMembers: TeamMember[];
}

//in use
export interface TeamMember {
  employeeId: number;
  grade: string;
  firstName: string;
  lastName: string;
  jobLevel: string;
  designation: string;
  email?: string;
  performanceScore?: number;
  managerName?: string;
  picture?: string;
}

//in use
export interface SkillsDialogProps {
  selectedEmployee: { email: string; name: string } | null;
  skills: SkillDetail[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onViewSkills: (email: string, name: string) => void;
  EmployeeDetails: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

//in use
export interface ViewSkillsButtonProps {
  onClick: () => void;
}

// in use
export interface CourseDetails {
  name: string;
  provider: string;
  duration: string;
  format: string;
  learningPath: string;
  learningObjectives: string[];
  prerequisites: string;
  businessValue: string;
}
// in use
export interface Recommendation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  type: 'skillGap' | 'promotion';
  course: CourseDetails;
}

// in use
export interface RecommendationResponse {
  success: boolean;
  employeeName: string;
  careerLevel: string;
  recommendations: Recommendation[];
  generatedDate: Date;
  message?: string;
}

//in use
export interface MemberRecommendations {
  success: boolean;
  recommendations: Recommendation[];
  employeeName: string;
  careerLevel: string;
}

// in use
export interface TeamRecommendations {
  member: TeamMember;
  recommendations: RecommendationResponse;
}

// in use
export interface Course {
  _id: string;
  courseId: string;
  skillCategory: string;
  skillName: string;
  requiredLevel: number;
  careerLevel: string;
  courseLevel: string;
  fields: {
    name: string;
    value: string;
  }[];
  lastUpdated: string;
}

// in use
export interface LearningResourceParams {
  category?: string;
  level?: string;
}

// in use
export interface ResourcesResponse {
  resources: Course[];
  totalCount: number;
}

//in use
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  skillIds: string[];
  estimatedDuration: number; // in hours
}

export interface SkillGap {
  name: string;
  currentAvg: number;
  requiredLevel: number;
  gap: number;
}

export interface Capability {
  capability: string;
  skillGaps: SkillGap[];
  topSkills: TopSkill[];
}

export interface OrganizationSkillsAnalysis {
  capabilities: Capability[];
}

export interface SkillGapsResponse {
  capabilities: Capability[];
}

export interface TaxonomyResponse {
  [0]: {
    description?: string;
    proficiencyDescription?: {
      [key: string]: string[];
    };
  };
}

// Props
export interface DashboardProps {
  id: string;
  name: string;
  email: string;
  image?: string | undefined;
  accessToken: string;
  role: Roles;
}

export interface TabViewProps {
  email?: string;
  name?: string;
}

export interface StaffSkillsProps {
  skillsData: StaffData | null;
  selectedCategory: 'Technical Skills' | 'Soft Skills';
  onCategoryChange: (category: 'Technical Skills' | 'Soft Skills') => void;
  loading?: boolean;
  error?: ApiError | null;
}

export interface BusinessUnitSkillsProps {
  businessUnit: {
    businessUnit: string;
    categories: Array<{
      category: string;
      skills: Array<SkillDistributionItem>;
    }>;
  };
}

export interface CapabilityGapsProps {
  capability: {
    capability: string;
    skillGaps: Array<SkillGap>;
  };
}

export interface GradeItemProps {
  grade: {
    grade: string;
    userCount: number;
  };
}

export interface AuthResponse {
  access_token?: string;
  message?: string;
  status?: number;
}
