export interface EmployeeData {
  name: string;
  role: string;
  department: string;
  skillsAssessed: number;
  learningPaths: number;
  skillImprovement: number;
}

export interface SkillData {
  skill: string;
  level: number;
  interest: number;
  competency: number;
}

export interface QualificationData {
  name: string;
  institution: string;
  year: number;
}

export interface ColleagueData {
  name: string;
  role: string;
  skillMatch: number;
}

export interface LearningPathData {
  name: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
}

export interface SkillProgressionData {
  month: string;
  average: number;
}

export interface TrainingData {
  name: string;
  date: string;
  duration: string;
}

export interface CareerPathData {
  current: {
    path: string;
    level: string;
    yearsInRole: number;
    nextPromotion: string;
    estimatedTimeToPromotion: string;
  };
  crossSkilling: Array<{
    path: string;
    matchPercentage: number;
    keySkillsNeeded: string[];
  }>;
  alternativePaths: Array<{
    path: string;
    matchPercentage: number;
    keySkillsNeeded: string[];
  }>;
}

export interface DetailedCareerPlan {
  currentRole: {
    title: string;
    level: string;
    yearsInRole: number;
    keySkills: string[];
    skillAssessment: Array<{ skill: string; level: number }>;
  };
  nextSteps: Array<{
    role: string;
    requiredSkills: string[];
    estimatedTimeline: string;
    trainingRecommendations: string[];
  }>;
}
