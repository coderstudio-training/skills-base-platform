import { Permission } from './types';

export const PERMISSION_CODES = {
  VIEW_DASHBOARD: 1001,
  VIEW_SKILLS: 1002,
  EDIT_OWN_SKILLS: 1003,
  EDIT_TEAM_SKILLS: 1004,
  EDIT_ALL_SKILLS: 1005,
  VIEW_LEARNING: 1006,
  EDIT_OWN_LEARNING: 1007,
  EDIT_TEAM_LEARNING: 1008,
  EDIT_ALL_LEARNING: 1009,
  VIEW_REPORTS: 1010,
  MANAGE_TEAM: 1011,
  MANAGE_SYSTEM: 1012,
  MANAGE_USERS: 1013,
} as const;

const CODE_TO_PERMISSION: Record<number, Permission> = {
  [PERMISSION_CODES.VIEW_DASHBOARD]: 'canViewDashboard',
  [PERMISSION_CODES.VIEW_SKILLS]: 'canViewSkills',
  [PERMISSION_CODES.EDIT_OWN_SKILLS]: 'canEditOwnSkills',
  [PERMISSION_CODES.EDIT_TEAM_SKILLS]: 'canEditTeamSkills',
  [PERMISSION_CODES.EDIT_ALL_SKILLS]: 'canEditAllSkills',
  [PERMISSION_CODES.VIEW_LEARNING]: 'canViewLearning',
  [PERMISSION_CODES.EDIT_OWN_LEARNING]: 'canEditOwnLearning',
  [PERMISSION_CODES.EDIT_TEAM_LEARNING]: 'canEditTeamLearning',
  [PERMISSION_CODES.EDIT_ALL_LEARNING]: 'canEditAllLearning',
  [PERMISSION_CODES.VIEW_REPORTS]: 'canViewReports',
  [PERMISSION_CODES.MANAGE_TEAM]: 'canManageTeam',
  [PERMISSION_CODES.MANAGE_SYSTEM]: 'canManageSystem',
  [PERMISSION_CODES.MANAGE_USERS]: 'canManageUsers',
};

export function mapCodesToPermissions(codes: number[]): Permission[] {
  return codes.map(code => CODE_TO_PERMISSION[code]).filter(Boolean);
}
