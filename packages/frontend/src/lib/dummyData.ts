import { AdminData } from '@/types/admin';

export const dummyAdminData: AdminData = {
  totalStaffs: 500,
  totalDepartments: 8,
  averagePerformance: 82,
  skillGrowth: 12,
  performanceTrend: [
    { month: 'Jan', performance: 75 },
    { month: 'Feb', performance: 78 },
    { month: 'Mar', performance: 80 },
    { month: 'Apr', performance: 79 },
    { month: 'May', performance: 82 },
    { month: 'Jun', performance: 84 },
  ],
  departmentPerformance: [
    { name: 'Engineering', performance: 88 },
    { name: 'Marketing', performance: 76 },
    { name: 'Sales', performance: 84 },
    { name: 'HR', performance: 79 },
    { name: 'Finance', performance: 81 },
    { name: 'Product', performance: 85 },
    { name: 'Customer Support', performance: 80 },
    { name: 'Operations', performance: 78 },
  ],
  topSkills: [
    { name: 'JavaScript', prevalence: 85 },
    { name: 'Project Management', prevalence: 75 },
    { name: 'Data Analysis', prevalence: 70 },
    { name: 'Communication', prevalence: 90 },
    { name: 'Python', prevalence: 65 },
  ],
  skillGaps: [
    { name: 'Machine Learning', currentLevel: 40, gap: 30 },
    { name: 'Cloud Architecture', currentLevel: 55, gap: 25 },
    { name: 'Cybersecurity', currentLevel: 50, gap: 35 },
    { name: 'UX Design', currentLevel: 60, gap: 20 },
    { name: 'Blockchain', currentLevel: 30, gap: 40 },
  ],
  topPerformers: [
    { name: 'John Doe', department: 'Engineering', performanceScore: 95 },
    { name: 'Jane Smith', department: 'Sales', performanceScore: 93 },
    { name: 'Mike Johnson', department: 'Marketing', performanceScore: 91 },
    { name: 'Emily Brown', department: 'Product', performanceScore: 90 },
    { name: 'Chris Lee', department: 'Finance', performanceScore: 89 },
  ],
  totalTrainingHours: 2500,
  staffsInTraining: 350,
  averageTrainingSatisfaction: 4.5,
};

import { ManagerData } from '@/types/manager';

export const dummyManagerData: ManagerData = {
  name: 'Jane Doe',
  role: 'Senior Engineering Manager',
  department: 'Software Development',
  teamSize: 12,
  averageSkillLevel: 0,
  skillGapsIdentified: 0,
  ongoingTrainings: 0,
  pendingEvaluations: 0,
};

// Mock data for StaffData
import { StaffData } from '@/types/staff';
export const dummyStaffData: StaffData = {
  name: 'John Doe',
  role: 'Software Engineer',
  department: 'Engineering',
  email: 'john.doe@example.com',
  skills: [
    { name: 'JavaScript', level: 100 },
    { name: 'React', level: 85 },
    { name: 'Node.js', level: 75 },
    { name: 'Python', level: 65 },
    { name: 'SQL', level: 30 },
  ],
  qualifications: [
    { name: "Bachelor's in Computer Science", date: '2018' },
    { name: 'AWS Certified Developer', date: '2020' },
    { name: 'Scrum Master Certification', date: '2021' },
  ],
  learningPaths: [
    { name: 'Advanced React Patterns', progress: 60 },
    { name: 'Machine Learning Fundamentals', progress: 30 },
    { name: 'Cloud Architecture', progress: 45 },
  ],
  performanceMetrics: {
    currentScore: 85,
    trend: [
      { month: 'Jan', score: 80 },
      { month: 'Feb', score: 82 },
      { month: 'Mar', score: 85 },
      { month: 'Apr', score: 83 },
      { month: 'May', score: 85 },
    ],
  },
  network: [
    { name: 'Jane Smith', role: 'UX Designer' },
    { name: 'Mike Johnson', role: 'Product Manager' },
    { name: 'Sarah Lee', role: 'Data Scientist' },
  ],
  careerPaths: [
    {
      role: 'Senior Software Engineer',
      requiredSkills: ['System Design', 'Team Leadership'],
    },
    {
      role: 'Technical Lead',
      requiredSkills: ['Project Management', 'Architecture'],
    },
    {
      role: 'Engineering Manager',
      requiredSkills: ['People Management', 'Strategic Planning'],
    },
  ],
};
