import { SkillStatus } from '@/components/Dashboard/types';

export const BUSINESS_UNITS = {
  ALL: 'All Business Units',
  ADM: 'Administrative Services',
  AI: 'AI Labs',
  CLD: 'Cloud',
  DATA: 'Big Data',
  FIN: 'Finance & Accounting',
  HR: 'Human Resources',
  IT: 'IT Service Management',
  MKT: 'Marketing',
  PMO: 'Project Management Office',
  QA: 'Software QA Services',
  SLS: 'Sales',
  SW: 'Software Services',
  VS: 'Venture Studio',
} as const;

export const PROFICIENCY_LEVELS = ['1', '2', '3', '4', '5', '6'];

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00ced1'];

export const statusStyles = {
  [SkillStatus.PROFICIENT]: 'text-white bg-green-500 px-2 py-1 rounded-md text-sm font-medium',
  [SkillStatus.DEVELOPING]: 'text-white bg-orange-500 px-2 py-1 rounded-md text-sm font-medium',
};
