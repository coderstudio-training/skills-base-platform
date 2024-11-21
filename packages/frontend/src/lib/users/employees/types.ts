export interface TeamMember {
  employeeId: number;
  firstName: string;
  lastName: string;
  designation: string;
  email?: string;
  performanceScore?: number;
  managerName?: string;
  picture?: string;
}
