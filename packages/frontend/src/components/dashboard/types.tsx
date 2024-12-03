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
