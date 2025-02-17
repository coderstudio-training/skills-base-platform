import { usePermissions } from '@/components/Dashboard/hooks/usePermissions';
import { Permission } from '@/lib/api/types';
import { ReactNode } from 'react';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}
