import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type LogArgs =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | object
  | unknown;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logger = {
  log: (...args: LogArgs[]): void => console.log('[NextAuth]', ...args),
  error: (...args: LogArgs[]): void =>
    console.error('[NextAuth Error]', ...args),
  warn: (...args: LogArgs[]): void =>
    console.warn('[NextAuth Warning]', ...args),
  debug: (...args: LogArgs[]): void =>
    console.debug('[NextAuth Debug]', ...args),
};
