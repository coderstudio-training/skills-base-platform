export interface StaffSkill {
  skill: string;
  category: string;
  selfRating: number;
  managerRating: number;
  requiredRating: number;
  gap: number;
  average: number;
}

export interface Qualification {
  name: string;
  date: string;
}

export interface LearningPath {
  name: string;
  progress: number;
}

export interface PerformanceMetrics {
  currentScore: number;
  trend: { month: string; score: number }[];
}

export interface SkillMetrics {
  technicalSkillsAverage: number;
  softSkillsAverage: number;
  skillsAssessed: number;
}

export interface NetworkConnection {
  name: string;
  role: string;
}

export interface CareerPath {
  role: string;
  requiredSkills: string[];
}

export interface StaffData {
  name: string;
  role: string;
  department: string;
  email: string;
  skills: Skill[];
  qualifications: Qualification[];
  learningPaths: LearningPath[];
  performanceMetrics: PerformanceMetrics;
  network: NetworkConnection[];
  careerPaths: CareerPath[];
}
