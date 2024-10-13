// src/interfaces/user.interface.ts
import { UserRole } from '../constants/roles.constant';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}
