import { userApi } from '../api/client';
import { ApiClientOptions } from '../api/types';
import { logger } from '../utils';

const USER_BASE_URL = '/users';

export async function getUserPicture(
  userEmail: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[USERS] Fetching ${userEmail}'s photo`);
  return userApi.get<{ picture: string }>(
    `${USER_BASE_URL}/picture/${encodeURIComponent(userEmail)}`,
    options,
  );
}
