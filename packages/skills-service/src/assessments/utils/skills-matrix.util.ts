// utils/skill-matrix.utils.ts
import { NotFoundException } from '@nestjs/common';

export const GRADE_ORDER = [
  'Professional I',
  'Professional II',
  'Professional III',
  'Professional IV',
  'Manager I',
  'Manager II',
  'Manager III',
  'Manager IV',
  'Director I',
  'Director II',
  'Director III',
  'Director IV',
];

export function sortByGradeLevel(
  a: { grade: string },
  b: { grade: string },
): number {
  return GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
}

export function validateAssessmentData(assessment: any, email?: string) {
  if (!assessment) {
    const message = email
      ? `No assessment found for email: ${email}`
      : 'No assessment data found';
    throw new NotFoundException(message);
  }
}

export function calculateSkillMetrics(
  skillName: string,
  assessment: any,
  requiredSkills: any,
) {
  const average = assessment.skillAverages?.[skillName] ?? 0;
  const gap = assessment.skillGaps?.[skillName] ?? 0;
  const required = requiredSkills[skillName] ?? 0;

  return {
    average,
    gap,
    required,
  };
}
