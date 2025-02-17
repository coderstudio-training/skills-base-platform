export interface ManagerData {
  name: string;
  role: string;
  department: string;
  teamSize: number;
  averageSkillLevel: number;
  skillGapsIdentified: number;
  ongoingTrainings: number;
  pendingEvaluations: number;
}

export interface TeamSkillData {
  name: string;
  proficient: number;
  learning: number;
  gap: number;
}

export interface EvaluationStatusData {
  name: string;
  value: number;
}

interface TeamMember {
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

//New
export interface TeamMember {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  picture?: string;
}

interface MemberRecommendations {
  success: boolean;
  recommendations: Recommendation[];
  employeeName: string;
  careerLevel: string;
}

export interface TeamRecommendations {
  member: TeamMember;
  recommendations: RecommendationResponse;
}

interface TeamMemberWithSkills {
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  grade: string;
  picture?: string;
  skills: {
    skill: string;
    category: string;
    selfRating: number;
    managerRating: number;
    requiredRating: number;
    gap: number;
    average: number;
  }[];
}
