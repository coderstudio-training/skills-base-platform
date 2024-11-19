export interface Skill {
  name: string;
  level: number;
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

export interface NetworkConnection {
  name: string;
  role: string;
}

export interface CareerPath {
  role: string;
  requiredSkills: string[];
}

interface CourseDetails {
  name: string;
  provider: string;
  duration: string;
  format: string;
  learningPath: string;
  learningObjectives: string[];
  prerequisites: string;
  businessValue: string;
}

interface Recommendation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  type: 'skillGap' | 'promotion';
  course: CourseDetails;
}

interface LearningRecommendation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
}

interface ApiResponse {
  success: boolean;
  careerLevel: string;
  recommendations: LearningRecommendation[];
  generatedDate: string;
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
