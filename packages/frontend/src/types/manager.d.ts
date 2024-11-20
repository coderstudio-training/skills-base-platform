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

export interface TeamMemberData {
  name: string;
  role: string;
  skillLevel: number;
  trainingsCompleted: number;
}

//New
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  careerLevel: string;
}

export interface MemberRecommendations {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  course: {
    name: string;
    provider: string;
    duration: string;
    format: string;
    learningObjectives: string[];
    prerequisites: string;
    businessValue: string;
  };
}

export interface TeamRecommendations {
  member: TeamMember;
  recommendations: RecommendationResponse;
}
