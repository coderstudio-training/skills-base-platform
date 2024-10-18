import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const logger = {
  log: (...args: any[]): void => console.log('[NextAuth]', ...args),
  error: (...args: any[]): void => console.error('[NextAuth Error]', ...args),
  warn: (...args: any[]): void => console.warn('[NextAuth Warning]', ...args),
  debug: (...args: any[]): void => console.debug('[NextAuth Debug]', ...args),
};
