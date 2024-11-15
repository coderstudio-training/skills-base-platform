// lib/api.ts

import { logger } from '@/lib/utils';
import { AdminData, Course, Department, LearningPath, Skill, Staff } from '@/types/admin';
import * as ApiTypes from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

export interface SkillGapsData {
  emailAddress: string;
  nameOfResource: string;
  careerLevel: string;
  capability: string;
  skillAverages: Record<string, number>;
  skillGaps: Record<string, number>;
}

// For the user/gap assessment data
export interface SkillGaps {
  emailAddress: string;
  nameOfResource: string;
  careerLevel: string;
  capability: string;
  skillAverages: Record<string, number>;
  skillGaps: Record<string, number>;
}

// For the skills assessment data
export interface Skills {
  skills: Record<string, number>;
}

// For combining self and manager assessments
export interface Assessments {
  selfSkills?: Skills;
  managerSkills?: Skills;
}

// Main response interface
export interface EmployeeSkillsResponse {
  user: SkillGaps;
  assessments?: Assessments;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const skillGapsApi = {
  async getEmployeeSkillGaps(email: string): Promise<SkillGapsData> {
    const response = await fetch(`/api/skills/gaps?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Skill gaps data not found for this employee.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'Failed to fetch skill gaps data');
    }

    return response.json();
  },
};

export const userSkillsApi = {
  async getUserSkillsData(email: string): Promise<EmployeeSkillsResponse> {
    const response = await fetch(`/api/skills/user-data?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Skill data not found for this user.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || "Failed to fetch user's skill data");
    }

    return response.json();
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred while fetching data');
  }

  return response.json();
}

export async function getAdminData(accessToken: string): Promise<AdminData> {
  logger.log(accessToken);
  return fetchWithAuth(`${API_BASE_URL}/admin/dashboard`);
}

export async function getDepartments(): Promise<Department[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/departments`);
}

export async function getStaffs(): Promise<Staff[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/staffs`);
}

export async function getSkills(): Promise<Skill[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/skills`);
}

export async function getCourses(): Promise<Course[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/courses`);
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/learning-paths`);
}

export async function syncData(dataType: string): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/sync/${dataType}`, {
    method: 'POST',
  });
}

export async function importData(data: []): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/import`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function exportReport(reportType: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/admin/export/${reportType}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  return response.blob();
}

export async function updateStaff(staffId: string, data: Partial<Staff>): Promise<Staff> {
  return fetchWithAuth(`${API_BASE_URL}/admin/staffs/${staffId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function addSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
  return fetchWithAuth(`${API_BASE_URL}/admin/skills`, {
    method: 'POST',
    body: JSON.stringify(skill),
  });
}

export async function updateSkill(skillId: string, data: Partial<Skill>): Promise<Skill> {
  return fetchWithAuth(`${API_BASE_URL}/admin/skills/${skillId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSkill(skillId: string): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/skills/${skillId}`, {
    method: 'DELETE',
  });
}

export async function assignCourseToStaff(
  staffId: string,
  courseId: string,
): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/staffs/${staffId}/courses/${courseId}`, {
    method: 'POST',
  });
}

export async function getPerformanceMetrics(
  departmentId?: string,
): Promise<ApiTypes.PerformanceMetricsResponse> {
  const url = departmentId
    ? `${API_BASE_URL}/admin/performance-metrics?departmentId=${departmentId}`
    : `${API_BASE_URL}/admin/performance-metrics`;
  return fetchWithAuth(url);
}

export async function getDevelopmentPlans(): Promise<ApiTypes.DevelopmentPlansResponse> {
  return fetchWithAuth(`${API_BASE_URL}/admin/development-plans`);
}
