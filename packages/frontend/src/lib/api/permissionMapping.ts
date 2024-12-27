import { Permission } from './types';

export const PERMISSION_CODES = {
  canViewDashboard: 1001,
  canViewSkills: 1002,
  canEditOwnSkills: 1003,
  canEditTeamSkills: 1004,
  canEditAllSkills: 1005,
  canViewLearning: 1006,
  canEditOwnLearning: 1007,
  canEditTeamLearning: 1008,
  canEditAllLearning: 1009,
  canViewReports: 1010,
  canManageTeam: 1011,
  canManageSystem: 1012,
  canManageUsers: 1013,
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

export function getPermissionCode(permission: Permission): PermissionCode {
  return PERMISSION_CODES[permission];
}

export function getPermission(permissionCode: PermissionCode): Permission {
  return Object.keys(PERMISSION_CODES).find(
    key => PERMISSION_CODES[key as Permission] === permissionCode,
  ) as Permission;
}
