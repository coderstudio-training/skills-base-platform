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
