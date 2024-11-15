// lib/api.ts

import { logger } from '@/lib/utils';
import { AdminData, Course, Department, LearningPath, Skill, Staff } from '@/types/admin';
import * as ApiTypes from '@/types/api';

const API_BASE_URL = 'http://localhost:3003';

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

// Add this with your other API functions

// interfaces/RecommendationInterfaces.ts

export interface CourseDetails {
  name: string;
  provider: string;
  duration: string;
  format: string;
  learningPath: string;
  learningObjectives: string[];
  prerequisites: string;
  businessValue: string;
}

export interface Recommendation {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  type: 'skillGap' | 'promotion';
  course: CourseDetails;
}

export interface RecommendationResponse {
  success: boolean;
  employeeName: string;
  careerLevel: string;
  recommendations: Recommendation[];
  generatedDate: Date;
  message?: string;
}

export const learningRecommendationAPI = {
  async getLearningPaths(email: string): Promise<RecommendationResponse> {
    try {
      const response = await fetch(
        `http://localhost:3003/api/learning/recommendations/${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        console.error('Response Status: ', response.status);
        throw new Error('Skill gaps data not found for this employee.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

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
