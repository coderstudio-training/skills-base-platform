import { userApi } from '@/lib/api/client';
import { ApiClientOptions } from '@/lib/api/types';
import { Picture } from '@/lib/users/types';
import { logger } from '@/lib/utils/logger';

const USER_BASE_URL = '/users';

export async function getUserPicture(
  userEmail: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.info(`[USERS] Fetching ${userEmail}'s photo`);
  return userApi.get<Picture>(`${USER_BASE_URL}/picture/${encodeURIComponent(userEmail)}`, options);
}
