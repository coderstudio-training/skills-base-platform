// lib/api.ts

import { AdminData, Department, Employee, Skill, Course, LearningPath } from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
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
  return fetchWithAuth(`${API_BASE_URL}/admin/dashboard`);
}

export async function getDepartments(): Promise<Department[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/departments`);
}

export async function getEmployees(): Promise<Employee[]> {
  return fetchWithAuth(`${API_BASE_URL}/admin/employees`);
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
  return fetchWithAuth(`${API_BASE_URL}/admin/sync/${dataType}`, { method: 'POST' });
}

export async function importData(data: any): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/import`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function exportReport(reportType: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/admin/export/${reportType}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  return response.blob();
}

export async function updateEmployee(employeeId: string, data: Partial<Employee>): Promise<Employee> {
  return fetchWithAuth(`${API_BASE_URL}/admin/employees/${employeeId}`, {
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

export async function assignCourseToEmployee(employeeId: string, courseId: string): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${API_BASE_URL}/admin/employees/${employeeId}/courses/${courseId}`, {
    method: 'POST',
  });
}

export async function getPerformanceMetrics(departmentId?: string): Promise<any> {
  const url = departmentId
    ? `${API_BASE_URL}/admin/performance-metrics?departmentId=${departmentId}`
    : `${API_BASE_URL}/admin/performance-metrics`;
  return fetchWithAuth(url);
}

export async function getDevelopmentPlans(): Promise<any> {
  return fetchWithAuth(`${API_BASE_URL}/admin/development-plans`);
}
