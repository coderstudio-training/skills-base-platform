import { BUSINESS_UNITS } from '@/blocks/Dashboard/constants';
import { ApiError } from '@/lib/api/types';
import { IBaseTaxonomy } from '@/lib/skills/types';
import { TeamMember } from '@/types/manager';
import { LucideIcon } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export interface LandingPageCardProps {
  title: string;
  description?: string;
  contentHeader: string;
  content?: string;
  icon?: LucideIcon;
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

export interface AdminDashboardProps {
  filters?: DashboardFilters;
}

export interface DashboardFilters {
  department?: string;
  skillCategory?: string;
  timeRange?: string;
  status?: string;
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

export interface TSCManagerProps {
  selectedBusinessUnit?: string;
  data?: IBaseTaxonomy[];
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

export interface TeamCompositionCardProps {
  teamMembers: TeamMember[];
  loading?: boolean;
}

export interface TeamMembersListProps {
  members: TeamMember[];
  loading: boolean;
  error: ApiError | null;
  showPerformance?: boolean;
}

export interface TeamMetricCardsProps {
  teamSize: number;
  averagePerformance?: number;
  skillGrowth?: number;
  loading?: boolean;
  error?: ApiError | null;
}

export interface ManagerOverviewProps {
  teamMembers: TeamMember[];
  loading: boolean;
  error: ApiError | null;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

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

export interface TopPerformersResponse {
  rankings: TopPerformer[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  designation: string;
  businessUnit: string;
  grade: string;
  roles: string[];
  picture?: string;
}
