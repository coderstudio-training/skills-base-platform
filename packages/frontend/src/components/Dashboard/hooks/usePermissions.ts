import { mapCodesToPermissions } from '@/lib/api/permissionMapping';
import { Permission } from '@/lib/api/types';
import { logger } from '@/lib/utils/logger';
import { jwtDecode } from 'jwt-decode';
import { useSession } from 'next-auth/react';

interface DecodedToken {
  perms: number[];
  exp: number;
  iat: number;
  sub: string;
  email: string;
}

export function usePermissions() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  let permissions: Permission[] = [];

  if (accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      permissions = mapCodesToPermissions(decoded.perms || []);
    } catch (error) {
      logger.error('Error decoding JWT token:' + error);
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  return { hasPermission, permissions };
}
