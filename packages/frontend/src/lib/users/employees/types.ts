export interface TeamMember {
  grade: string;
  employeeId: number;
  firstName: string;
  lastName: string;
  jobLevel: string;
  designation: string;
  email?: string;
  performanceScore?: number;
  managerName?: string;
  picture?: string;
}
