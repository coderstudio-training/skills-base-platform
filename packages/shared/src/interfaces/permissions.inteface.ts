import { Permission } from '../constants/permissions.constant';
export interface PermissionContext {
  userId: string;
  targetId?: string;
  teamId?: string;
  permissions: Permission[];
}
