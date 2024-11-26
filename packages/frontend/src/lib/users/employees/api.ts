import { userApi } from '@/lib/api/client';
import { ApiClientOptions } from '@/lib/api/types';
import { TeamMember } from '@/lib/users/employees/types';
import { logger } from '@/lib/utils';

const EMPLOYEES_BASE_URL = '/employees';

export async function getTeamMembers(
  managerName: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[EMPLOYEES] Fetching ${managerName}'s team members!`);
  return userApi.get<TeamMember[]>(
    `${EMPLOYEES_BASE_URL}/manager/${encodeURIComponent(managerName)}`,
    options,
  );
}
