import { PERMISSION_CODES, PermissionCode } from './permisssion-codes.constant';

export enum Permission {
  VIEW_DASHBOARD = 'canViewDashboard',
  VIEW_SKILLS = 'canViewSkills',
  EDIT_OWN_SKILLS = 'canEditOwnSkills',
  EDIT_TEAM_SKILLS = 'canEditTeamSkills',
  EDIT_ALL_SKILLS = 'canEditAllSkills',
  VIEW_LEARNING = 'canViewLearning',
  EDIT_OWN_LEARNING = 'canEditOwnLearning',
  EDIT_TEAM_LEARNING = 'canEditTeamLearning',
  EDIT_ALL_LEARNING = 'canEditAllLearning',
  VIEW_REPORTS = 'canViewReports',
  MANAGE_TEAM = 'canManageTeam',
  MANAGE_SYSTEM = 'canManageSystem',
  MANAGE_USERS = 'canManageUsers',
}

export const PERMISSION_TO_CODE: Record<Permission, PermissionCode> = {
  [Permission.VIEW_DASHBOARD]: PERMISSION_CODES.VIEW_DASHBOARD,
  [Permission.VIEW_SKILLS]: PERMISSION_CODES.VIEW_SKILLS,
  [Permission.EDIT_OWN_SKILLS]: PERMISSION_CODES.EDIT_OWN_SKILLS,
  [Permission.EDIT_TEAM_SKILLS]: PERMISSION_CODES.EDIT_TEAM_SKILLS,
  [Permission.EDIT_ALL_SKILLS]: PERMISSION_CODES.EDIT_ALL_SKILLS,
  [Permission.VIEW_LEARNING]: PERMISSION_CODES.VIEW_LEARNING,
  [Permission.EDIT_OWN_LEARNING]: PERMISSION_CODES.EDIT_OWN_LEARNING,
  [Permission.EDIT_TEAM_LEARNING]: PERMISSION_CODES.EDIT_TEAM_LEARNING,
  [Permission.EDIT_ALL_LEARNING]: PERMISSION_CODES.EDIT_ALL_LEARNING,
  [Permission.VIEW_REPORTS]: PERMISSION_CODES.VIEW_REPORTS,
  [Permission.MANAGE_TEAM]: PERMISSION_CODES.MANAGE_TEAM,
  [Permission.MANAGE_SYSTEM]: PERMISSION_CODES.MANAGE_SYSTEM,
  [Permission.MANAGE_USERS]: PERMISSION_CODES.MANAGE_USERS,
};
