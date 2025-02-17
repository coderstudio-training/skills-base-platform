// lib/api.ts
import { logger } from '@/lib/utils';
import {
  AdminData,
  Course,
  Department,
  LearningPath,
  LearningResourceParams,
  ResourcesResponse,
  Skill,
  Staff,
} from '@/types/admin';
import * as ApiTypes from '@/types/api';
import { RecommendationResponse } from '@/types/staff';

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

export async function getSkillAnalytics(): Promise<ApiTypes.SkillAnalyticsResponse> {
  const response = await fetch('/api/skills/analytics');

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch skill analytics data');
  }

  return response.json();
}

export async function getDistributions(): Promise<ApiTypes.DistributionResponse> {
  const response = await fetch('/api/skills/distributions');

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch distribution data');
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

export async function getSkills(): Promise<
  ApiTypes.SkillsResponse | ApiTypes.BackendSkillResponse[]
> {
  const response = await fetch('/api/skills/skills-matrix');

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch skill matrix data');
  }

  return response.json();
}

//Learning Recommendation API
export async function learningRecommendationAPI(email: string): Promise<RecommendationResponse> {
  const response = await fetch(`/api/learning/recommendations/${encodeURIComponent(email)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recommendations');
  }

  return response.json();
}

export async function getLearningResources(params?: LearningResourceParams): Promise<Course[]> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);

    const response = await fetch(
      `/api/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch learning resources');
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching learning resources:', error);
    throw error;
  }
}

export async function getResourceManagement(category?: string): Promise<ResourcesResponse> {
  try {
    const response = await fetch(
      `/api/courses/resources${category ? `?category=${category}` : ''}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch resource management data');
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching resource management:', error);
    throw error;
  }
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
